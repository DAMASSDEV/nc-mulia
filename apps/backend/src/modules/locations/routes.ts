import { Router } from 'express';
import { listLocations, getLocation, getPrimary } from './controller.js';

const router = Router();

router.get('/', listLocations);
router.get('/primary', getPrimary);
router.get('/:id', getLocation);

export default router;
