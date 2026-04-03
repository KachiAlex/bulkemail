import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { AdminSeed } from './admin.seed';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([User])],
  providers: [AdminSeed],
  exports: [AdminSeed],
})
export class SeedsModule {}
