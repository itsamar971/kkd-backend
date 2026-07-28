"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.verifyFarmer = exports.listUsers = void 0;
const express_1 = require("express");
const firebase_1 = require("../config/firebase");
const listUsers = async (req, res) => {
    try {
        const snapshot = await firebase_1.db.collection('users').get();
        const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        return res.status(200).json(users);
    }
    catch (error) {
        console.error('Error listing users:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.listUsers = listUsers;
const verifyFarmer = async (req, res) => {
    try {
        const { uid } = req.params;
        const userRef = firebase_1.db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (userDoc.data()?.role !== 'farmer') {
            return res.status(400).json({ error: 'User is not a farmer' });
        }
        await userRef.update({ isVerified: true });
        return res.status(200).json({ message: 'Farmer verified successfully' });
    }
    catch (error) {
        console.error('Error verifying farmer:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.verifyFarmer = verifyFarmer;
const getStats = async (req, res) => {
    try {
        // Note: In a production Firebase app, fetching all documents to count or sum can be expensive.
        // Consider using Firestore Aggregation Queries (count(), sum()) if you use standard Firebase SDK > 10
        // The admin SDK does not fully support count() and sum() easily yet, so we'll do a simple fetch for now.
        const snapshot = await firebase_1.db.collection('orders').get();
        let totalOrdersCount = 0;
        let totalRevenueSum = 0;
        snapshot.forEach(doc => {
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
    }
    catch (error) {
        console.error('Error getting stats:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getStats = getStats;
//# sourceMappingURL=adminController.js.map