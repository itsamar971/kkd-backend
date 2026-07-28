"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/products - List all active products (Public/Buyer)
router.get('/', productController_1.listProducts);
// POST /api/products - Create new listing (Farmer only)
router.post('/', auth_1.verifyToken, (0, auth_1.requireRole)(['farmer']), productController_1.createProduct);
// PUT /api/products/:id - Update stock/price (Farmer only)
router.put('/:id', auth_1.verifyToken, (0, auth_1.requireRole)(['farmer']), productController_1.updateProduct);
exports.default = router;
//# sourceMappingURL=productRoutes.js.map