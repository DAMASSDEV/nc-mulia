import { Router } from 'express';
import { register, login, logout, me } from './controller.js';
import { authMiddleware, authRateLimiter } from '../../middleware/index.js';

const router = Router();

router.post('/register', authRateLimiter(15 * 60 * 1000, 10), register);
router.post('/login', authRateLimiter(15 * 60 * 1000, 20), login);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);

export default router;
