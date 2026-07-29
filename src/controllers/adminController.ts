import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const listUsers = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map((doc: any) => ({ uid: doc.id, ...doc.data() }));
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error listing users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyFarmer = async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    
    const userRef = db.collection('users').doc(uid as string);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userDoc.data()?.role !== 'farmer') {
      return res.status(400).json({ error: 'User is not a farmer' });
    }

    await userRef.update({ isVerified: true });
    
    return res.status(200).json({ message: 'Farmer verified successfully' });
  } catch (error) {
    console.error('Error verifying farmer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    // Note: In a production Firebase app, fetching all documents to count or sum can be expensive.
    // Consider using Firestore Aggregation Queries (count(), sum()) if you use standard Firebase SDK > 10
    // The admin SDK does not fully support count() and sum() easily yet, so we'll do a simple fetch for now.
    
    const snapshot = await db.collection('orders').get();
    
    let totalOrdersCount = 0;
    let totalRevenueSum = 0;

    snapshot.forEach((doc: any) => {
      totalOrdersCount++;
      const data = doc.data();
      if (data.totalAmount) {
        totalRevenueSum += data.totalAmount;
      }
    });

    return res.status(200).json({
      totalOrdersCount,
      totalRevenueSum
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAgent = async (req: Request, res: Response) => {
  try {
    const { name, phone, status, currentOrders } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const newAgent = {
      name,
      phone,
      role: 'agent',
      status: status || 'Available',
      currentOrders: currentOrders || 0,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('users').add(newAgent);
    
    return res.status(201).json({ message: 'Agent created', id: docRef.id, ...newAgent });
  } catch (error) {
    console.error('Error creating agent:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
