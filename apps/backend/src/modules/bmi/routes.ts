import { Router } from 'express';
import { calculate, history, getAll } from './controller.js';
import { authMiddleware, requireAdmin, requireUser } from '../../middleware/index.js';

const router = Router();

router.post('/calculate', authMiddleware, requireUser, calculate);
router.get('/history', authMiddleware, requireUser, history);
router.get('/', authMiddleware, requireAdmin, getAll);

export default router;
