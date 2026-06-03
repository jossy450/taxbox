import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';

const router = Router();

router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const db = getDb();
    const user = db.prepare('SELECT id, email, name FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(404).json({ error: 'No account found with that email' });
    }

    const token = uuid().replace(/-/g, '').slice(0, 24);
    const expiresAt = Date.now() + 60 * 60 * 1000;

    db.prepare(
      'INSERT INTO reset_tokens (id, email, token, expires_at) VALUES (?, ?, ?, ?)'
    ).run(uuid(), email, token, expiresAt);

    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;
    console.log(`\n  [PASSWORD RESET] ${user.email}`);
    console.log(`  Link: ${resetUrl}`);
    console.log(`  Token: ${token}\n`);

    res.json({
      success: true,
      message: 'If an account exists with that email, a reset link has been sent.',
      token,
      resetUrl,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/reset', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const db = getDb();
    const row = db.prepare(
      'SELECT * FROM reset_tokens WHERE token = ? AND used = 0'
    ).get(token);

    if (!row) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    if (Date.now() > row.expires_at) {
      return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });
    }

    const hash = await bcrypt.hash(password, 10);
    db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hash, row.email);
    db.prepare('UPDATE reset_tokens SET used = 1 WHERE token = ?').run(token);

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
