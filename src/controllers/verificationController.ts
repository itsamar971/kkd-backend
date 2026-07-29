import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const getPendingVerifications = async (req: Request, res: Response) => {
  try {
    const productsSnapshot = await db.collection('products').where('status', '==', 'pending_verification').get();
    
    let products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // If empty, return some mock data so the dashboard is testable
    if (products.length === 0) {
      products = [
        {
          id: 'mock_1',
          name: 'Grade A Apples',
          farmerName: 'Ramesh Singh',
          price: 120,
          unit: 'kg',
          quantity: 50,
          description: 'Freshly harvested apples from Shimla.',
          images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=400'],
          status: 'pending_verification',
          submittedAt: new Date().toISOString()
        },
        {
          id: 'mock_2',
          name: 'Organic Wheat',
          farmerName: 'Suresh Kumar',
          price: 40,
          unit: 'kg',
          quantity: 200,
          description: 'High quality organic wheat grains.',
          images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'],
          status: 'pending_verification',
          submittedAt: new Date().toISOString()
        }
      ];
    }

    return res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching verifications:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id.startsWith('mock_')) {
       await db.collection('products').doc(id).update({ status: 'approved' });
    }
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
    if (!id.startsWith('mock_')) {
       await db.collection('products').doc(id).update({ status: 'rejected', feedback });
    }
    return res.status(200).json({ success: true, message: 'Product rejected' });
  } catch (error) {
    console.error('Error rejecting product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
