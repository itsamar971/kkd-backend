import { Request, Response } from 'express';
import { db } from '../config/firebase';

const SETTINGS_DOC_ID = 'platform_settings';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const docRef = db.collection('config').doc(SETTINGS_DOC_ID);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      const defaultSettings = {
        platformName: 'Kisan Ka Dukan',
        supportEmail: 'support@kisankadukan.com',
        emailAlerts: true,
        smsAlerts: false,
        twoFactorAuth: false,
        sessionTimeout: 30,
        theme: 'light',
        currency: 'INR',
        language: 'en',
        platformCommissionPercent: 10,
        baseDeliveryFee: 50
      };
      await docRef.set(defaultSettings);
      return res.status(200).json(defaultSettings);
    }
    
    return res.status(200).json(doc.data());
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const docRef = db.collection('config').doc(SETTINGS_DOC_ID);
    
    await docRef.set(updates, { merge: true });
    
    const updatedDoc = await docRef.get();
    return res.status(200).json(updatedDoc.data());
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
