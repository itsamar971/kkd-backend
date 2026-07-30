import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const getEscrow = async (req: Request, res: Response) => {
  try {
    const farmersSnap = await db.collection('users').where('role', '==', 'farmer').get();
    const farmers = farmersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const ordersSnap = await db.collection('orders').get();
    const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const escrowFunds = farmers.map((farmer: any) => {
      const farmerId = farmer.id;
      const farmerOrders = orders.filter((o: any) => 
        o.farmerId === farmerId || 
        o.farmer === farmer.name || 
        o.farmer === farmer.fullName
      );
      
      const completedOrders = farmerOrders.filter((o: any) => o.status === 'delivered' || o.status === 'completed');
      
      const escrowBalance = farmerOrders
        .filter((o: any) => (o.status === 'delivered' || o.status === 'completed') && o.payoutStatus !== 'paid')
        .reduce((sum: number, o: any) => sum + (Number(o.totalPrice || o.price || 0)), 0);

      const hasPendingEscrow = escrowBalance > 0;
      const isPaid = farmerOrders.length > 0 && farmerOrders.every((o: any) => o.payoutStatus === 'paid');
      
      return {
        id: farmerId,
        farmerName: farmer.name || farmer.fullName || farmer.displayName || 'Farmer',
        amount: escrowBalance,
        status: hasPendingEscrow ? 'ready' : (isPaid ? 'paid' : 'held'),
        orderCount: completedOrders.length
      };
    });

    return res.status(200).json(escrowFunds);
  } catch (error) {
    console.error('Error fetching escrow:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const processPayout = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const ordersSnap = await db.collection('orders').get();
    const batch = db.batch();
    let updatedCount = 0;

    ordersSnap.docs.forEach(doc => {
      const data = doc.data();
      if ((data.farmerId === id || data.farmer === id) && data.payoutStatus !== 'paid') {
        batch.update(doc.ref, { payoutStatus: 'paid', paidAt: new Date().toISOString() });
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
    }

    await db.collection('payouts').add({
      farmerId: id,
      processedAt: new Date().toISOString(),
      status: 'completed'
    });

    return res.status(200).json({ success: true, message: 'Payout initiated successfully' });
  } catch (error) {
    console.error('Error processing payout:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
