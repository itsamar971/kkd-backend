import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin (assuming serviceAccount is set up in backend)
const serviceAccount = require('./serviceAccountKey.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedAdmin() {
  const email = 'admin@kisankadukan.in';
  const password = 'admin9876';

  try {
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      console.log('User already exists, updating password...');
      await admin.auth().updateUser(userRecord.uid, { password });
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        console.log('User not found, creating...');
        userRecord = await admin.auth().createUser({
          email,
          password,
          emailVerified: true
        });
      } else {
        throw e;
      }
    }

    // Set role in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log('Successfully seeded admin user!');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}

seedAdmin();
