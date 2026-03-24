// Firebase to PostgreSQL User Migration Script
const admin = require('firebase-admin');
const { Pool } = require('pg');

// Firebase configuration
const serviceAccount = require('./firebase-service-account.json'); // You'll need to provide this

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'bulkemail-crm'
});

const db = admin.firestore();
const auth = admin.auth();

// PostgreSQL configuration
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'aicrm'
});

async function migrateUsers() {
  try {
    console.log('🔍 Fetching users from Firebase Firestore...');
    
    // Get all users from Firestore
    const usersSnapshot = await db.collection('users').get();
    const firestoreUsers = [];
    
    usersSnapshot.forEach(doc => {
      firestoreUsers.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Found ${firestoreUsers.length} users in Firestore`);
    
    // Get all Firebase Auth users
    const authUsers = await auth.listUsers();
    console.log(`✅ Found ${authUsers.users.length} users in Firebase Auth`);
    
    // Connect to PostgreSQL
    await pool.connect();
    console.log('✅ Connected to PostgreSQL');
    
    let migrated = 0;
    let skipped = 0;
    
    for (const user of firestoreUsers) {
      try {
        // Check if user already exists in PostgreSQL
        const existingUser = await pool.query(
          'SELECT id FROM users WHERE email = $1',
          [user.email]
        );
        
        if (existingUser.rows.length > 0) {
          console.log(`⚠️  User ${user.email} already exists, skipping...`);
          skipped++;
          continue;
        }
        
        // Find corresponding Auth user to get creation time
        const authUser = authUsers.users.find(u => u.email === user.email);
        
        // Insert into PostgreSQL
        await pool.query(`
          INSERT INTO users (
            id,
            email,
            password,
            first_name,
            last_name,
            phone,
            role,
            status,
            avatar,
            department,
            preferences,
            permissions,
            email_verified,
            last_login_at,
            created_at,
            updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
          )
        `, [
          user.id || authUser?.uid,
          user.email || authUser?.email,
          'MIGRATED_FROM_FIREBASE', // Placeholder password
          user.firstName || user.first_name || '',
          user.lastName || user.last_name || '',
          user.phone || null,
          user.role || 'sales_rep',
          user.status || 'active',
          user.avatar || null,
          user.department || null,
          JSON.stringify(user.preferences || {}),
          JSON.stringify(user.permissions || []),
          user.emailVerified || user.email_verified || true,
          user.lastLoginAt || user.last_login_at || null,
          authUser?.metadata.creationTime ? new Date(authUser.metadata.creationTime) : new Date(),
          new Date()
        ]);
        
        console.log(`✅ Migrated user: ${user.email}`);
        migrated++;
        
      } catch (error) {
        console.error(`❌ Error migrating user ${user.email}:`, error.message);
      }
    }
    
    console.log('\n🎉 Migration Summary:');
    console.log(`   Total Firestore users: ${firestoreUsers.length}`);
    console.log(`   Successfully migrated: ${migrated}`);
    console.log(`   Skipped (already exist): ${skipped}`);
    console.log(`   Failed: ${firestoreUsers.length - migrated - skipped}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Create admin user with specified credentials
async function createAdminUser() {
  try {
    const bcrypt = require('bcrypt');
    
    await pool.connect();
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await pool.query(`
      INSERT INTO users (
        email,
        password,
        first_name,
        last_name,
        role,
        status,
        email_verified,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (email) DO NOTHING
    `, [
      'admin@pandicrm.com',
      hashedPassword,
      'System',
      'Administrator',
      'admin',
      'active',
      true,
      new Date(),
      new Date()
    ]);
    
    console.log('✅ Admin user created/updated: admin@pandicrm.com');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

// Run migration
if (process.argv.includes('--admin-only')) {
  createAdminUser();
} else {
  migrateUsers().then(() => {
    // Create admin user after migration
    createAdminUser();
  });
}
