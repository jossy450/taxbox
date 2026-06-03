import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';
import { signToken, authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, company } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);
    const id = uuid();
    db.prepare(
      'INSERT INTO users (id, email, name, password, role, company) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, email, name, hash, role || 'individual', company || null);

    const user = { id, email, name, role: role || 'individual', company: company || null };
    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDb();
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!row) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!row.password) {
      return res.status(401).json({ error: 'This account uses Google sign-in. Please sign in with Google.' });
    }

    const valid = await bcrypt.compare(password, row.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = { id: row.id, email: row.email, name: row.name, role: row.role, company: row.company };
    const token = signToken(user);
    res.json({ user, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { email, name, googleId } = req.body;

    if (!email || !name || !googleId) {
      return res.status(400).json({ error: 'Email, name, and googleId are required' });
    }

    const db = getDb();
    let row = db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
    if (!row) {
      row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (row) {
        db.prepare('UPDATE users SET google_id = ? WHERE id = ?').run(googleId, row.id);
      }
    }

    if (!row) {
      const id = uuid();
      db.prepare(
        'INSERT INTO users (id, email, name, role, google_id) VALUES (?, ?, ?, ?, ?)'
      ).run(id, email, name, 'individual', googleId);
      row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }

    const user = { id: row.id, email: row.email, name: row.name, role: row.role, company: row.company };
    const token = signToken(user);
    res.json({ user, token });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT id, email, name, role, company, avatar, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!row) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user: row });
});

export default router;
