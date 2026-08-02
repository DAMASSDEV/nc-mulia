import { Router } from 'express';
import { list, getById, create, update, remove } from './controller.js';
import { authMiddleware, requireAdmin } from '../../middleware/index.js';

const router = Router();

router.get('/', list);
router.get('/:id', getById);
router.post('/', authMiddleware, requireAdmin, create);
router.put('/:id', authMiddleware, requireAdmin, update);
router.delete('/:id', authMiddleware, requireAdmin, remove);

export default router;
