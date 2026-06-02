import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../utils/db.js';
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

const toModule = (row) => row ? {
  _id: row.id,
  id: row.id,
  titleAr: row.title_ar,
  titleEn: row.title_en,
  descriptionAr: row.description_ar,
  descriptionEn: row.description_en,
  category: row.category,
  designer: row.designer,
  modelFile: row.model_file,
  modelFormat: row.model_format,
  thumbnailUrl: row.thumbnail_url,
  sketches: row.sketches || [],
  materials: row.materials,
  specifications: row.specifications,
  features: row.features,
  status: row.status,
  likes: row.likes || 0,
  dislikes: row.dislikes || 0,
  views: row.views || 0,
  softwareVersion: row.software_version,
  partsCount: row.parts_count,
  projectType: row.project_type,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
} : null;

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, status = 'published', search } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let where = [];
    let idx = 1;

    if (status) { where.push(`status = $${idx++}`); params.push(status); }
    if (category) { where.push(`category = $${idx++}`); params.push(category); }
    if (search) {
      where.push(`(title_ar ILIKE $${idx} OR title_en ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const countRes = await query(`SELECT COUNT(*) FROM modules ${whereClause}`, params);
    const total = parseInt(countRes.rows[0].count);

    const dataRes = await query(
      `SELECT * FROM modules ${whereClause} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx+1}`,
      [...params, Number(limit), Number(offset)]
    );

    res.json({
      modules: dataRes.rows.map(toModule),
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/all', protect, async (req, res) => {
  try {
    const result = await query('SELECT * FROM modules ORDER BY created_at DESC');
    res.json({ modules: result.rows.map(toModule) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM modules WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Module not found' });
    await query('UPDATE modules SET views = views + 1 WHERE id = $1', [req.params.id]);
    const mod = toModule(result.rows[0]);
    mod.views = (mod.views || 0) + 1;
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
    let modelFile = null, modelFormat = null;
    let sketches = [];

    if (req.files?.modelFile?.[0]) {
      modelFile = '/uploads/models/' + req.files.modelFile[0].filename;
      modelFormat = req.files.modelFile[0].originalname.split('.').pop().toLowerCase();
    }
    if (req.files?.sketches) {
      sketches = req.files.sketches.map(f => '/uploads/sketches/' + f.filename);
    }

    const result = await query(
      `INSERT INTO modules (title_ar, title_en, description_ar, description_en, category, designer, model_file, model_format, sketches, materials, specifications, features, status, software_version, parts_count, project_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [titleAr, titleEn, descriptionAr, descriptionEn, category, designer, modelFile, modelFormat, sketches, materials, specifications, features, status || 'pending', softwareVersion, partsCount ? parseInt(partsCount) : null, projectType]
    );

    await query(
      `UPDATE admins SET audit_log = audit_log || $1::jsonb WHERE id = $2`,
      [JSON.stringify([{ action: 'upload_module', detail: `Uploaded: ${titleEn}`, timestamp: new Date() }]), req.admin.id]
    );

    res.status(201).json(toModule(result.rows[0]));
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
    const existing = await query('SELECT * FROM modules WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Not found' });

    let modelFile = existing.rows[0].model_file;
    let modelFormat = existing.rows[0].model_format;
    let sketches = existing.rows[0].sketches || [];

    if (req.files?.modelFile?.[0]) {
      modelFile = '/uploads/models/' + req.files.modelFile[0].filename;
      modelFormat = req.files.modelFile[0].originalname.split('.').pop().toLowerCase();
    }
    if (req.files?.sketches) {
      sketches = req.files.sketches.map(f => '/uploads/sketches/' + f.filename);
    }

    const result = await query(
      `UPDATE modules SET title_ar=$1,title_en=$2,description_ar=$3,description_en=$4,category=$5,designer=$6,model_file=$7,model_format=$8,sketches=$9,materials=$10,specifications=$11,features=$12,status=$13,software_version=$14,parts_count=$15,project_type=$16,updated_at=NOW()
       WHERE id=$17 RETURNING *`,
      [titleAr, titleEn, descriptionAr, descriptionEn, category, designer, modelFile, modelFormat, sketches, materials, specifications, features, status, softwareVersion, partsCount ? parseInt(partsCount) : null, projectType, req.params.id]
    );
    res.json(toModule(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await query('DELETE FROM modules WHERE id = $1', [req.params.id]);
    res.json({ message: 'Module deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
    const result = await query('UPDATE modules SET likes = likes + 1 WHERE id = $1 RETURNING likes, dislikes', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/dislike', async (req, res) => {
  try {
    const result = await query('UPDATE modules SET dislikes = dislikes + 1 WHERE id = $1 RETURNING likes, dislikes', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
