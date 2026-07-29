import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(verifyToken, requireRole(['admin']));

router.get('/', getSettings);
router.post('/', updateSettings);

export default router;
