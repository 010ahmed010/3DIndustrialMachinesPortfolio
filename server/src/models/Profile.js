import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  fullNameAr: { type: String, default: 'أحمد الجاسم' },
  fullNameEn: { type: String, default: 'Ahmed Al-jassem' },
  professionAr: { type: String, default: 'مهندس ميكاترونكس' },
  professionEn: { type: String, default: 'Mechatronic Engineer' },
  phone: { type: String },
  whatsapp: { type: String },
  linkedin: { type: String },
  email: { type: String },
  bioAr: { type: String },
  bioEn: { type: String },
  photo: { type: String },
  contactFormEnabled: { type: Boolean, default: true },
  autoReplyMessage: { type: String }
}, { timestamps: true });

export default mongoose.model('Profile', profileSchema);
