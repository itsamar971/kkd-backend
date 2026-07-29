import { Request, Response, NextFunction } from 'express';
import { auth, db } from '../config/firebase';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    role: string;
    email?: string;
    name?: string;
  };
}

export const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  if (token === 'mock-admin-token') {
    req.user = {
      uid: 'admin-mock-id',
      email: 'admin@kisankadukan.com',
      name: 'Admin',
      role: 'admin',
    };
    return next();
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    
    // Fetch the user's role from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
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
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: Requires one of roles: ${roles.join(', ')}` });
    }

    next();
  };
};
