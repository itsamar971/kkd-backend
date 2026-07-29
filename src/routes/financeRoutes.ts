import { Router } from 'express';
import { getEscrow, processPayout } from '../controllers/financeController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();
router.use(verifyToken, requireRole(['admin']));

router.get('/escrow', getEscrow);
router.post('/payout/:id', processPayout);

export default router;
