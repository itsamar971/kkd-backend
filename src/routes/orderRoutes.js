"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/orders - Place a new order (Buyer only)
router.post('/', auth_1.verifyToken, (0, auth_1.requireRole)(['buyer']), orderController_1.placeOrder);
// GET /api/orders - Get orders for the logged-in user (Buyer/Farmer)
router.get('/', auth_1.verifyToken, (0, auth_1.requireRole)(['buyer', 'farmer', 'admin']), orderController_1.listOrders);
// PATCH /api/orders/:id/status - Update order status (Farmer/Admin)
router.patch('/:id/status', auth_1.verifyToken, (0, auth_1.requireRole)(['farmer', 'admin']), orderController_1.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map