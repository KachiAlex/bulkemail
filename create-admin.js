// Simple Admin User Creation Script
const { Pool } = require('pg');

// PostgreSQL configuration
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'aicrm'
});

async function createAdminUser() {
  try {
    const bcrypt = require('bcrypt');
    
    await pool.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Check if admin user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@pandicrm.com']
    );
    
    if (existingUser.rows.length > 0) {
      console.log('⚠️  Admin user already exists, updating password...');
      
      // Update existing user
      await pool.query(`
        UPDATE users 
        SET password = $1, role = 'admin', status = 'active', updated_at = $2
        WHERE email = $3
      `, [
        hashedPassword,
        new Date(),
        'admin@pandicrm.com'
      ]);
      
      console.log('✅ Admin user updated successfully!');
    } else {
      // Create new admin user
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
      
      console.log('✅ Admin user created successfully!');
    }
    
    console.log('\n📋 Admin Account Details:');
    console.log('   Email: admin@pandicrm.com');
    console.log('   Password: admin123');
    console.log('   Role: admin');
    console.log('   Status: active');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check database credentials in the script');
    console.log('3. Make sure the "aicrm" database exists');
  } finally {
    await pool.end();
  }
}

createAdminUser();
