import { Router } from 'express';
import { getAnnouncements, createAnnouncement } from '../controllers/announcementController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();
router.use(verifyToken, requireRole(['admin']));

router.get('/', getAnnouncements);
router.post('/', createAnnouncement);

export default router;
