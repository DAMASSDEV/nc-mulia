import { Router } from 'express';
import auditRouter from './routes.js';

const router = Router();
router.use('/', auditRouter);

export default router;
