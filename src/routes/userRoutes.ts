import { Router } from 'express';
import { syncUser, verifyFarmer, getUserConversation, sendMessageToAdmin } from '../controllers/userController';
import { getAnnouncementsForUser } from '../controllers/announcementController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

// POST /api/users/sync
router.post('/sync', verifyToken, syncUser);

// POST /api/users/verify
router.post('/verify', verifyToken, requireRole(['farmer']), verifyFarmer);

// GET /api/users/messages
router.get('/messages', verifyToken, getUserConversation);

// POST /api/users/messages
router.post('/messages', verifyToken, sendMessageToAdmin);

// GET /api/users/announcements
router.get('/announcements', verifyToken, getAnnouncementsForUser);

export default router;
