import { Router } from 'express';
import { create, list, listAll, update } from './controller.js';
import { authMiddleware, requireAdmin, requireUser } from '../../middleware/index.js';

const router = Router();

router.post('/', authMiddleware, requireUser, create);
router.get('/', authMiddleware, requireUser, list);
router.get('/all', authMiddleware, requireAdmin, listAll);
router.put('/:id', authMiddleware, requireAdmin, update);

export default router;
