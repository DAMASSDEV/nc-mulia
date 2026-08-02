import { Router } from 'express';
import { list } from './controller.js';
import { authMiddleware, requireAdmin } from '../../middleware/auth.js';

const router = Router();
router.get('/', authMiddleware, requireAdmin, list);

export default router;
