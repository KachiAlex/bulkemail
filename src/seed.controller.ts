import { Controller, Post, Get } from '@nestjs/common';
import { AdminSeed } from './seeds/admin.seed';

@Controller('seed')
export class SeedController {
  constructor(private adminSeed: AdminSeed) {}

  @Post('admin')
  async createAdmin() {
    try {
      const admin = await this.adminSeed.createAdminUser();
      return {
        success: true,
        message: 'Admin user created successfully',
        admin: {
          email: admin.email,
          role: admin.role,
          status: admin.status
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Get('admin')
  async checkAdmin() {
    try {
      const admin = await this.adminSeed.createAdminUser();
      return {
        success: true,
        message: 'Admin user exists or created successfully',
        admin: {
          email: admin.email,
          role: admin.role,
          status: admin.status
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}
