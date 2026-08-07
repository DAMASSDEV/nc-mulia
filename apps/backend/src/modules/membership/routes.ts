import { Router } from 'express';
import { listPlans, getDefaultPlan, purchaseMembership } from './controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();

router.get('/plans', listPlans);
router.get('/default', getDefaultPlan);
router.post('/purchase', authMiddleware, purchaseMembership);

export default router;

