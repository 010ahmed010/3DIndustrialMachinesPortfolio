import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String },
  fullNameAr: { type: String },
  fullNameEn: { type: String },
  phone: { type: String },
  profilePicture: { type: String },
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  passwordHistory: [{ type: String }],
  notifications: {
    newContact: { type: Boolean, default: true },
    newUpload: { type: Boolean, default: true },
    systemAlerts: { type: Boolean, default: true },
    frequency: { type: String, default: 'immediate' }
  },
  preferences: {
    dashboardRefresh: { type: String, default: '60' },
    timezone: { type: String, default: 'Asia/Riyadh' },
    auditRetention: { type: String, default: '90' }
  },
  loginHistory: [{
    timestamp: Date,
    ip: String,
    device: String,
    success: Boolean
  }],
  auditLog: [{
    action: String,
    detail: String,
    timestamp: { type: Date, default: Date.now }
  }],
  sessions: [{ token: String, createdAt: Date, device: String }]
}, { timestamps: true });

export default mongoose.model('Admin', adminSchema);
