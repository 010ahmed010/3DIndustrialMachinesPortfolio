import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import Admin from '../models/Admin.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    let admin = await Admin.findOne({ username });

    if (!admin) {
      const count = await Admin.countDocuments();
      if (count === 0) {
        const hashed = await bcrypt.hash(password, 12);
        admin = await Admin.create({ username, password: hashed, email: '' });
      } else {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    const match = await bcrypt.compare(password, admin.password);
    const loginEntry = { timestamp: new Date(), ip: req.ip, device: req.headers['user-agent']?.substring(0, 100), success: match };
    admin.loginHistory = [...(admin.loginHistory || []).slice(-49), loginEntry];
    await admin.save();

    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET || 'dev_secret_change_in_prod', { expiresIn: '24h' });
    res.json({ token, admin: { id: admin._id, username: admin.username, email: admin.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password -passwordHistory -sessions');
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin.id);
    const match = await bcrypt.compare(currentPassword, admin.password);
    if (!match) return res.status(400).json({ error: 'Current password incorrect' });
    if (newPassword.length < 12) return res.status(400).json({ error: 'Password must be at least 12 characters' });
    const hashed = await bcrypt.hash(newPassword, 12);
    admin.passwordHistory = [...(admin.passwordHistory || []).slice(-4), admin.password];
    admin.password = hashed;
    await admin.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
