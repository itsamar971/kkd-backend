"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProducts = exports.updateProduct = exports.createProduct = void 0;
const express_1 = require("express");
const firebase_1 = require("../config/firebase");
const auth_1 = require("../middleware/auth");
const createProduct = async (req, res) => {
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
        const docRef = await firebase_1.db.collection('products').add(newProduct);
        return res.status(201).json({ message: 'Product created', id: docRef.id, ...newProduct });
    }
    catch (error) {
        console.error('Error creating product:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { pricePerKg, stockQuantityKg, status } = req.body;
        const farmerId = req.user?.uid;
        const productRef = firebase_1.db.collection('products').doc(id);
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
            return res.status(404).json({ error: 'Product not found' });
        }
        if (productDoc.data()?.farmerId !== farmerId) {
            return res.status(403).json({ error: 'Forbidden: You do not own this product' });
        }
        const updates = {};
        if (pricePerKg !== undefined)
            updates.pricePerKg = Number(pricePerKg);
        if (stockQuantityKg !== undefined)
            updates.stockQuantityKg = Number(stockQuantityKg);
        if (status !== undefined)
            updates.status = status;
        await productRef.update(updates);
        return res.status(200).json({ message: 'Product updated successfully' });
    }
    catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateProduct = updateProduct;
const listProducts = async (req, res) => {
    try {
        const snapshot = await firebase_1.db.collection('products').where('status', '==', 'active').get();
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json(products);
    }
    catch (error) {
        console.error('Error listing products:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.listProducts = listProducts;
//# sourceMappingURL=productController.js.map