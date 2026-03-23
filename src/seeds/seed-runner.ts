import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminSeed } from './admin.seed';

async function runSeeds() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminSeed = app.get(AdminSeed);
  
  try {
    await adminSeed.createAdminUser();
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await app.close();
  }
}

runSeeds();
