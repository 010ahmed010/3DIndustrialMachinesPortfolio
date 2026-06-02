import express from 'express';
import { query } from '../utils/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const toProfile = (row) => row ? {
  _id: row.id, id: row.id,
  fullNameAr: row.full_name_ar,
  fullNameEn: row.full_name_en,
  professionAr: row.profession_ar,
  professionEn: row.profession_en,
  phone: row.phone,
  whatsapp: row.whatsapp,
  linkedin: row.linkedin,
  email: row.email,
  bioAr: row.bio_ar,
  bioEn: row.bio_en,
  photo: row.photo,
  contactFormEnabled: row.contact_form_enabled,
  autoReplyMessage: row.auto_reply_message,
} : null;

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM profiles WHERE id = 1');
    if (!result.rows[0]) {
      await query('INSERT INTO profiles (id) VALUES (1) ON CONFLICT DO NOTHING');
      const r2 = await query('SELECT * FROM profiles WHERE id = 1');
      return res.json(toProfile(r2.rows[0]));
    }
    res.json(toProfile(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', protect, async (req, res) => {
  try {
    const { fullNameAr, fullNameEn, professionAr, professionEn, phone, whatsapp, linkedin, email, bioAr, bioEn, photo, contactFormEnabled, autoReplyMessage } = req.body;
    const result = await query(
      `UPDATE profiles SET full_name_ar=$1, full_name_en=$2, profession_ar=$3, profession_en=$4,
       phone=$5, whatsapp=$6, linkedin=$7, email=$8, bio_ar=$9, bio_en=$10,
       photo=$11, contact_form_enabled=$12, auto_reply_message=$13, updated_at=NOW()
       WHERE id=1 RETURNING *`,
      [fullNameAr, fullNameEn, professionAr, professionEn, phone, whatsapp, linkedin, email, bioAr, bioEn, photo, contactFormEnabled !== false, autoReplyMessage]
    );
    res.json(toProfile(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
