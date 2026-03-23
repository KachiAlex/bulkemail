import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';

@Injectable()
export class AdminSeed {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createAdminUser() {
    const existingAdmin = await this.usersRepository.findOne({
      where: { email: 'admin@pandicrm.com' },
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return existingAdmin;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
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
  }
}
