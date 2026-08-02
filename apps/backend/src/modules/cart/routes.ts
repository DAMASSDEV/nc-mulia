import { Router } from 'express';
import { getCart, addItem, updateItem, removeItem, clear } from './controller.js';
import { authMiddleware, requireUser } from '../../middleware/index.js';

const router = Router();

router.use(authMiddleware, requireUser);
router.get('/', getCart);
router.post('/items', addItem);
router.put('/items/:productId', updateItem);
router.delete('/items/:productId', removeItem);
router.delete('/', clear);

export default router;
