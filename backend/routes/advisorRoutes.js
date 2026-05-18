import express from 'express';
import * as advisorController from '../controllers/advisorController.js';
// import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', advisorController.getAllAdvisors);
router.get('/:id', advisorController.getAdvisorById);
// router.post('/', protect, adminOnly, advisorController.createAdvisor);
// router.put('/:id', protect, adminOnly, advisorController.updateAdvisor);
// router.delete('/:id', protect, adminOnly, advisorController.deleteAdvisor);

export default router;