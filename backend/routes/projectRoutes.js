import express from 'express';
import * as projectController from '../controllers/projectController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { deleteProject, bulkDeleteProjects } from '../controllers/projectController.js';
import mongoose from 'mongoose';

const router = express.Router();

// ========== PUBLIC ROUTES ==========
router.get('/', projectController.getAllProjects);
router.get('/names', projectController.getProjectNames);
router.get('/:slug', projectController.getProjectBySlug);

// ========== ADMIN DELETE ROUTES (ORDER MATTERS!) ==========
// ✅ 1. SPECIFIC route - MUST come FIRST
router.delete('/projects/bulk', protect, adminOnly, bulkDeleteProjects);

// ✅ 2. DYNAMIC route - comes AFTER specific routes
router.delete('/projects/:id', protect, adminOnly, deleteProject);
router.all('/projects/bulk', (req, res) => {
    res.json({ message: 'Bulk route hit', method: req.method });
});
export default router;