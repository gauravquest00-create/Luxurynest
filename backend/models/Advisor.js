import mongoose from 'mongoose';

const advisorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: 'Real Estate Advisor' },
  image: String,
  phone: { type: String, required: true },
  email: { type: String, required: true },
  specialization: [String]
}, { timestamps: true });

export default mongoose.model('Advisor', advisorSchema);