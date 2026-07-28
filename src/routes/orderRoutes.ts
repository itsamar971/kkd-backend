import { Router } from 'express';
import { placeOrder, listOrders, updateOrderStatus, addOrderReview } from '../controllers/orderController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

// POST /api/orders - Place a new order (Buyer only)
router.post('/', verifyToken, requireRole(['buyer']), placeOrder);

// GET /api/orders - Get orders for the logged-in user (Buyer/Farmer)
router.get('/', verifyToken, requireRole(['buyer', 'farmer', 'admin']), listOrders);

// PATCH /api/orders/:id/status - Update order status (Farmer/Admin/Buyer)
router.patch('/:id/status', verifyToken, requireRole(['farmer', 'admin', 'buyer']), updateOrderStatus);

// POST /api/orders/:id/review - Submit a review (Buyer)
router.post('/:id/review', verifyToken, requireRole(['buyer']), addOrderReview);

export default router;
