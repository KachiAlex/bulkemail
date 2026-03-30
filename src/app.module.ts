import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from './users/entities/user.entity';
import { EmailController } from './email/email.controller';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContactsModule } from './contacts/contacts.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { TelephonyModule } from './telephony/telephony.module';
import { AiModule } from './ai/ai.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { EmailTemplatesModule } from './email-templates/email-templates.module';
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
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL');
        const config: any = {
          type: 'postgres',
          autoLoadEntities: true,
          entities: [User, __dirname + '/**/*.entity{.ts,.js}'],
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
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get('REDIS_URL');
        const password = configService.get('REDIS_PASSWORD');
        const tlsEnabled = configService.get('REDIS_TLS') === 'true';

        if (redisUrl) {
          const redisOptions: any = { url: redisUrl };
          if (password) redisOptions.password = password;
          if (tlsEnabled) redisOptions.tls = {};
          return { redis: redisOptions };
        }

        return {
          redis: {
            host: configService.get('REDIS_HOST') || 'localhost',
            port: Number(configService.get('REDIS_PORT')) || 6379,
            password: password || undefined,
            tls: tlsEnabled ? {} : undefined,
          },
        };
      },
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
    EmailTemplatesModule,
  ],
  controllers: [HealthController, SeedController, EmailController],
})
export class AppModule {}

