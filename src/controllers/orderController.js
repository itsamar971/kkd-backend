"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.listOrders = exports.placeOrder = void 0;
const express_1 = require("express");
const firebase_1 = require("../config/firebase");
const auth_1 = require("../middleware/auth");
const placeOrder = async (req, res) => {
    try {
        const buyerId = req.user?.uid;
        const { productId, quantityKg, deliveryAddress } = req.body;
        if (!productId || !quantityKg || !deliveryAddress) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Fetch product to get farmerId and price
        const productRef = firebase_1.db.collection('products').doc(productId);
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
            quantityKg: Number(quantityKg),
            totalAmount,
            status: 'processing',
            deliveryAddress,
            createdAt: new Date().toISOString()
        };
        const orderRef = await firebase_1.db.collection('orders').add(newOrder);
        // Update stock quantity
        await productRef.update({
            stockQuantityKg: productData.stockQuantityKg - quantityKg
        });
        return res.status(201).json({ message: 'Order placed successfully', id: orderRef.id, ...newOrder });
    }
    catch (error) {
        console.error('Error placing order:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.placeOrder = placeOrder;
const listOrders = async (req, res) => {
    try {
        const uid = req.user?.uid;
        const role = req.user?.role;
        let snapshot;
        if (role === 'farmer') {
            snapshot = await firebase_1.db.collection('orders').where('farmerId', '==', uid).get();
        }
        else if (role === 'buyer') {
            snapshot = await firebase_1.db.collection('orders').where('buyerId', '==', uid).get();
        }
        else {
            // admin or other
            snapshot = await firebase_1.db.collection('orders').get();
        }
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json(orders);
    }
    catch (error) {
        console.error('Error listing orders:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.listOrders = listOrders;
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const uid = req.user?.uid;
        const role = req.user?.role;
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }
        const orderRef = firebase_1.db.collection('orders').doc(id);
        const orderDoc = await orderRef.get();
        if (!orderDoc.exists) {
            return res.status(404).json({ error: 'Order not found' });
        }
        const orderData = orderDoc.data();
        // Authorization: Only the farmer of the order or an admin can update the status
        if (role !== 'admin' && orderData?.farmerId !== uid) {
            return res.status(403).json({ error: 'Forbidden: You cannot update this order' });
        }
        await orderRef.update({ status });
        return res.status(200).json({ message: 'Order status updated' });
    }
    catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=orderController.js.map