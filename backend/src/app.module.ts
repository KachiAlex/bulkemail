import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContactsModule } from './contacts/contacts.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { TelephonyModule } from './telephony/telephony.module';
import { AiModule } from './ai/ai.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CommonModule } from './common/common.module';
import { SeedsModule } from './seeds/seeds.module';
import { HealthController } from './health.controller';
import { SeedController } from './seed.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    import { User } from './users/entities/user.entity';
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL');
        const config: any = {
          type: 'postgres',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          subscribers: [__dirname + '/**/*.subscriber{.ts,.js}'],
          synchronize: true,
          logging: configService.get('NODE_ENV') === 'development',
          ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
        };

        if (databaseUrl) {
          config.url = databaseUrl;
        } else {
          config.host = configService.get('DATABASE_HOST') || 'localhost';
          config.port = configService.get('DATABASE_PORT') || 5432;
          config.username = configService.get('DATABASE_USERNAME') || 'postgres';
          config.password = configService.get('DATABASE_PASSWORD') || 'postgres';
          config.database = configService.get('DATABASE_NAME') || 'aicrm';
        }

        return config;
      },
      inject: [ConfigService],
    }),

    // Redis & Bull
    BullModule.forRootAsync({
                User,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Feature modules
    CommonModule,
    SeedsModule,
    AuthModule,
    UsersModule,
    ContactsModule,
    CampaignsModule,
    TelephonyModule,
    AiModule,
    AnalyticsModule,
  ],
  controllers: [HealthController, SeedController],
})
export class AppModule {}

