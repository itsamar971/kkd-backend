import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const getMarketPrices = async (req: Request, res: Response) => {
  // Static data for now, but served from backend to remove mocks from frontend
  const marketPrices = [
    { crop:'Tomato',  msp:'₹25/kg',  current:'₹28/kg', trend:'up'   },
    { crop:'Onion',   msp:'₹18/kg',  current:'₹22/kg', trend:'up'   },
    { crop:'Wheat',   msp:'₹21/kg',  current:'₹24/kg', trend:'up'   },
    { crop:'Rice',    msp:'₹30/kg',  current:'₹28/kg', trend:'down' },
    { crop:'Potato',  msp:'₹15/kg',  current:'₹13/kg', trend:'down' },
  ];
  return res.status(200).json(marketPrices);
};

export const validatePromotion = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });

    const snap = await db.collection('promotions').where('code', '==', code.toUpperCase()).limit(1).get();
    if (snap.empty) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }

    const promo = snap.docs[0].data();
    
    if (promo.status !== 'active') {
      return res.status(400).json({ error: 'This coupon is no longer active' });
    }

    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }

    if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }

    return res.status(200).json({ discountPercentage: promo.discountPercentage, id: snap.docs[0].id });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
