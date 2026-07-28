"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncUser = void 0;
const express_1 = require("express");
const firebase_1 = require("../config/firebase");
const auth_1 = require("../middleware/auth");
const syncUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { uid, email, name } = req.user;
        // Check if user exists
        const userRef = firebase_1.db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            // Create new user with default role 'buyer'
            const newUser = {
                uid,
                email: email || '',
                name: name || '',
                role: 'buyer', // Default role
                location: '',
                isVerified: false,
                createdAt: new Date().toISOString()
            };
            await userRef.set(newUser);
            return res.status(201).json({ message: 'User created successfully', user: newUser });
        }
        return res.status(200).json({ message: 'User already exists', user: userDoc.data() });
    }
    catch (error) {
        console.error('Error syncing user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.syncUser = syncUser;
//# sourceMappingURL=userController.js.map