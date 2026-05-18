import express from 'express';
import * as leadController from '../controllers/leadController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import mongoose from 'mongoose';
const router = express.Router();

// Public route (no auth)
router.post('/', leadController.createLead);

// Admin only routes
router.get('/', protect, adminOnly, leadController.getAllLeads);
router.get('/:id', protect, adminOnly, leadController.getLeadById);
router.put('/:id/status', protect, adminOnly, leadController.updateLeadStatus);
router.put('/:id', protect, adminOnly, leadController.updateLead);

// ✅ IMPORT delete functions properly
import { deleteLead, bulkDeleteLeads } from '../controllers/leadController.js';
router.delete('/:id', protect, adminOnly, deleteLead);
router.delete('/bulk', protect, adminOnly, bulkDeleteLeads);

router.patch('/:leadId/verify-phone', leadController.verifyPhone);


export default router;