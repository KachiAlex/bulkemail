// Run database migrations for Render
const { execSync } = require('child_process');

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Run TypeORM migrations
    execSync('npm run migration:run', { stdio: 'inherit' });
    
    console.log('✅ Migrations completed successfully!');
    
    // Now seed the admin user
    console.log('\n🌱 Creating admin user...');
    execSync('npm run seed:prod', { stdio: 'inherit' });
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
