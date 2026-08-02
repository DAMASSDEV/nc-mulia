import { Router } from 'express';
import { listPlans, getDefaultPlan } from './controller.js';

const router = Router();

router.get('/plans', listPlans);
router.get('/default', getDefaultPlan);

export default router;
