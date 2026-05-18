import mongoose from 'mongoose';

const areaSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  city: { type: String },
  state: { type: String },
  microMarkets: [{ type: String }],
  tags: [{ type: String }],
  connectivity: [{ type: String }],
  areaKnowledge: {
    vibe: { type: String },
    socialInfra: { type: String },
    convenience: { type: String }
  },
  areaUsp: [{ type: String }],
  marketAnalysis: [{ type: String }],
  priceInsight: {
    averageRate: { type: String },
    rentalRange: { type: String },
    appreciationPotential: { type: String }
  },
  whyBestFor: {
    endUser: [{ type: String }],
    investment: [{ type: String }]
  },
  meta: {
    active: { type: Boolean, default: true }
  }
}, { timestamps: true });

export default mongoose.model('Area', areaSchema);