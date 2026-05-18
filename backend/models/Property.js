import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // optional for builder floor/plot
  
  // 🔥 NEW: purpose of the listing (sell or rent)
  purpose: { type: String, enum: ['sell', 'rent'], required: true },
  
  // Property type (apartment, builderfloor, plot)
  propertyType: { type: String, enum: ['apartment', 'builderfloor', 'plot'], required: true },
  
  // Unit details – now `type` inside unitDetails should align with purpose
  unitDetails: {
    bedrooms: { type: mongoose.Schema.Types.Mixed },
    bathrooms: Number,
    sqft: Number,                // for apartment (square feet)
    size: Number,                // for builder floor/plot (square yards)
    sizeUnit: { type: String, default: 'sqyd' },
    totalFloors: Number,
    floorNumber: Number,
    buildingStructure: String,
    floor: String,
    facing: String,
    furnishing: String,
    age: String,
    price: { type: String, required: true },
    priceValue: { type: Number },
    // type: 'resale' for sell, 'rent' for rent, also 'floor'/'plot' for consistency
    type: { type: String, enum: ['resale', 'rent', 'floor', 'plot'], required: true }
  },
  
  images: [String],
  gatedInfo: {
    exactPrice: String,
    negotiationInsights: String,
    availability: String,
    sellerMotivation: String
  },
  featured: { type: Boolean, default: false },
  liveStatus: { type: String, default: 'inactive', enum: ['active', 'inactive'] },
  advisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advisor' },
  societyName: { type: String },
  area: { type: String },
  description: { type: String },
  ownership: { type: String },
  availability: {
    status: { type: String, enum: ['ready_to_move', 'under_construction'] },
    availableFrom: Date
  },
  pricing: {
    expectedPrice: Number,
    securityAmount: Number,
    noticePeriod: String,
    rentDuration: Number
  }
}, { timestamps: true });

// Indexes
propertySchema.index({ slug: 1 }, { unique: true });
propertySchema.index({ liveStatus: 1, 'unitDetails.type': 1, 'unitDetails.priceValue': 1 });
propertySchema.index({ area: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ purpose: 1 }); // 🔥 add index for purpose filtering

export default mongoose.model('Property', propertySchema);