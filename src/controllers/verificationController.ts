import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const getPendingVerifications = async (req: Request, res: Response) => {
  try {
    const productsSnapshot = await db.collection('products').where('status', '==', 'pending_verification').get();
    const products: any[] = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching verifications:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.collection('products').doc(id as string).update({ status: 'active' });
    return res.status(200).json({ success: true, message: 'Product approved' });
  } catch (error) {
    console.error('Error approving product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const rejectProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    await db.collection('products').doc(id as string).update({ status: 'rejected', feedback: feedback || '' });
    return res.status(200).json({ success: true, message: 'Product rejected' });
  } catch (error) {
    console.error('Error rejecting product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
