import { Router } from 'express';
import { syncUser, verifyFarmer } from '../controllers/userController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

// POST /api/users/sync
router.post('/sync', verifyToken, syncUser);

// POST /api/users/verify
router.post('/verify', verifyToken, requireRole(['farmer']), verifyFarmer);

export default router;
