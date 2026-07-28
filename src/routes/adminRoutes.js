"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All admin routes should require 'admin' role
router.use(auth_1.verifyToken, (0, auth_1.requireRole)(['admin']));
// GET /api/admin/users - List all users
router.get('/users', adminController_1.listUsers);
// PATCH /api/admin/users/:uid/verify - Verify a farmer
router.patch('/users/:uid/verify', adminController_1.verifyFarmer);
// GET /api/admin/stats - Get global revenue/order analytics
router.get('/stats', adminController_1.getStats);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map