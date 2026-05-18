import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  developer: String,
  rera: {
    number: String,
    licenseNo: String
  },
  area: String,
  location: {
    sector: String,
    city: String,
    address: String,
    state: String,
    mapLink: String
  },
  totalFloors: Number, 
  configurations: [
    {
      type: { type: String },
      bedrooms: Number,
      bathrooms: Number,
      balconies: Number,
      sizes: [Number]
    }
  ],
  pricingMeta: {
    minPrice: Number,
    maxPrice: Number,
    pricePerSqft: Number
  },
  availability: {
    status: {
      type: String,
      enum: ['ready_to_move', 'under_construction'],
      default: 'ready_to_move'
    }
  },
  connectivity: [{
    name: String,
    distance: String
  }],
  landmarks: [{
    name: String,
    distance: String,
    type: String
  }],
  features: {
    usp: [String]
  },
  amenities: {
    sports: [String],
    family: [String],
    safety: [String],
    environment: [String]
  },
  media: {
    images: [String]
  },
  meta: {
    featured: { type: Boolean, default: false },
    liveStatus: { type: String, default: 'active', enum: ['active', 'inactive'] }
  },
  liveStatus: { type: String, default: 'active' }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);