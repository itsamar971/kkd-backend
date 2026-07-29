import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const getDisputes = async (req: Request, res: Response) => {
  try {
    const snap = await db.collection('disputes').get();
    let disputes: any[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (disputes.length === 0) {
      disputes = [
        { id: 'disp_1', orderId: 'ORD-2993', buyerName: 'Anil Kumar', farmerName: 'Ramesh Singh', issue: 'Damaged tomatoes received.', amount: 450, status: 'open', createdAt: new Date().toISOString() },
        { id: 'disp_2', orderId: 'ORD-2995', buyerName: 'Sita Devi', farmerName: 'Suresh Kumar', issue: 'Quantity mismatch (ordered 50kg, received 48kg).', amount: 120, status: 'open', createdAt: new Date(Date.now() - 86400000).toISOString() }
      ];
    }
    return res.status(200).json(disputes);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const resolveDispute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'refund_full', 'refund_partial', 'reject'
    if (!(id as string).startsWith('disp_')) {
       await db.collection('disputes').doc(id as string).update({ status: 'resolved', resolution: action });
    }
    return res.status(200).json({ success: true, message: 'Dispute resolved' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
