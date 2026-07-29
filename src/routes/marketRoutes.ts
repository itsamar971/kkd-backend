import { Router } from 'express';
import { getMarketPrices, validatePromotion } from '../controllers/marketController';

const router = Router();

router.get('/prices', getMarketPrices);
router.post('/promotions/validate', validatePromotion);

export default router;
