import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../contacts/entities/contact.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Call } from '../telephony/entities/call.entity';
import { Message } from '../campaigns/entities/message.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Contact)
    private contactsRepository: Repository<Contact>,
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
    @InjectRepository(Call)
    private callsRepository: Repository<Call>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async getDashboardStats(userId?: string): Promise<any> {
    const where: any = userId ? { ownerId: userId } : {};
    const campaignWhere: any = userId ? { createdById: userId } : {};
    const callWhere: any = userId ? { userId } : {};

    // Contact stats
    const totalContacts = await this.contactsRepository.count({ where });
    const newContactsThisMonth = await this.contactsRepository
      .createQueryBuilder('contact')
      .where('contact.createdAt >= :startDate', {
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      })
      .getCount();

    const contactsByStatus = await this.contactsRepository
      .createQueryBuilder('contact')
      .select('contact.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('contact.status')
      .getRawMany();

    const avgLeadScore = await this.contactsRepository
      .createQueryBuilder('contact')
      .select('AVG(contact.leadScore)', 'avg')
      .getRawOne();

    // Campaign stats
    const totalCampaigns = await this.campaignsRepository.count({
      where: campaignWhere,
    });

    const campaignStats = await this.campaignsRepository
      .createQueryBuilder('campaign')
      .select('SUM(campaign.sentCount)', 'totalSent')
      .addSelect('SUM(campaign.openedCount)', 'totalOpened')
      .addSelect('SUM(campaign.clickedCount)', 'totalClicked')
      .addSelect('SUM(campaign.deliveredCount)', 'totalDelivered')
      .getRawOne();

    const emailOpenRate =
      campaignStats.totalSent > 0
        ? (campaignStats.totalOpened / campaignStats.totalSent) * 100
        : 0;

    const clickThroughRate =
      campaignStats.totalSent > 0
        ? (campaignStats.totalClicked / campaignStats.totalSent) * 100
        : 0;

    // Call stats
    const totalCalls = await this.callsRepository.count({ where: callWhere });
    const completedCalls = await this.callsRepository.count({
      where: { ...callWhere, status: 'completed' },
    });

    const avgCallDuration = await this.callsRepository
      .createQueryBuilder('call')
      .select('AVG(call.duration)', 'avg')
      .where('call.duration > 0')
      .getRawOne();

    const callsByDisposition = await this.callsRepository
      .createQueryBuilder('call')
      .select('call.disposition', 'disposition')
      .addSelect('COUNT(*)', 'count')
      .where('call.disposition IS NOT NULL')
      .groupBy('call.disposition')
      .getRawMany();

    return {
      contacts: {
        total: totalContacts,
        newThisMonth: newContactsThisMonth,
        byStatus: contactsByStatus,
        avgLeadScore: parseFloat(avgLeadScore.avg) || 0,
      },
      campaigns: {
        total: totalCampaigns,
        totalSent: parseInt(campaignStats.totalSent) || 0,
        totalOpened: parseInt(campaignStats.totalOpened) || 0,
        totalClicked: parseInt(campaignStats.totalClicked) || 0,
        totalDelivered: parseInt(campaignStats.totalDelivered) || 0,
        openRate: emailOpenRate,
        clickThroughRate,
      },
      calls: {
        total: totalCalls,
        completed: completedCalls,
        avgDuration: parseFloat(avgCallDuration.avg) || 0,
        byDisposition: callsByDisposition,
      },
    };
  }

  async getContactEngagementTrends(days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const newContacts = await this.contactsRepository
      .createQueryBuilder('contact')
      .select("DATE(contact.createdAt)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('contact.createdAt >= :startDate', { startDate })
      .groupBy('DATE(contact.createdAt)')
      .orderBy('DATE(contact.createdAt)', 'ASC')
      .getRawMany();

    return {
      period: `${days} days`,
      newContacts,
    };
  }

  async getCampaignPerformance(campaignId?: string): Promise<any> {
    const query = this.campaignsRepository
      .createQueryBuilder('campaign')
      .select([
        'campaign.id',
        'campaign.name',
        'campaign.type',
        'campaign.status',
        'campaign.totalRecipients',
        'campaign.sentCount',
        'campaign.openedCount',
        'campaign.clickedCount',
        'campaign.deliveredCount',
        'campaign.createdAt',
      ])
      .orderBy('campaign.createdAt', 'DESC')
      .limit(10);

    if (campaignId) {
      query.where('campaign.id = :campaignId', { campaignId });
    }

    const campaigns = await query.getMany();

    return campaigns.map(campaign => ({
      ...campaign,
      openRate:
        campaign.sentCount > 0
          ? (campaign.openedCount / campaign.sentCount) * 100
          : 0,
      clickRate:
        campaign.sentCount > 0
          ? (campaign.clickedCount / campaign.sentCount) * 100
          : 0,
      deliveryRate:
        campaign.sentCount > 0
          ? (campaign.deliveredCount / campaign.sentCount) * 100
          : 0,
    }));
  }

  async getLeadSourceAnalysis(): Promise<any> {
    const contactsBySource = await this.contactsRepository
      .createQueryBuilder('contact')
      .select('contact.source', 'source')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(contact.leadScore)', 'avgLeadScore')
      .where('contact.source IS NOT NULL')
      .groupBy('contact.source')
      .orderBy('count', 'DESC')
      .getRawMany();

    return contactsBySource;
  }

  async getUserPerformance(): Promise<any> {
    const userStats = await this.contactsRepository
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.owner', 'owner')
      .select('owner.id', 'userId')
      .addSelect('owner.firstName', 'firstName')
      .addSelect('owner.lastName', 'lastName')
      .addSelect('COUNT(DISTINCT contact.id)', 'contactsManaged')
      .addSelect('AVG(contact.leadScore)', 'avgLeadScore')
      .where('owner.id IS NOT NULL')
      .groupBy('owner.id')
      .addGroupBy('owner.firstName')
      .addGroupBy('owner.lastName')
      .getRawMany();

    // Get call stats per user
    const callStats = await this.callsRepository
      .createQueryBuilder('call')
      .select('call.userId', 'userId')
      .addSelect('COUNT(*)', 'totalCalls')
      .addSelect('SUM(CASE WHEN call.status = :completed THEN 1 ELSE 0 END)', 'completedCalls')
      .addSelect('AVG(call.duration)', 'avgDuration')
      .setParameter('completed', 'completed')
      .groupBy('call.userId')
      .getRawMany();

    // Merge stats
    const mergedStats = userStats.map(user => {
      const calls = callStats.find(c => c.userId === user.userId) || {
        totalCalls: 0,
        completedCalls: 0,
        avgDuration: 0,
      };

      return {
        ...user,
        ...calls,
        avgLeadScore: parseFloat(user.avgLeadScore) || 0,
      };
    });

    return mergedStats;
  }

  async getConversionFunnel(): Promise<any> {
    const statuses = ['new', 'contacted', 'qualified', 'negotiating', 'converted'];
    
    const funnelData = await Promise.all(
      statuses.map(async status => {
        const count = await this.contactsRepository.count({
          where: { status: status as any },
        });
        return { status, count };
      }),
    );

    const total = funnelData[0]?.count || 1;
    const funnelWithRates = funnelData.map((stage, index) => ({
      ...stage,
      conversionRate: index > 0 ? (stage.count / funnelData[index - 1].count) * 100 : 100,
      dropoffRate: index > 0 ? 100 - (stage.count / funnelData[index - 1].count) * 100 : 0,
    }));

    return funnelWithRates;
  }
}

