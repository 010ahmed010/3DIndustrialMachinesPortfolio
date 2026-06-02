import express from 'express';
import { query } from '../utils/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const [totalMods, pendingMods, allMods, unreadMsg, totalMsg, engagement, recentUploads, recentMsgs] = await Promise.all([
      query("SELECT COUNT(*) FROM modules WHERE status='published'"),
      query("SELECT COUNT(*) FROM modules WHERE status='pending'"),
      query("SELECT COUNT(*) FROM modules"),
      query("SELECT COUNT(*) FROM contacts WHERE status='unread'"),
      query("SELECT COUNT(*) FROM contacts"),
      query("SELECT COALESCE(SUM(likes),0) as total_likes, COALESCE(SUM(dislikes),0) as total_dislikes, COALESCE(SUM(views),0) as total_views FROM modules WHERE status='published'"),
      query("SELECT * FROM modules ORDER BY created_at DESC LIMIT 5"),
      query("SELECT * FROM contacts ORDER BY created_at DESC LIMIT 5"),
    ]);

    const e = engagement.rows[0];
    const toMod = (r) => ({ _id: r.id, titleAr: r.title_ar, category: r.category, status: r.status, thumbnailUrl: r.thumbnail_url, createdAt: r.created_at, likes: r.likes, dislikes: r.dislikes, views: r.views });
    const toMsg = (r) => ({ _id: r.id, name: r.name, message: r.message, status: r.status, createdAt: r.created_at });

    res.json({
      totalModules: parseInt(totalMods.rows[0].count),
      pendingModules: parseInt(pendingMods.rows[0].count),
      totalModulesAll: parseInt(allMods.rows[0].count),
      unreadMessages: parseInt(unreadMsg.rows[0].count),
      totalMessages: parseInt(totalMsg.rows[0].count),
      totalLikes: parseInt(e.total_likes),
      totalDislikes: parseInt(e.total_dislikes),
      totalViews: parseInt(e.total_views),
      recentUploads: recentUploads.rows.map(toMod),
      recentMessages: recentMsgs.rows.map(toMsg),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
