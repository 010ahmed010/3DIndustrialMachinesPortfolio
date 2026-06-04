import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Module from '../models/Module.js';
import Admin from '../models/Admin.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'modelFile') cb(null, 'uploads/models/');
    else cb(null, 'uploads/sketches/');
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
    const { page = 1, limit = 12, category, status = 'published', search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.$or = [
      { titleAr: { $regex: search, $options: 'i' } },
      { titleEn: { $regex: search, $options: 'i' } },
    ];

    const total = await Module.countDocuments(filter);
    const modules = await Module.find(filter)
      .sort({ createdAt: -1 })
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

router.get('/:id', async (req, res) => {
  try {
    const mod = await Module.findById(req.params.id);
    if (!mod) return res.status(404).json({ error: 'Module not found' });
    mod.views = (mod.views || 0) + 1;
    await mod.save();
    res.json(mod);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', protect, upload.fields([
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

    const mod = await Module.create({
      titleAr, titleEn, descriptionAr, descriptionEn, category, designer,
      modelFile, modelFormat, sketches, materials, specifications, features,
      status: status || 'pending', softwareVersion,
      partsCount: partsCount ? parseInt(partsCount) : undefined,
      projectType,
    });

    await Admin.findByIdAndUpdate(req.admin.id, {
      $push: { auditLog: { action: 'upload_module', detail: `Uploaded: ${titleEn}`, timestamp: new Date() } }
    });

    res.status(201).json(mod);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', protect, upload.fields([
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

    Object.assign(existing, {
      titleAr, titleEn, descriptionAr, descriptionEn, category, designer,
      modelFile, modelFormat, sketches, materials, specifications, features,
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

router.delete('/:id', protect, async (req, res) => {
  try {
    await Module.findByIdAndDelete(req.params.id);
    res.json({ message: 'Module deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
    const mod = await Module.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    res.json({ likes: mod.likes, dislikes: mod.dislikes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/dislike', async (req, res) => {
  try {
    const mod = await Module.findByIdAndUpdate(req.params.id, { $inc: { dislikes: 1 } }, { new: true });
    res.json({ likes: mod.likes, dislikes: mod.dislikes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
