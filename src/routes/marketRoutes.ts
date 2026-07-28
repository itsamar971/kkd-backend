import { Router } from 'express';
import { getMarketPrices } from '../controllers/marketController';

const router = Router();

router.get('/prices', getMarketPrices);

export default router;
