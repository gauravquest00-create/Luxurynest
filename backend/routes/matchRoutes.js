import express from 'express';
import { matchProperties } from '../controllers/matchController.js';

const router = express.Router();
router.post('/', matchProperties);

export default router;