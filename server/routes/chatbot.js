import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function tokenize(s) {
  return normalize(s).split(' ').filter(w => w.length > 2);
}

function scoreQuestion(input, faq) {
  const inTokens = tokenize(input);
  if (inTokens.length === 0) return 0;
  const faqTokens = tokenize(faq.question);
  const matchCount = inTokens.filter(t => faqTokens.includes(t)).length;
  return matchCount / Math.max(inTokens.length, faqTokens.length);
}

function findBestMatch(input, faqs) {
  let best = null;
  let bestScore = 0;
  for (const faq of faqs) {
    const s = scoreQuestion(input, faq);
    if (s > bestScore) {
      bestScore = s;
      best = faq;
    }
  }
  return bestScore >= 0.3 ? best : null;
}

router.post('/ask', async (req, res) => {
  try {
    const { question, name, email, phone } = req.body;
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const db = getDb();
    const faqs = db.prepare('SELECT * FROM chatbot_faq').all();
    const match = findBestMatch(question, faqs);

    if (match) {
      return res.json({ answer: match.answer, matched: true, faqId: match.id });
    }

    const id = uuid();
    db.prepare(
      'INSERT INTO chatbot_logs (id, question, contact_name, contact_email, contact_phone, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, question.trim(), name || null, email || null, phone || null, 'unanswered');

    res.json({
      answer: 'I don\'t have an answer for that yet. Your question has been logged and an admin will respond soon.',
      matched: false,
      logId: id,
    });
  } catch (err) {
    console.error('Chatbot ask error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/faq', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const db = getDb();
  const faqs = db.prepare('SELECT * FROM chatbot_faq ORDER BY category, question').all();
  res.json({ faqs });
});

router.post('/faq/seed', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const db = getDb();
  const { faqs } = req.body;
  if (!Array.isArray(faqs) || faqs.length === 0) {
    return res.status(400).json({ error: 'faqs array is required' });
  }
  const existing = db.prepare('SELECT COUNT(*) as count FROM chatbot_faq').get();
  if (existing.count > 0) {
    return res.json({ message: 'FAQ already seeded', count: existing.count });
  }
  const insert = db.prepare(
    'INSERT INTO chatbot_faq (id, question, answer, category) VALUES (?, ?, ?, ?)'
  );
  for (const faq of faqs) {
    insert.run(faq.id || uuid(), faq.question, faq.answer, faq.category || 'general');
  }
  res.json({ message: `Seeded ${faqs.length} FAQ entries` });
});

router.post('/faq', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { question, answer, category } = req.body;
  if (!question || !answer) return res.status(400).json({ error: 'Question and answer are required' });
  const db = getDb();
  const id = uuid();
  db.prepare(
    'INSERT INTO chatbot_faq (id, question, answer, category) VALUES (?, ?, ?, ?)'
  ).run(id, question, answer, category || 'general');
  res.status(201).json({ id, question, answer, category: category || 'general' });
});

router.put('/faq/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { question, answer, category } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT id FROM chatbot_faq WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'FAQ not found' });

  db.prepare(
    'UPDATE chatbot_faq SET question = COALESCE(?, question), answer = COALESCE(?, answer), category = COALESCE(?, category), updated_at = datetime(\'now\') WHERE id = ?'
  ).run(question || null, answer || null, category || null, req.params.id);
  res.json({ message: 'FAQ updated' });
});

router.delete('/faq/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const db = getDb();
  db.prepare('DELETE FROM chatbot_faq WHERE id = ?').run(req.params.id);
  res.json({ message: 'FAQ deleted' });
});

router.get('/logs', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const db = getDb();
  const { status } = req.query;
  let rows;
  if (status) {
    rows = db.prepare('SELECT * FROM chatbot_logs WHERE status = ? ORDER BY created_at DESC').all(status);
  } else {
    rows = db.prepare('SELECT * FROM chatbot_logs ORDER BY created_at DESC').all();
  }
  res.json({ logs: rows });
});

router.patch('/logs/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { status, answer } = req.body;
  const db = getDb();
  db.prepare(
    'UPDATE chatbot_logs SET status = COALESCE(?, status), answer = COALESCE(?, answer) WHERE id = ?'
  ).run(status || null, answer || null, req.params.id);
  res.json({ message: 'Log updated' });
});

router.get('/logs/export', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const db = getDb();
  const rows = db.prepare(
    "SELECT question, contact_name, contact_email, contact_phone, status, created_at FROM chatbot_logs WHERE status = 'unanswered' ORDER BY created_at DESC"
  ).all();

  const header = 'Question,Contact Name,Contact Email,Contact Phone,Status,Asked At\n';
  const csv = header + rows.map(r => {
    const q = `"${(r.question || '').replace(/"/g, '""')}"`;
    const n = `"${(r.contact_name || '').replace(/"/g, '""')}"`;
    const e = `"${(r.contact_email || '').replace(/"/g, '""')}"`;
    const p = `"${(r.contact_phone || '').replace(/"/g, '""')}"`;
    return `${q},${n},${e},${p},${r.status},${r.created_at}`;
  }).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="chatbot_unanswered_questions.csv"');
  res.send(csv);
});

export default router;
