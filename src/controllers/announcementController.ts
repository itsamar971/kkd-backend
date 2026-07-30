import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { AuthenticatedRequest } from '../middleware/auth';

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

export const getAnnouncementsForUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userRole = req.user?.role || 'farmer';
    const snap = await db.collection('announcements').orderBy('createdAt', 'desc').get();
    
    const data = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((a: any) => a.targetAudience === 'all' || a.targetAudience === userRole || a.targetAudience === (userRole === 'farmer' ? 'farmers' : 'buyers'));
      
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching user announcements:', error);
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

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.collection('announcements').doc(id as string).delete();
    return res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
