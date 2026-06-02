import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  titleAr: { type: String, required: true },
  titleEn: { type: String, required: true },
  descriptionAr: { type: String, required: true },
  descriptionEn: { type: String, required: true },
  category: { type: String, required: true },
  designer: { type: String, required: true },
  modelFile: { type: String },
  modelFormat: { type: String, enum: ['glb', 'gltf', 'stl', 'obj', 'fbx'] },
  thumbnailUrl: { type: String },
  sketches: [{ type: String }],
  materials: { type: String },
  specifications: { type: String },
  features: { type: String },
  status: { type: String, enum: ['pending', 'published', 'unpublished'], default: 'pending' },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  softwareVersion: { type: String },
  partsCount: { type: Number },
  projectType: { type: String }
}, { timestamps: true });

export default mongoose.model('Module', moduleSchema);
