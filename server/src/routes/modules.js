import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import Module from '../models/Module.js';
import Admin from '../models/Admin.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_ROOT = process.env.UPLOADS_DIR || path.join(__dirname, '../../../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'modelFile') cb(null, path.join(UPLOADS_ROOT, 'models'));
    else cb(null, path.join(UPLOADS_ROOT, 'sketches'));
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'modelFile') {
      const allowed = ['.glb', '.gltf', '.stl', '.obj', '.fbx'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowed.includes(ext)) return cb(new Error('Invalid model format'));
    }
    cb(null, true);
  }
});

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, status = 'published', search, sort } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.$or = [
      { titleAr: { $regex: search, $options: 'i' } },
      { titleEn: { $regex: search, $options: 'i' } },
    ];

    const sortOrder = sort === 'likes' ? { likes: -1 } : { createdAt: -1 };

    const total = await Module.countDocuments(filter);
    const modules = await Module.find(filter)
      .sort(sortOrder)
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ modules, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/all', protect, async (req, res) => {
  try {
    const modules = await Module.find().sort({ createdAt: -1 });
    res.json({ modules });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const getVisitorIp = (req) =>
  (req.headers['x-forwarded-for']?.split(',')[0]?.trim()) || req.ip || 'unknown';

router.get('/:id', async (req, res) => {
  try {
    const mod = await Module.findById(req.params.id);
    if (!mod) return res.status(404).json({ error: 'Module not found' });
    mod.views = (mod.views || 0) + 1;
    await mod.save();
    const visitorIp = getVisitorIp(req);
    const userVote = mod.votes?.find(v => v.ip === visitorIp)?.vote || null;
    const modObj = mod.toObject();
    delete modObj.votes;
    res.json({ ...modObj, userVote });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const handleUpload = (fields) => (req, res, next) => {
  upload.fields(fields)(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

router.post('/', protect, handleUpload([
  { name: 'modelFile', maxCount: 1 },
  { name: 'sketches', maxCount: 10 }
]), async (req, res) => {
  try {
    const { titleAr, titleEn, descriptionAr, descriptionEn, category, designer, materials, specifications, features, softwareVersion, partsCount, projectType, status } = req.body;
    let modelFile = null, modelFormat = null, sketches = [];

    if (req.files?.modelFile?.[0]) {
      modelFile = '/uploads/models/' + req.files.modelFile[0].filename;
      modelFormat = req.files.modelFile[0].originalname.split('.').pop().toLowerCase();
    }
    if (req.files?.sketches) {
      sketches = req.files.sketches.map(f => '/uploads/sketches/' + f.filename);
    }

    const thumbnailUrl = sketches[0] || null;
    const mod = await Module.create({
      titleAr, titleEn, descriptionAr, descriptionEn, category, designer,
      modelFile, modelFormat, sketches, thumbnailUrl, materials, specifications, features,
      status: status || 'pending', softwareVersion,
      partsCount: partsCount ? parseInt(partsCount) : undefined,
      projectType,
    });

    await Admin.findByIdAndUpdate(req.admin.id, {
      $push: { auditLog: { action: 'upload_module', detail: `Uploaded: ${titleEn}`, timestamp: new Date() } }
    }).catch(() => {});

    res.status(201).json(mod);
  } catch (err) {
    console.error('Module create error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', protect, handleUpload([
  { name: 'modelFile', maxCount: 1 },
  { name: 'sketches', maxCount: 10 }
]), async (req, res) => {
  try {
    const { titleAr, titleEn, descriptionAr, descriptionEn, category, designer, materials, specifications, features, softwareVersion, partsCount, projectType, status } = req.body;
    const existing = await Module.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    let modelFile = existing.modelFile;
    let modelFormat = existing.modelFormat;
    let sketches = existing.sketches || [];

    if (req.files?.modelFile?.[0]) {
      modelFile = '/uploads/models/' + req.files.modelFile[0].filename;
      modelFormat = req.files.modelFile[0].originalname.split('.').pop().toLowerCase();
    }
    if (req.files?.sketches) {
      sketches = req.files.sketches.map(f => '/uploads/sketches/' + f.filename);
    }

    const thumbnailUrl = sketches[0] || existing.thumbnailUrl || null;
    Object.assign(existing, {
      titleAr, titleEn, descriptionAr, descriptionEn, category, designer,
      modelFile, modelFormat, sketches, thumbnailUrl, materials, specifications, features,
      status, softwareVersion,
      partsCount: partsCount ? parseInt(partsCount) : existing.partsCount,
      projectType,
    });
    await existing.save();
    res.json(existing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const deleteFile = (filePath) => {
  if (!filePath) return;
  const abs = path.join(UPLOADS_ROOT, filePath.replace(/^\/uploads\//, ''));
  fs.unlink(abs, () => {});
};

router.delete('/:id', protect, async (req, res) => {
  try {
    const mod = await Module.findById(req.params.id);
    if (!mod) return res.status(404).json({ error: 'Module not found' });

    deleteFile(mod.modelFile);
    deleteFile(mod.thumbnailUrl);
    if (Array.isArray(mod.sketches)) {
      mod.sketches.forEach(s => deleteFile(s));
    }

    await mod.deleteOne();
    res.json({ message: 'Module deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
    const visitorIp = getVisitorIp(req);
    const mod = await Module.findById(req.params.id);
    if (!mod) return res.status(404).json({ error: 'Not found' });

    const existingIdx = mod.votes.findIndex(v => v.ip === visitorIp);
    const existingVote = existingIdx >= 0 ? mod.votes[existingIdx].vote : null;
    let userVote = null;

    if (existingVote === 'liked') {
      mod.votes.splice(existingIdx, 1);
      mod.likes = Math.max(0, mod.likes - 1);
      userVote = null;
    } else if (existingVote === 'disliked') {
      mod.votes[existingIdx].vote = 'liked';
      mod.likes += 1;
      mod.dislikes = Math.max(0, mod.dislikes - 1);
      userVote = 'liked';
    } else {
      mod.votes.push({ ip: visitorIp, vote: 'liked' });
      mod.likes += 1;
      userVote = 'liked';
    }

    await mod.save();
    res.json({ likes: mod.likes, dislikes: mod.dislikes, userVote });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/dislike', async (req, res) => {
  try {
    const visitorIp = getVisitorIp(req);
    const mod = await Module.findById(req.params.id);
    if (!mod) return res.status(404).json({ error: 'Not found' });

    const existingIdx = mod.votes.findIndex(v => v.ip === visitorIp);
    const existingVote = existingIdx >= 0 ? mod.votes[existingIdx].vote : null;
    let userVote = null;

    if (existingVote === 'disliked') {
      mod.votes.splice(existingIdx, 1);
      mod.dislikes = Math.max(0, mod.dislikes - 1);
      userVote = null;
    } else if (existingVote === 'liked') {
      mod.votes[existingIdx].vote = 'disliked';
      mod.dislikes += 1;
      mod.likes = Math.max(0, mod.likes - 1);
      userVote = 'disliked';
    } else {
      mod.votes.push({ ip: visitorIp, vote: 'disliked' });
      mod.dislikes += 1;
      userVote = 'disliked';
    }

    await mod.save();
    res.json({ likes: mod.likes, dislikes: mod.dislikes, userVote });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
