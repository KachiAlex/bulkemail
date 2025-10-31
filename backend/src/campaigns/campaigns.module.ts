import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { Campaign } from './entities/campaign.entity';
import { Message } from './entities/message.entity';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { ContactsModule } from '../contacts/contacts.module';
import { CampaignsProcessor } from './processors/campaigns.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign, Message]),
    BullModule.registerQueue({
      name: 'campaigns',
    }),
    ContactsModule,
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService, EmailService, SmsService, CampaignsProcessor],
  exports: [CampaignsService, EmailService, SmsService],
})
export class CampaignsModule {}

