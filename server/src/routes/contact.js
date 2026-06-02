import express from 'express';
import rateLimit from 'express-rate-limit';
import { query } from '../utils/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });

const toContact = (row) => row ? {
  _id: row.id, id: row.id,
  name: row.name, email: row.email,
  subject: row.subject, message: row.message,
  status: row.status, reply: row.reply,
  repliedAt: row.replied_at,
  createdAt: row.created_at, updatedAt: row.updated_at,
} : null;

router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'Name, email, and message are required' });
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) return res.status(400).json({ error: 'Invalid email' });
    const result = await query(
      'INSERT INTO contacts (name, email, subject, message) VALUES ($1,$2,$3,$4) RETURNING *',
      [name.substring(0,255), email.substring(0,255), subject?.substring(0,500), message.substring(0,5000)]
    );
    res.status(201).json({ message: 'Message sent successfully', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const result = await query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(result.rows.map(toContact));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', protect, async (req, res) => {
  try {
    const result = await query('UPDATE contacts SET status = $1 WHERE id = $2 RETURNING *', [req.body.status, req.params.id]);
    res.json(toContact(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/reply', protect, async (req, res) => {
  try {
    const result = await query(
      'UPDATE contacts SET reply = $1, replied_at = NOW(), status = $2 WHERE id = $3 RETURNING *',
      [req.body.reply, 'resolved', req.params.id]
    );
    res.json(toContact(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await query('DELETE FROM contacts WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
