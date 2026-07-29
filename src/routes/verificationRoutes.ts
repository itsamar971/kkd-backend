import { Router } from 'express';
import { getPendingVerifications, approveProduct, rejectProduct } from '../controllers/verificationController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(verifyToken, requireRole(['admin']));

router.get('/products', getPendingVerifications);
router.post('/products/:id/approve', approveProduct);
router.post('/products/:id/reject', rejectProduct);

export default router;
