import express from 'express';
import { query } from '../utils/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/settings', protect, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, username, email, full_name_ar, full_name_en, phone, two_factor_enabled, notifications, preferences FROM admins WHERE id = $1',
      [req.admin.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings', protect, async (req, res) => {
  try {
    const { fullNameAr, fullNameEn, email, phone, notifications, preferences } = req.body;
    const result = await query(
      `UPDATE admins SET full_name_ar=$1, full_name_en=$2, email=$3, phone=$4,
       notifications=$5, preferences=$6, updated_at=NOW() WHERE id=$7
       RETURNING id, username, email, full_name_ar, full_name_en, phone, notifications, preferences`,
      [fullNameAr, fullNameEn, email, phone, JSON.stringify(notifications), JSON.stringify(preferences), req.admin.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/audit-log', protect, async (req, res) => {
  try {
    const result = await query('SELECT audit_log FROM admins WHERE id = $1', [req.admin.id]);
    res.json(result.rows[0]?.audit_log || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/login-history', protect, async (req, res) => {
  try {
    const result = await query('SELECT login_history FROM admins WHERE id = $1', [req.admin.id]);
    res.json(result.rows[0]?.login_history || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
