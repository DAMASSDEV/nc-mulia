import { Router } from 'express';
import auditRouter from './routes.js';

const router = Router();
router.use('/audit', auditRouter);

export default router;
