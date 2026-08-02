import { Router } from 'express';
import { create, simulate, list, listAll, cancel } from './controller.js';
import { authMiddleware, requireAdmin, requireUser } from '../../middleware/index.js';

const router = Router();

router.post('/', authMiddleware, requireUser, create);
router.post('/:id/simulate', authMiddleware, requireUser, simulate);
router.get('/', authMiddleware, requireUser, list);
router.get('/all', authMiddleware, requireAdmin, listAll);
router.post('/:id/cancel', authMiddleware, requireUser, cancel);

export default router;
