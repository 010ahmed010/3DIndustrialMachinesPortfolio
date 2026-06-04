import express from 'express';
import Admin from '../models/Admin.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/settings', protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password -passwordHistory -sessions -auditLog -loginHistory');
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings', protect, async (req, res) => {
  try {
    const { fullNameAr, fullNameEn, email, phone, notifications, preferences } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      req.admin.id,
      { fullNameAr, fullNameEn, email, phone, notifications, preferences },
      { new: true, select: '-password -passwordHistory -sessions -auditLog -loginHistory' }
    );
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/audit-log', protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('auditLog');
    res.json(admin?.auditLog || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/login-history', protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('loginHistory');
    res.json(admin?.loginHistory || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
