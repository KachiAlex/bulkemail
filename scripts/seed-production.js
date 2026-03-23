// Production admin user seeding for Render
const { Pool } = require('pg');

async function createAdminUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const bcrypt = require('bcrypt');
    
    console.log('✅ Connected to production database');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Check if admin user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@pandicrm.com']
    );
    
    if (existingUser.rows.length > 0) {
      console.log('⚠️  Admin user already exists, updating...');
      
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
    
    console.log('\n📋 Production Admin Account:');
    console.log('   Email: admin@pandicrm.com');
    console.log('   Password: admin123');
    console.log('   Role: admin');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createAdminUser();
