import express from 'express';
import * as propertyController from '../controllers/propertyController.js';
// import { protect, adminOnly } from '../middleware/auth.js';
// 
const router = express.Router();

router.get('/', propertyController.getAllProperties);
router.get('/:slug', propertyController.getPropertyBySlug);
// router.post('/', protect, adminOnly, propertyController.createProperty);
// router.put('/:slug', protect, adminOnly, propertyController.updateProperty);
// router.delete('/:slug', protect, adminOnly, propertyController.deleteProperty);

export default router;