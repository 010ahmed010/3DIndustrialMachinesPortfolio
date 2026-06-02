import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { query } from '../utils/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    let result = await query('SELECT * FROM admins WHERE username = $1', [username]);
    let admin = result.rows[0];

    if (!admin) {
      const countRes = await query('SELECT COUNT(*) FROM admins');
      if (parseInt(countRes.rows[0].count) === 0) {
        const hashed = await bcrypt.hash(password, 12);
        const newAdmin = await query(
          'INSERT INTO admins (username, password, email, login_history, audit_log) VALUES ($1,$2,$3,$4,$5) RETURNING *',
          [username, hashed, '', JSON.stringify([]), JSON.stringify([])]
        );
        admin = newAdmin.rows[0];
      } else {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    const match = await bcrypt.compare(password, admin.password);
    const loginEntry = { timestamp: new Date(), ip: req.ip, device: req.headers['user-agent']?.substring(0, 100), success: match };
    const history = Array.isArray(admin.login_history) ? admin.login_history : [];
    await query('UPDATE admins SET login_history = $1 WHERE id = $2', [JSON.stringify([...history.slice(-49), loginEntry]), admin.id]);

    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET || 'dev_secret_change_in_prod', { expiresIn: '24h' });
    res.json({ token, admin: { id: admin.id, username: admin.username, email: admin.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const result = await query('SELECT id, username, email, full_name_ar, full_name_en, phone, two_factor_enabled, notifications, preferences FROM admins WHERE id = $1', [req.admin.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await query('SELECT * FROM admins WHERE id = $1', [req.admin.id]);
    const admin = result.rows[0];
    const match = await bcrypt.compare(currentPassword, admin.password);
    if (!match) return res.status(400).json({ error: 'Current password incorrect' });
    if (newPassword.length < 12) return res.status(400).json({ error: 'Password must be at least 12 characters' });
    const hashed = await bcrypt.hash(newPassword, 12);
    const history = Array.isArray(admin.password_history) ? admin.password_history : [];
    await query('UPDATE admins SET password = $1, password_history = $2 WHERE id = $3', [hashed, [...history.slice(-4), admin.password], admin.id]);
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
