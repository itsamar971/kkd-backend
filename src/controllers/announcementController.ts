import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const snap = await db.collection('announcements').orderBy('createdAt', 'desc').get();
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, message, targetAudience } = req.body;
    const docRef = await db.collection('announcements').add({
      title,
      message,
      targetAudience,
      createdAt: new Date().toISOString()
    });
    return res.status(201).json({ id: docRef.id, title, message, targetAudience });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
