"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/users/sync
router.post('/sync', auth_1.verifyToken, userController_1.syncUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map