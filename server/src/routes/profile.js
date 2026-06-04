import express from 'express';
import Profile from '../models/Profile.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) profile = await Profile.create({});
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', protect, async (req, res) => {
  try {
    const { fullNameAr, fullNameEn, professionAr, professionEn, phone, whatsapp, linkedin, email, bioAr, bioEn, photo, contactFormEnabled, autoReplyMessage } = req.body;
    let profile = await Profile.findOne();
    if (!profile) profile = new Profile();
    Object.assign(profile, { fullNameAr, fullNameEn, professionAr, professionEn, phone, whatsapp, linkedin, email, bioAr, bioEn, photo, contactFormEnabled: contactFormEnabled !== false, autoReplyMessage });
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
