import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { AuthenticatedRequest } from '../middleware/auth';

export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, name, description, pricePerKg, stockQuantityKg } = req.body;
    const farmerId = req.user?.uid;

    if (!category || !name || !pricePerKg || !stockQuantityKg) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newProduct = {
      farmerId,
      category,
      name,
      description: description || '',
      pricePerKg: Number(pricePerKg),
      stockQuantityKg: Number(stockQuantityKg),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('products').add(newProduct);
    
    return res.status(201).json({ message: 'Product created', id: docRef.id, ...newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { pricePerKg, stockQuantityKg, status } = req.body;
    const farmerId = req.user?.uid;

    const productRef = db.collection('products').doc(id as string);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (productDoc.data()?.farmerId !== farmerId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this product' });
    }

    const updates: any = {};
    if (pricePerKg !== undefined) updates.pricePerKg = Number(pricePerKg);
    if (stockQuantityKg !== undefined) updates.stockQuantityKg = Number(stockQuantityKg);
    if (status !== undefined) updates.status = status;

    await productRef.update(updates);
    
    return res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const listProducts = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('products').where('status', '==', 'active').get();
    const products = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    
    return res.status(200).json(products);
  } catch (error) {
    console.error('Error listing products:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const snapshot = await db.collection('orders')
      .where('productId', '==', id)
      .where('status', '==', 'delivered')
      .get();
      
    const reviews: any[] = [];
    snapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      if (data.rating) {
        reviews.push({
          id: doc.id,
          rating: data.rating,
          reviewText: data.reviewText || '',
          buyerName: data.buyerName || 'A Buyer',
          reviewedAt: data.reviewedAt || data.createdAt
        });
      }
    });
    
    // Sort reviews by date descending
    reviews.sort((a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime());
    
    return res.status(200).json(reviews);
  } catch (error) {
    console.error('Error getting product reviews:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
