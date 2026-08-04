import { Router } from 'express';
import rbacRouter from './routes.js';

const router = Router();
router.use('/', rbacRouter);

export default router;
