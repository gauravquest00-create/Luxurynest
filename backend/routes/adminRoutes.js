import express from 'express';
import bcrypt from 'bcryptjs';
import otpGenerator from 'otp-generator';
import { login } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import * as propertyController from '../controllers/propertyController.js';
import { upload } from '../middleware/upload.js';
import Project from '../models/Project.js';
import Property from '../models/Property.js';
import Lead from '../models/Lead.js';
import User from '../models/User.js';
import { saveOtp, getOtp, deleteOtp } from '../utils/otpStore.js';
import { sendSimpleEmail } from '../utils/sendEmail.js';
import Otp from '../models/Otp.js';          // <-- import your OTP model
import { sendOtpSMS } from '../utils/sendSMS.js';
import mongoose from 'mongoose';

const router = express.Router();

// ========== AUTH ==========
router.post('/login', login);

// ========== FORGOT PASSWORD (public) ==========
// 1. Send OTP
router.post('/forgot-password/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) {
      return res.status(404).json({ message: 'No admin account found with this email' });
    }

    // Generate 6-digit OTP
    const otpCode = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // Delete any previous OTP for this email
    await Otp.deleteMany({ phone: email }); // using `phone` field to store email

    // Save new OTP
    await Otp.create({ phone: email, otp: otpCode });

    // Send email via Resend
    const subject = 'Password Reset OTP – LuxuryNest Admin';
    const html = `<p>Your OTP for password reset is: <strong>${otpCode}</strong></p><p>This OTP is valid for 5 minutes.</p>`;
    await sendSimpleEmail(email, subject, html);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// 2. Verify OTP
router.post('/forgot-password/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await Otp.findOne({ phone: email, otp });
    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    // OTP is valid – you may optionally delete it here, but keep until reset
    res.json({ message: 'OTP verified' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
});

// 3. Reset password
router.post('/forgot-password/reset', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const record = await Otp.findOne({ phone: email });
    if (!record) {
      return res.status(400).json({ message: 'No active OTP. Please request again.' });
    }

    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    // Delete the OTP record after successful password change
    await Otp.deleteMany({ phone: email });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});
// ========== ADMIN PROFILE ==========
router.get('/profile', protect, adminOnly, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id).select('-password');
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        res.json(admin);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/profile', protect, adminOnly, async (req, res) => {
    try {
        const { name, phone } = req.body;
        const update = {};
        if (name !== undefined) update.name = name;
        if (phone !== undefined) update.phone = phone;
        const admin = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password');
        res.json(admin);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/change-password', protect, adminOnly, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await User.findById(req.user.id);
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();
        res.json({ message: 'Password updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ========== PROJECTS ==========
router.get('/projects', protect, adminOnly, async (req, res) => {
    try {
        const projects = await Project.find().sort('-createdAt');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/projects/:id', protect, adminOnly, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).lean();
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/projects', protect, adminOnly, async (req, res) => {
    try {
        const project = new Project(req.body);
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/projects/:id', protect, adminOnly, async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Test route (optional)
router.get('/test-bulk', (req, res) => {
    res.json({ message: 'Test route working' });
});

// ========== DELETE ROUTES ==========
// 🔥 IMPORTANT: Specific route (/bulk) MUST come BEFORE dynamic route (/:id)

// ✅ 1. Bulk delete - SPECIFIC route (pehle rakho)
router.delete('/projects/bulk', protect, adminOnly, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !ids.length) {
            return res.status(400).json({ message: 'No project IDs provided' });
        }
        const result = await Project.deleteMany({ _id: { $in: ids } });
        res.json({ 
            success: true, 
            message: `${result.deletedCount} project(s) deleted successfully`,
            deletedCount: result.deletedCount 
        });
    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ✅ 2. Single delete - DYNAMIC route (baad mein rakho)
router.delete('/projects/:id', protect, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid project ID format' });
        }
        const deleted = await Project.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'Project not found' });
        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Single delete error:', error);
        res.status(500).json({ message: error.message });
    }
});







// ========== PROPERTIES ==========
router.get('/properties', protect, adminOnly, async (req, res) => {
    try {
        const { projectId } = req.query;
        let filter = {};
        if (projectId) filter.projectId = projectId;
        const properties = await Property.find(filter).populate('projectId', 'name slug').sort('-createdAt');
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/properties/:id', protect, adminOnly, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('projectId');
        if (!property) return res.status(404).json({ message: 'Property not found' });
        res.json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/properties', protect, adminOnly, upload.array('images', 10), propertyController.createProperty);

router.put('/properties/:id', protect, adminOnly, async (req, res) => {
    try {
        const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!property) return res.status(404).json({ message: 'Property not found' });
        res.json(property);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/properties/:id', protect, adminOnly, async (req, res) => {
    try {
        const property = await Property.findByIdAndDelete(req.params.id);
        if (!property) return res.status(404).json({ message: 'Property not found' });
        res.json({ message: 'Property deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== LEADS ==========
router.get('/leads', protect, adminOnly, async (req, res) => {
    try {
        const leads = await Lead.find().sort('-createdAt').populate('advisorId', 'name email');
        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/leads/:id', protect, adminOnly, async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id).populate('advisorId', 'name email');
        if (!lead) return res.status(404).json({ message: 'Lead not found' });
        res.json(lead);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/leads/:id', protect, adminOnly, async (req, res) => {
    try {
        const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!lead) return res.status(404).json({ message: 'Lead not found' });
        res.json(lead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ BULK DELETE - SPECIFIC ROUTE (pehle rakho)
router.delete('/leads/bulk', protect, adminOnly, async (req, res) => {
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
});




// ✅ SINGLE DELETE - DYNAMIC ROUTE (baad mein rakho)
router.delete('/leads/:id', protect, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        // Validate if id is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid lead ID format' });
        }
        const deleted = await Lead.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'Lead not found' });
        res.json({ success: true, message: 'Lead deleted successfully' });
    } catch (error) {
        console.error('Single delete error:', error);
        res.status(500).json({ message: error.message });
    }
});


export default router;