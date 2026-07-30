import { initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';
import fs from 'fs';

let app: App;

const serviceAccountPath = path.resolve(process.cwd(), 'firebaseServiceAccountKey.json');

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  // Production: use the service account JSON from environment variable
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || 'kisan-ka-dukan',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'kisan-ka-dukan.firebasestorage.app'
  });
  console.log('✅ Firebase Admin initialized with FIREBASE_SERVICE_ACCOUNT_KEY from env.');
} else if (fs.existsSync(serviceAccountPath)) {
  // Local development: use the service account JSON file
  app = initializeApp({
    credential: cert(serviceAccountPath),
    projectId: process.env.FIREBASE_PROJECT_ID || 'kisan-ka-dukan',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'kisan-ka-dukan.firebasestorage.app'
  });
  console.log('✅ Firebase Admin initialized with Service Account Key file.');
} else {
  // Production / Cloud environments: use Application Default Credentials
  // Works automatically on Google Cloud Run, App Engine, etc.
  app = initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'kisan-ka-dukan',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'kisan-ka-dukan.firebasestorage.app'
  });
  console.warn('⚠️  firebaseServiceAccountKey.json not found.');
  console.warn('   Using Application Default Credentials (works on Google Cloud).');
  console.warn('   For local dev: Download your Service Account Key from Firebase Console.');
  console.warn('   Firebase Console → Project Settings → Service Accounts → Generate new private key');
  console.warn('   Save it as: firebaseServiceAccountKey.json in the project root.');
}

export const db = getFirestore(app);
export const auth = getAuth(app);
