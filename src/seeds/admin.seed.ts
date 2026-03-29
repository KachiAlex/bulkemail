import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';

// Firebase Web API key (public — same key present in the frontend bundle)
const FIREBASE_WEB_API_KEY = 'AIzaSyDYMfJp4hZe1JACTdqA3uDdWggSZI365GU';

@Injectable()
export class AdminSeed {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createAdminUser() {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const existingAdmin = await this.usersRepository.findOne({
      where: { email: 'admin@pandicrm.com' },
    });

    if (existingAdmin) {
      // Always reset to ensure the password is correct
      await this.usersRepository.update(existingAdmin.id, {
        password: hashedPassword,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: true,
      });
      console.log('✅ Admin user password reset successfully');
      return { ...existingAdmin, password: hashedPassword };
    }
    
    const adminUser = this.usersRepository.create({
      email: 'admin@pandicrm.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    });

    const savedUser = await this.usersRepository.save(adminUser);
    console.log('✅ Admin user created successfully');
    console.log(`   Email: admin@pandicrm.com`);
    console.log(`   Password: admin123`);
    console.log(`   Role: admin`);
    
    return savedUser;
    await this.ensureFirebaseAuthUser('admin@pandicrm.com', 'admin123');

    return savedUser;
  }

  /** Creates or resets the Firebase Auth user so Firestore CRM data is accessible after login. */
  private async ensureFirebaseAuthUser(email: string, password: string): Promise<void> {
    try {
      // Try to sign in first; if it works the user already exists
      const signInRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, returnSecureToken: false }),
        },
      );
      if (signInRes.ok) {
        console.log('✅ Firebase Auth user already exists for', email);
        return;
      }

      // User doesn't exist — create it
      const createRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_WEB_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, returnSecureToken: false }),
        },
      );
      if (createRes.ok) {
        console.log('✅ Firebase Auth user created for', email);
      } else {
        const err = await createRes.json();
        console.warn('⚠️  Firebase Auth user creation failed:', err?.error?.message);
      }
    } catch (e) {
      console.warn('⚠️  Could not provision Firebase Auth user (non-fatal):', e);
    }
  }
}
