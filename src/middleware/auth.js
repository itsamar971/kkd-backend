"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.verifyToken = void 0;
const express_1 = require("express");
const firebase_1 = require("../config/firebase");
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decodedToken = await firebase_1.auth.verifyIdToken(token);
        // Fetch the user's role from Firestore
        const userDoc = await firebase_1.db.collection('users').doc(decodedToken.uid).get();
        let role = 'buyer'; // default role
        if (userDoc.exists) {
            role = userDoc.data()?.role || 'buyer';
        }
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name,
            role: role,
        };
        next();
    }
    catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};
exports.verifyToken = verifyToken;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: `Forbidden: Requires one of roles: ${roles.join(', ')}` });
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth.js.map