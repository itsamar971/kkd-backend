import { Response } from 'express';
import { db } from '../config/firebase';
import { AuthenticatedRequest } from '../middleware/auth';

export const placeOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyerId = req.user?.uid;
    const { productId, quantityKg, deliveryAddress, couponCode, finalTotal } = req.body;

    if (!productId || !quantityKg || !deliveryAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch product to get farmerId and price
    const productRef = db.collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productData = productDoc.data();
    if (!productData) {
      return res.status(404).json({ error: 'Product data not found' });
    }

    if (productData.stockQuantityKg < quantityKg) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const totalAmount = productData.pricePerKg * quantityKg;

    const newOrder = {
      buyerId,
      farmerId: productData.farmerId,
      productId,
      productName: productData.name,
      name: productData.name,
      crop: productData.name,
      category: productData.category || 'Grains',
      quantityKg: Number(quantityKg),
      totalAmount: finalTotal || totalAmount, // use finalTotal if provided (discounted)
      originalAmount: totalAmount,
      couponCode: couponCode || null,
      status: 'processing',
      deliveryAddress,
      createdAt: new Date().toISOString()
    };

    const orderRef = await db.collection('orders').add(newOrder);

    if (couponCode) {
      try {
        const snap = await db.collection('promotions').where('code', '==', couponCode.toUpperCase()).limit(1).get();
        if (!snap.empty) {
          const promoRef = snap.docs[0].ref;
          const promoData = snap.docs[0].data();
          await promoRef.update({ usedCount: (promoData.usedCount || 0) + 1 });
        }
      } catch (e) {
        console.error('Failed to update coupon usage', e);
      }
    }

    // Update stock quantity
    await productRef.update({
      stockQuantityKg: productData.stockQuantityKg - quantityKg
    });

    return res.status(201).json({ message: 'Order placed successfully', id: orderRef.id, ...newOrder });
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const listOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    const role = req.user?.role;

    let snapshot;
    if (role === 'farmer') {
      snapshot = await db.collection('orders').where('farmerId', '==', uid).get();
    } else if (role === 'buyer') {
      snapshot = await db.collection('orders').where('buyerId', '==', uid).get();
    } else {
      // admin or other
      snapshot = await db.collection('orders').get();
    }

    const orders = await Promise.all(snapshot.docs.map(async (doc: any) => {
      const data = doc.data();
      let farmerName = data.farmerName || data.farmer;
      let farmerLoc = data.loc || data.location || data.city;

      if (data.farmerId) {
        try {
          const userDoc = await db.collection('users').doc(data.farmerId).get();
          if (userDoc.exists) {
            const u = userDoc.data();
            if (!farmerName || farmerName === 'Farmer' || farmerName.startsWith('Farmer ')) {
              farmerName = u?.fullName || u?.name || u?.displayName;
            }
            if (!farmerLoc || farmerLoc === 'Various') {
              farmerLoc = u?.location || u?.city || u?.district || u?.state;
            }
          }
        } catch (e) {
          console.error("Error fetching farmer user for order:", e);
        }
      }

      if (!farmerName || farmerName === 'Farmer' || farmerName.startsWith('Farmer ')) {
        farmerName = 'rahul';
      }

      if (!farmerLoc || farmerLoc === 'Various') {
        farmerLoc = 'Ludhiana, Punjab';
      }

      return {
        id: doc.id,
        ...data,
        farmerName,
        farmer: farmerName,
        loc: farmerLoc,
        location: farmerLoc
      };
    }));

    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error listing orders:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, driverNumber } = req.body;
    const uid = req.user?.uid;
    const role = req.user?.role;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const orderRef = db.collection('orders').doc(id as string);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderData = orderDoc.data();
    
    // Authorization: Farmer/Admin can update anything. Buyer can only update to 'delivered'
    if (role !== 'admin' && orderData?.farmerId !== uid) {
      if (orderData?.buyerId !== uid || status !== 'delivered') {
        return res.status(403).json({ error: 'Forbidden: You cannot update this order' });
      }
    }

    const updates: any = { status };
    if (driverNumber) {
      updates.driverNumber = driverNumber;
    }

    await orderRef.update(updates);

    return res.status(200).json({ message: 'Order status updated' });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const addOrderReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, reviewText } = req.body;
    const uid = req.user?.uid;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid rating (1-5) is required' });
    }

    const orderRef = db.collection('orders').doc(id as string);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderData = orderDoc.data();
    if (orderData?.buyerId !== uid) {
      return res.status(403).json({ error: 'Forbidden: Only the buyer can leave a review' });
    }
    
    if (orderData?.status !== 'delivered') {
      return res.status(400).json({ error: 'Order must be delivered before rating' });
    }

    // Default username for now since we don't store user profiles on orders
    const buyerName = req.user?.email?.split('@')[0] || 'A Buyer';

    await orderRef.update({
      rating: Number(rating),
      reviewText: reviewText || '',
      buyerName,
      reviewedAt: new Date().toISOString()
    });

    return res.status(200).json({ message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Error adding review:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
