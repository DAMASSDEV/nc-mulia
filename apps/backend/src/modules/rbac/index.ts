import { Router } from 'express';
import rbacRouter from './routes.js';

const router = Router();
router.use('/rbac', rbacRouter);

export default router;
