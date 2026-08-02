import { Router } from 'express';
import { getStatus, upgradeUser, downgradeUser, listPlans, getPlanFee } from './controller.js';
import { authMiddleware, requireAdmin, requireUser } from '../../middleware/index.js';

const router = Router();

router.get('/status', authMiddleware, requireUser, getStatus);
router.get('/plans', listPlans);
router.get('/fee', getPlanFee);
router.put('/:userId/upgrade', authMiddleware, requireAdmin, upgradeUser);
router.put('/:userId/downgrade', authMiddleware, requireAdmin, downgradeUser);

export default router;
