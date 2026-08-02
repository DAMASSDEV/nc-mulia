import { Router } from 'express';
import { getStats } from './controller.js';
import { authMiddleware, requireAdmin } from '../../middleware/index.js';

const router = Router();

router.get('/dashboard', authMiddleware, requireAdmin, getStats);

export default router;
