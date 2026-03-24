// Admin User Creation with SQLite (no PostgreSQL required)
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Create database file
const dbPath = path.join(__dirname, 'admin-db.sqlite');
const db = new sqlite3.Database(dbPath);

async function createAdminUser() {
  return new Promise((resolve, reject) => {
    console.log('✅ Using SQLite database (no PostgreSQL required)');
    
    // Create users table if it doesn't exist
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          first_name TEXT,
          last_name TEXT,
          phone TEXT,
          role TEXT DEFAULT 'sales_rep',
          status TEXT DEFAULT 'active',
          avatar TEXT,
          department TEXT,
          preferences TEXT,
          permissions TEXT,
          email_verified BOOLEAN DEFAULT true,
          refresh_token TEXT,
          last_login_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating table:', err.message);
          reject(err);
          return;
        }
        
        console.log('✅ Users table created/verified');
        
        // Hash the password
        bcrypt.hash('admin123', 10, (err, hashedPassword) => {
          if (err) {
            console.error('❌ Error hashing password:', err.message);
            reject(err);
            return;
          }
          
          // Check if admin exists
          db.get(
            'SELECT id FROM users WHERE email = ?',
            ['admin@pandicrm.com'],
            (err, row) => {
              if (err) {
                console.error('❌ Error checking existing user:', err.message);
                reject(err);
                return;
              }
              
              if (row) {
                console.log('⚠️  Admin user already exists, updating...');
                
                // Update existing admin
                db.run(`
                  UPDATE users 
                  SET password = ?, role = 'admin', status = 'active', updated_at = CURRENT_TIMESTAMP
                  WHERE email = ?
                `, [hashedPassword, 'admin@pandicrm.com'], (err) => {
                  if (err) {
                    console.error('❌ Error updating user:', err.message);
                    reject(err);
                    return;
                  }
                  
                  console.log('✅ Admin user updated successfully!');
                  printAdminDetails();
                  resolve();
                });
              } else {
                // Create new admin user
                const adminId = 'admin-' + Date.now();
                db.run(`
                  INSERT INTO users (
                    id, email, password, first_name, last_name, role, status, email_verified
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                  adminId,
                  'admin@pandicrm.com',
                  hashedPassword,
                  'System',
                  'Administrator',
                  'admin',
                  'active',
                  1
                ], (err) => {
                  if (err) {
                    console.error('❌ Error creating user:', err.message);
                    reject(err);
                    return;
                  }
                  
                  console.log('✅ Admin user created successfully!');
                  printAdminDetails();
                  resolve();
                });
              }
            }
          );
        });
      });
    });
  });
}

function printAdminDetails() {
  console.log('\n📋 Admin Account Details:');
  console.log('   Email: admin@pandicrm.com');
  console.log('   Password: admin123');
  console.log('   Role: admin');
  console.log('   Status: active');
  console.log('\n📁 Database saved to: admin-db.sqlite');
  console.log('\n💡 Next steps:');
  console.log('1. Start your backend with this database');
  console.log('2. Login at: https://bulkemail-crm.web.app/login');
  console.log('3. Use the credentials above');
}

// Install sqlite3 if needed
try {
  require('sqlite3');
  createAdminUser().then(() => {
    db.close();
    console.log('\n🎉 Admin account ready!');
  }).catch(err => {
    console.error('❌ Failed:', err.message);
    db.close();
  });
} catch (error) {
  console.log('Installing sqlite3...');
  const { exec } = require('child_process');
  exec('npm install sqlite3', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Failed to install sqlite3:', error);
      return;
    }
    console.log('✅ sqlite3 installed, retrying...');
    // Retry after installation
    setTimeout(() => {
      require('sqlite3');
      createAdminUser().then(() => {
        db.close();
        console.log('\n🎉 Admin account ready!');
      }).catch(err => {
        console.error('❌ Failed:', err.message);
        db.close();
      });
    }, 2000);
  });
}
