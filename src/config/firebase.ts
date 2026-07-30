import { initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import path from 'path';
import fs from 'fs';

let app: App;
let db: Firestore;
let auth: Auth;

const serviceAccountPath = path.resolve(process.cwd(), 'firebaseServiceAccountKey.json');

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Production: use the service account JSON from single environment variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || 'kisan-ka-dukan',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'kisan-ka-dukan.firebasestorage.app'
    });
    console.log('✅ Firebase Admin initialized with FIREBASE_SERVICE_ACCOUNT_KEY from env.');
  } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    // Production: use individual environment variables (Render/Vercel style)
    // Handle escaped newlines in private key
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      projectId: process.env.FIREBASE_PROJECT_ID || 'kisan-ka-dukan',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'kisan-ka-dukan.firebasestorage.app'
    });
    console.log('✅ Firebase Admin initialized with individual FIREBASE_ env vars.');
  } else if (fs.existsSync(serviceAccountPath)) {
    // Local development: use the service account JSON file
    app = initializeApp({
      credential: cert(serviceAccountPath),
      projectId: process.env.FIREBASE_PROJECT_ID || 'kisan-ka-dukan',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'kisan-ka-dukan.firebasestorage.app'
    });
    console.log('✅ Firebase Admin initialized with Service Account Key file.');
  } else {
    // Fallback: no credentials
    app = initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'kisan-ka-dukan',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'kisan-ka-dukan.firebasestorage.app'
    });
    console.warn('⚠️  No Firebase credentials found. Using default app (limited functionality).');
  }

  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error);
  // Initialize with bare minimum so the server doesn't crash
  app = initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'kisan-ka-dukan',
  });
  db = getFirestore(app);
  auth = getAuth(app);
}

export { db, auth };
