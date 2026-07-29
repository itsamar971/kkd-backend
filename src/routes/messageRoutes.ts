import { Router } from 'express';
import { listConversations, replyToConversation } from '../controllers/messageController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

// Admin required
router.use(verifyToken, requireRole(['admin']));

// GET /api/admin/messages
router.get('/', listConversations);

// POST /api/admin/messages/:id/reply
router.post('/:id/reply', replyToConversation);

export default router;
