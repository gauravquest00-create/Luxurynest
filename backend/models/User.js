import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'Admin User' },
  phone: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin', enum: ['admin'] }
}, { timestamps: true });

export default mongoose.model('User', userSchema);