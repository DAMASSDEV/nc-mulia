import { Router } from 'express';
import publicRoutes from './routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/', publicRoutes);

export default router;

export const locationsRoutes = router;
export const adminLocationsRoutes = adminRoutes;
