import { Router } from 'express';
import { getAnalyticsData } from '../controllers/analyticsController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();
router.use(verifyToken, requireRole(['admin']));

router.get('/', getAnalyticsData);

export default router;
