import { Router } from 'express';
import { getMandiPrices } from '../controllers/mandiController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();
router.use(verifyToken, requireRole(['admin']));

router.get('/', getMandiPrices);

export default router;
