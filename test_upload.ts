import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  const serviceAccountPath = path.resolve(process.cwd(), 'firebaseServiceAccountKey.json');
  
  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccountPath),
      projectId: 'kisan-ka-dukan',
      storageBucket: 'kisan-ka-dukan.firebasestorage.app'
    });
  }

  try {
    const bucket = getStorage().bucket();
    const buffer = Buffer.from('test string base64 fake payload', 'utf-8');
    const file = bucket.file(`test/test_${Date.now()}.txt`);
    console.log('Saving file...');
    await file.save(buffer, { contentType: 'text/plain' });
    console.log('Saved successfully!');
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

run();
