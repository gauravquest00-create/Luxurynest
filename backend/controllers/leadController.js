import Lead from '../models/Lead.js';
import Property from '../models/Property.js';
import { sendAdvisorNotification, sendLeadConfirmation } from '../utils/sendEmail.js';

// ---------- Helper: Send lead to Google Sheets (no‑cors) ----------
const sendToGoogleSheets = async (leadData) => {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',               // prevents CORS errors, but no response
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    console.log('📤 Lead sent to Google Sheets (no-cors)');
  } catch (err) {
    console.error('❌ Google Sheets error:', err.message);
  }
};

// ---------- Create Lead (with all integrations) ----------
export const createLead = async (req, res) => {
  try {
    const { name, email, phone, propertySlug, advisorId, source, requirementDetails } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    // Save lead to MongoDB
    const lead = new Lead({
      name, email, phone, propertySlug, advisorId, source, requirementDetails,
      phoneVerified: true,
    });
    await lead.save();

    // --- Enrich requirement details (if property is linked) ---
    let enrichedReq = requirementDetails;
    if (source === 'property_detail' && propertySlug) {
      try {
        const property = await Property.findOne({ slug: propertySlug, liveStatus: 'active' }).populate('projectId');
        if (property && property.projectId) {
          const unit = property.unitDetails || {};
          const project = property.projectId;
          enrichedReq = {
            ...(typeof requirementDetails === 'object' ? requirementDetails : {}),
            propertyTitle: property.title,
            location: project.location?.address || project.location?.city || '',
            budget: unit.price,
            configuration: `${unit.bedrooms} BHK`,
            propertyType: unit.type,
          };
          console.log('Enriched requirementDetails:', enrichedReq);
        }
      } catch (err) { console.error('Error enriching property data:', err); }
    }

    // Prepare data for Google Sheets
    const sheetData = {
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone,
      source: lead.source,
      propertySlug: lead.propertySlug,
      requirementDetails: typeof enrichedReq === 'string' ? enrichedReq : JSON.stringify(enrichedReq),
      timestamp: new Date().toISOString()
    };

    // Send to Google Sheets (non‑blocking)
    sendToGoogleSheets(sheetData);

    // Send email notifications (non‑blocking)
    const adminEmail = process.env.ADMIN_EMAIL || 'adminluxurynest@gmail.com';
    setImmediate(async () => {
      try {
        await sendAdvisorNotification(adminEmail, lead);
        if (lead.email) await sendLeadConfirmation(lead);
      } catch (emailErr) {
        console.error('Email sending failed:', emailErr.message);
      }
    });

    res.status(201).json({
      success: true,
      leadId: lead._id,
      message: 'Lead saved. Advisor will contact you within 24 hours.'
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ message: error.message });
  }
};
// Get all leads (admin only)
export const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort('-createdAt').populate('advisorId', 'name email');
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single lead by ID (admin only)
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('advisorId', 'name email');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Full update for leads (admin only) – allows editing all fields
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update lead status only (admin only) – kept for convenience
export const updateLeadStatus = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete lead (admin only)
/// ========== DELETE LEAD (Single) ==========
export const deleteLead = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Lead.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        res.json({ success: true, message: 'Lead deleted successfully' });
    } catch (error) {
        console.error('Delete lead error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ========== BULK DELETE LEADS ==========
export const bulkDeleteLeads = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !ids.length) {
            return res.status(400).json({ message: 'No lead IDs provided' });
        }
        const result = await Lead.deleteMany({ _id: { $in: ids } });
        res.json({ 
            success: true, 
            message: `${result.deletedCount} lead(s) deleted successfully`,
            deletedCount: result.deletedCount 
        });
    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({ message: error.message });
    }
};

async function deleteSingleLead(id, name) {
    showConfirmDialog(`Are you sure you want to delete lead "${name}"?`, async () => {
        try {
            // 🔥 Use admin routes endpoint (without /api/leads)
            const res = await fetch(`${API_BASE}/admin/leads/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(await res.text());
            showToast('Lead deleted successfully');
            // Remove from local data
            const index = leadsData.findIndex(l => l._id === id);
            if (index !== -1) leadsData.splice(index, 1);
            selectedLeads.delete(id);
            renderLeadsList();
        } catch (err) {
            showToast(err.message, true);
        }
    });
}


// Add this function to your existing leadController.js
export const verifyPhone = async (req, res) => {
  try {
    const { leadId } = req.params;
    await Lead.findByIdAndUpdate(leadId, { phoneVerified: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};