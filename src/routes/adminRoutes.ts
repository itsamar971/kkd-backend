import { Router } from 'express';
import { listUsers, verifyFarmer, getStats, createAgent } from '../controllers/adminController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

// All admin routes should require 'admin' role
router.use(verifyToken, requireRole(['admin']));

// GET /api/admin/users - List all users
router.get('/users', listUsers);

// PATCH /api/admin/users/:uid/verify - Verify a farmer
router.patch('/users/:uid/verify', verifyFarmer);

// GET /api/admin/stats - Get global revenue/order analytics
router.get('/stats', getStats);

// POST /api/admin/users/agent - Create a delivery agent
router.post('/users/agent', createAgent);

export default router;
