import { Router } from 'express';
import { getDisputes, resolveDispute } from '../controllers/disputeController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();
router.use(verifyToken, requireRole(['admin']));

router.get('/', getDisputes);
router.post('/:id/resolve', resolveDispute);

export default router;
