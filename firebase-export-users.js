// Simple Firebase Users Export Script
const admin = require('firebase-admin');

// You'll need to download a service account key from Firebase Console
// Project Settings > Service accounts > Generate new private key
const serviceAccount = {
  "type": "service_account",
  "project_id": "bulkemail-crm",
  "private_key_id": "YOUR_PRIVATE_KEY_ID",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@bulkemail-crm.iam.gserviceaccount.com",
  "client_id": "YOUR_CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
};

// Initialize Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'bulkemail-crm'
  });
} catch (error) {
  console.log('Firebase already initialized or config incomplete');
}

const db = admin.firestore();
const auth = admin.auth();

async function exportUsers() {
  try {
    console.log('🔍 Exporting users from Firebase...\n');
    
    // Export Firestore users
    console.log('=== Firestore Users ===');
    const usersSnapshot = await db.collection('users').get();
    const firestoreUsers = [];
    
    usersSnapshot.forEach(doc => {
      firestoreUsers.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Found ${firestoreUsers.length} users in Firestore:`);
    firestoreUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.firstName || user.first_name} ${user.lastName || user.last_name})`);
      console.log(`    Role: ${user.role || 'not set'}`);
      console.log(`    Status: ${user.status || 'not set'}`);
      console.log(`    Created: ${user.createdAt || user.created_at || 'unknown'}`);
      console.log('');
    });
    
    // Export Auth users
    console.log('\n=== Firebase Auth Users ===');
    const authUsers = await auth.listUsers();
    console.log(`Found ${authUsers.users.length} users in Firebase Auth:`);
    
    authUsers.users.forEach(user => {
      console.log(`  - ${user.email}`);
      console.log(`    UID: ${user.uid}`);
      console.log(`    Created: ${user.metadata.creationTime}`);
      console.log(`    Last Login: ${user.metadata.lastSignInTime}`);
      console.log(`    Email Verified: ${user.emailVerified}`);
      console.log('');
    });
    
    // Save to JSON file
    const fs = require('fs');
    const exportData = {
      firestore: firestoreUsers,
      auth: authUsers.users.map(u => ({
        uid: u.uid,
        email: u.email,
        emailVerified: u.emailVerified,
        displayName: u.displayName,
        createdAt: u.metadata.creationTime,
        lastLoginAt: u.metadata.lastSignInTime
      }))
    };
    
    fs.writeFileSync('firebase-users-export.json', JSON.stringify(exportData, null, 2));
    console.log('✅ Export saved to firebase-users-export.json');
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    console.log('\n💡 To fix this:');
    console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/bulkemail-crm');
    console.log('2. Go to Project Settings > Service accounts');
    console.log('3. Click "Generate new private key"');
    console.log('4. Save the JSON file as firebase-service-account.json');
    console.log('5. Update the serviceAccount object in this script');
  }
}

exportUsers();
