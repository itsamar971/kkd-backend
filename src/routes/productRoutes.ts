import { Router } from 'express';
import { createProduct, updateProduct, listProducts, getProductReviews } from '../controllers/productController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/products - List all active products (Public/Buyer)
router.get('/', listProducts);

// POST /api/products - Create new listing (Farmer only)
router.post('/', verifyToken, requireRole(['farmer']), createProduct);

// PUT /api/products/:id - Update stock/price (Farmer only)
router.put('/:id', verifyToken, requireRole(['farmer']), updateProduct);

// GET /api/products/:id/reviews - Get reviews for a product (Public)
router.get('/:id/reviews', getProductReviews);

export default router;
