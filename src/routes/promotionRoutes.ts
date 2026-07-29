import { Router } from 'express';
import { getPromotions, createPromotion } from '../controllers/promotionController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();
router.use(verifyToken, requireRole(['admin']));

router.get('/', getPromotions);
router.post('/', createPromotion);

export default router;
