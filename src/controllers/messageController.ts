import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const listConversations = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('conversations').orderBy('timestamp', 'desc').get();
    
    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const replyToConversation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const convoRef = db.collection('conversations').doc(id as string);
    const convoDoc = await convoRef.get();

    if (!convoDoc.exists) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const message = {
      id: Date.now().toString(),
      senderId: 'admin',
      text,
      timestamp: new Date().toISOString(),
      isAdmin: true
    };

    const currentMessages = convoDoc.data()?.messages || [];
    
    await convoRef.update({
      messages: [...currentMessages, message],
      lastMessage: text,
      timestamp: message.timestamp,
      unreadAdmin: false
    });

    return res.status(200).json({ message: 'Reply sent successfully', reply: message });
  } catch (error) {
    console.error('Error replying to conversation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
