import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const getPromotions = async (req: Request, res: Response) => {
  try {
    const snap = await db.collection('promotions').orderBy('createdAt', 'desc').get();
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPromotion = async (req: Request, res: Response) => {
  try {
    const { code, discountPercent, expiryDate, usageLimit } = req.body;
    const docRef = await db.collection('promotions').add({
      code,
      discountPercent: Number(discountPercent),
      expiryDate,
      usageLimit: Number(usageLimit),
      usedCount: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    });
    return res.status(201).json({ id: docRef.id, code });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
