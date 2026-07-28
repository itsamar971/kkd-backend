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

    let finalUrl = imageUrl;

    if (imageBase64) {
      const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Save locally to public/uploads
        const uploadsDir = path.join(__dirname, '../../public/uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const fileName = `crop_${uid}_${Date.now()}.jpg`;
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, buffer);
        
        // Construct the URL to serve the file
        finalUrl = `http://localhost:3000/public/uploads/${fileName}`;
      }
    }

    const userRef = db.collection('users').doc(uid);
    const updates: any = {
      lastVerifiedAt: new Date().toISOString(),
    };
    if (finalUrl) {
      updates.cropVerificationUrl = finalUrl;
    }

    await userRef.update(updates);

    return res.status(200).json({ message: 'Verification successful', lastVerifiedAt: updates.lastVerifiedAt, url: finalUrl });
  } catch (error: any) {
    console.error('Error verifying farmer:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
