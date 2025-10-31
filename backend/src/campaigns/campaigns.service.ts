import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Campaign, CampaignStatus } from './entities/campaign.entity';
import { Message, MessageStatus } from './entities/message.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { ContactsService } from '../contacts/contacts.service';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectQueue('campaigns')
    private campaignsQueue: Queue,
    private contactsService: ContactsService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  async create(createCampaignDto: CreateCampaignDto, userId: string): Promise<Campaign> {
    // Get recipients
    let recipients = [];
    
    if (createCampaignDto.segmentId) {
      recipients = await this.contactsService.getSegmentContacts(createCampaignDto.segmentId);
    } else if (createCampaignDto.recipientContactIds?.length > 0) {
      recipients = await Promise.all(
        createCampaignDto.recipientContactIds.map(id => 
          this.contactsService.findOne(id)
        )
      );
    }

    if (recipients.length === 0) {
      throw new BadRequestException('No recipients found for campaign');
    }

    const campaign = this.campaignsRepository.create({
      ...createCampaignDto,
      createdById: userId,
      totalRecipients: recipients.length,
    });

    const savedCampaign = await this.campaignsRepository.save(campaign);

    // Create message records for each recipient
    const messages = recipients.map(contact => ({
      campaignId: savedCampaign.id,
      contactId: contact.id,
      recipientEmail: contact.email,
      recipientPhone: contact.phone,
      subject: this.personalizeContent(createCampaignDto.subject || '', contact),
      content: this.personalizeContent(createCampaignDto.content, contact),
      status: MessageStatus.PENDING,
    }));

    await this.messagesRepository.save(messages);

    return savedCampaign;
  }

  async findAll(userId?: string): Promise<Campaign[]> {
    const where: any = {};
    if (userId) {
      where.createdById = userId;
    }

    return this.campaignsRepository.find({
      where,
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaignsRepository.findOne({
      where: { id },
      relations: ['createdBy', 'messages'],
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  async sendCampaign(id: string): Promise<Campaign> {
    const campaign = await this.findOne(id);

    if (campaign.status !== CampaignStatus.DRAFT && campaign.status !== CampaignStatus.PAUSED) {
      throw new BadRequestException('Campaign can only be sent from draft or paused status');
    }

    if (campaign.scheduledAt && new Date(campaign.scheduledAt) > new Date()) {
      campaign.status = CampaignStatus.SCHEDULED;
      await this.campaignsRepository.save(campaign);
      
      // Schedule the campaign
      await this.campaignsQueue.add('send-scheduled-campaign', { campaignId: id }, {
        delay: new Date(campaign.scheduledAt).getTime() - Date.now(),
      });
    } else {
      campaign.status = CampaignStatus.SENDING;
      await this.campaignsRepository.save(campaign);
      
      // Queue the campaign for immediate sending
      await this.campaignsQueue.add('send-campaign', { campaignId: id });
    }

    return campaign;
  }

  async processCampaignSending(campaignId: string): Promise<void> {
    const campaign = await this.findOne(campaignId);
    
    campaign.status = CampaignStatus.SENDING;
    await this.campaignsRepository.save(campaign);

    const messages = await this.messagesRepository.find({
      where: { campaignId, status: MessageStatus.PENDING },
      relations: ['contact'],
    });

    for (const message of messages) {
      try {
        if (campaign.type === 'email') {
          await this.emailService.sendEmail({
            to: message.recipientEmail,
            subject: message.subject,
            text: message.content,
            html: campaign.htmlContent,
          });
        } else if (campaign.type === 'sms') {
          await this.smsService.sendSms({
            to: message.recipientPhone,
            body: message.content,
          });
        }

        message.status = MessageStatus.SENT;
        message.sentAt = new Date();
        campaign.sentCount++;
      } catch (error) {
        message.status = MessageStatus.FAILED;
        message.errorMessage = error.message;
        campaign.failedCount++;
      }

      await this.messagesRepository.save(message);
    }

    campaign.status = CampaignStatus.SENT;
    campaign.sentAt = new Date();
    await this.campaignsRepository.save(campaign);
  }

  async pauseCampaign(id: string): Promise<Campaign> {
    const campaign = await this.findOne(id);
    campaign.status = CampaignStatus.PAUSED;
    return this.campaignsRepository.save(campaign);
  }

  async cancelCampaign(id: string): Promise<Campaign> {
    const campaign = await this.findOne(id);
    campaign.status = CampaignStatus.CANCELLED;
    return this.campaignsRepository.save(campaign);
  }

  async getCampaignStats(id: string): Promise<any> {
    const campaign = await this.findOne(id);

    const stats = {
      totalRecipients: campaign.totalRecipients,
      sent: campaign.sentCount,
      delivered: campaign.deliveredCount,
      failed: campaign.failedCount,
      opened: campaign.openedCount,
      clicked: campaign.clickedCount,
      unsubscribed: campaign.unsubscribedCount,
      openRate: campaign.sentCount > 0 ? (campaign.openedCount / campaign.sentCount) * 100 : 0,
      clickRate: campaign.sentCount > 0 ? (campaign.clickedCount / campaign.sentCount) * 100 : 0,
      deliveryRate: campaign.sentCount > 0 ? (campaign.deliveredCount / campaign.sentCount) * 100 : 0,
    };

    return stats;
  }

  async updateMessageStatus(messageId: string, status: MessageStatus): Promise<void> {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId },
      relations: ['campaign'],
    });

    if (!message) {
      return;
    }

    message.status = status;

    if (status === MessageStatus.DELIVERED) {
      message.deliveredAt = new Date();
      message.campaign.deliveredCount++;
    } else if (status === MessageStatus.OPENED) {
      message.openedAt = new Date();
      message.openCount++;
      message.campaign.openedCount++;
    } else if (status === MessageStatus.CLICKED) {
      message.clickedAt = new Date();
      message.clickCount++;
      message.campaign.clickedCount++;
    }

    await this.messagesRepository.save(message);
    await this.campaignsRepository.save(message.campaign);
  }

  private personalizeContent(content: string, contact: any): string {
    if (!content) return '';
    
    return content
      .replace(/{{firstName}}/g, contact.firstName || '')
      .replace(/{{lastName}}/g, contact.lastName || '')
      .replace(/{{fullName}}/g, contact.fullName || '')
      .replace(/{{email}}/g, contact.email || '')
      .replace(/{{company}}/g, contact.company || '')
      .replace(/{{jobTitle}}/g, contact.jobTitle || '');
  }

  async remove(id: string): Promise<void> {
    const campaign = await this.findOne(id);
    await this.campaignsRepository.remove(campaign);
  }
}

