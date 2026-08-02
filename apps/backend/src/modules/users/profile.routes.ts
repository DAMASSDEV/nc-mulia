import { Router } from 'express';
import { getMe, updateMe } from './profile.controller.js';
import { authMiddleware } from '../../middleware/index.js';

const router = Router();

router.use(authMiddleware);
router.get('/me', getMe);
router.patch('/me', updateMe);

export default router;
