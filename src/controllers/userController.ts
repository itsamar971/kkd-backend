import { Response } from 'express';
import { db } from '../config/firebase';
import { AuthenticatedRequest } from '../middleware/auth';
import fs from 'fs';
import path from 'path';

export const syncUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { uid, email } = req.user;
    const { role, fullName, mobile, location, landSurveyNumber } = req.body || {};
    
    // Check if user exists
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create new user
      const newUser = {
        uid,
        email: email || '',
        name: fullName || req.user.name || '',
        role: role || 'buyer',
        mobile: mobile || '',
        location: location || '',
        landSurveyNumber: landSurveyNumber || '',
        isVerified: false,
        createdAt: new Date().toISOString(),
        lastVerifiedAt: '2000-01-01T00:00:00.000Z'
      };
      await userRef.set(newUser);
      return res.status(201).json({ message: 'User created successfully', user: newUser });
    }

    // Optionally update user if they passed new details
    if (req.body && Object.keys(req.body).length > 0) {
       const updates: any = {};
       if (role) updates.role = role;
       if (fullName) updates.name = fullName;
       if (mobile) updates.mobile = mobile;
       if (location) updates.location = location;
       if (landSurveyNumber) updates.landSurveyNumber = landSurveyNumber;
       if (Object.keys(updates).length > 0) {
         await userRef.update(updates);
       }
       return res.status(200).json({ message: 'User updated', user: { ...userDoc.data(), ...updates } });
    }

    return res.status(200).json({ message: 'User already exists', user: userDoc.data() });
  } catch (error) {
    console.error('Error syncing user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyFarmer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { uid } = req.user;
    const { imageUrl, imageBase64 } = req.body;

    const userRef = db.collection('users').doc(uid);
    const updates: any = {
      lastVerifiedAt: new Date().toISOString(),
      verificationStatus: 'pending',
    };

    // Store the base64 image directly (works on ephemeral hosts like Render)
    if (imageBase64) {
      updates.cropVerificationImage = imageBase64;
    } else if (imageUrl) {
      updates.cropVerificationUrl = imageUrl;
    }

    await userRef.update(updates);

    return res.status(200).json({ 
      message: 'Verification successful', 
      lastVerifiedAt: updates.lastVerifiedAt 
    });
  } catch (error: any) {
    console.error('Error verifying farmer:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getUserConversation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { uid } = req.user;

    const convoDoc = await db.collection('conversations').doc(uid).get();
    if (!convoDoc.exists) {
      return res.status(200).json({ messages: [] });
    }

    return res.status(200).json(convoDoc.data());
  } catch (error) {
    console.error('Error fetching user conversation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendMessageToAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { uid, email, name, role } = req.user;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const convoRef = db.collection('conversations').doc(uid);
    const convoDoc = await convoRef.get();

    const newMsg = {
      id: Date.now().toString(),
      senderId: uid,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      isAdmin: false
    };

    if (!convoDoc.exists) {
      const userDoc = await db.collection('users').doc(uid).get();
      const userData = userDoc.data() || {};
      const userName = userData.name || userData.fullName || name || email || 'User';

      const newConvo = {
        id: uid,
        userId: uid,
        userName,
        userType: role || userData.role || 'farmer',
        lastMessage: text.trim(),
        timestamp: newMsg.timestamp,
        unread: true,
        unreadAdmin: true,
        messages: [newMsg]
      };
      await convoRef.set(newConvo);
      return res.status(201).json({ message: 'Message sent', conversation: newConvo });
    } else {
      const currentMessages = convoDoc.data()?.messages || [];
      await convoRef.update({
        messages: [...currentMessages, newMsg],
        lastMessage: text.trim(),
        timestamp: newMsg.timestamp,
        unread: true,
        unreadAdmin: true
      });
      return res.status(200).json({ message: 'Message sent', reply: newMsg });
    }
  } catch (error) {
    console.error('Error sending message to admin:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
