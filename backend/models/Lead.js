import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  propertySlug: { type: String },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  advisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advisor' },
 // models/Lead.js
source: {
  type: String,
  enum: ['property_detail', 'advisor_page', 'deal_match', 'contact_form', 'admin_manual', 'callback_request', 'brochure_download', 'schedule_visit'],
  required: true,
},
  requirementDetails: { type: mongoose.Schema.Types.Mixed },
  phoneVerified: { type: Boolean, default: false },
  status: { type: String, default: 'new', enum: ['new', 'contacted', 'closed'] }
}, { timestamps: true });

export default mongoose.model('Lead', leadSchema);