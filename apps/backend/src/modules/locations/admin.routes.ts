import { Router } from 'express';
import {
  createLocation,
  updateLocation,
  deleteLocation,
  setLocationStatus,
  setLocationPrimary,
} from './controller.js';
import { authMiddleware, requirePermission } from '../../middleware/auth.js';

const router = Router();

router.use(authMiddleware, requirePermission('locations:read'));

router.post('/', requirePermission('locations:create'), createLocation);
router.put('/:id', requirePermission('locations:update'), updateLocation);
router.patch('/:id/status', requirePermission('locations:update'), setLocationStatus);
router.patch('/:id/primary', requirePermission('locations:update'), setLocationPrimary);
router.delete('/:id', requirePermission('locations:delete'), deleteLocation);

export default router;
