import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Contact } from '../contacts/entities/contact.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Call } from '../telephony/entities/call.entity';
import { Message } from '../campaigns/entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contact, Campaign, Call, Message])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

