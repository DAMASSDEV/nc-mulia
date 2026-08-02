import { Router } from 'express';
import { listUsers, updateUser, deactivateUser } from './controller.js';
import { updateMembership, updateStatus, getUserById } from './admin.controller.js';
import { authMiddleware, requireAdmin } from '../../middleware/index.js';

const router = Router();

router.use(authMiddleware, requireAdmin);

router.get('/', listUsers);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.patch('/:id/membership', updateMembership);
router.patch('/:id/status', updateStatus);
router.delete('/:id', deactivateUser);

export default router;
