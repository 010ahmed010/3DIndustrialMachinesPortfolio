import express from 'express';
import Module from '../models/Module.js';
import Contact from '../models/Contact.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const [
      totalModules, pendingModules, totalModulesAll,
      unreadMessages, totalMessages,
      engagementAgg, recentUploads, recentMessages
    ] = await Promise.all([
      Module.countDocuments({ status: 'published' }),
      Module.countDocuments({ status: 'pending' }),
      Module.countDocuments(),
      Contact.countDocuments({ status: 'unread' }),
      Contact.countDocuments(),
      Module.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: null, totalLikes: { $sum: '$likes' }, totalDislikes: { $sum: '$dislikes' }, totalViews: { $sum: '$views' } } }
      ]),
      Module.find().sort({ createdAt: -1 }).limit(5).select('titleAr category status thumbnailUrl createdAt likes dislikes views'),
      Contact.find().sort({ createdAt: -1 }).limit(5).select('name message status createdAt'),
    ]);

    const eng = engagementAgg[0] || { totalLikes: 0, totalDislikes: 0, totalViews: 0 };

    res.json({
      totalModules,
      pendingModules,
      totalModulesAll,
      unreadMessages,
      totalMessages,
      totalLikes: eng.totalLikes,
      totalDislikes: eng.totalDislikes,
      totalViews: eng.totalViews,
      recentUploads,
      recentMessages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
