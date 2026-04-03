import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { CampaignsService } from '../campaigns.service';

@Processor('campaigns')
export class CampaignsProcessor {
  private readonly logger = new Logger(CampaignsProcessor.name);

  constructor(private campaignsService: CampaignsService) {}

  @Process('send-campaign')
  async handleSendCampaign(job: Job) {
    const { campaignId } = job.data;
    try {
      this.logger.log(`Processing send-campaign job ${job.id} for campaign ${campaignId}`);
      await this.campaignsService.processCampaignSending(campaignId);
      this.logger.log(`Completed send-campaign job ${job.id} for campaign ${campaignId}`);
    } catch (err) {
      this.logger.error(`Error processing send-campaign job ${job.id} for campaign ${campaignId}: ${err?.message}`, err?.stack);
      throw err;
    }
  }

  @Process('send-scheduled-campaign')
  async handleScheduledCampaign(job: Job) {
    const { campaignId } = job.data;
    try {
      this.logger.log(`Processing send-scheduled-campaign job ${job.id} for campaign ${campaignId}`);
      await this.campaignsService.processCampaignSending(campaignId);
      this.logger.log(`Completed send-scheduled-campaign job ${job.id} for campaign ${campaignId}`);
    } catch (err) {
      this.logger.error(
        `Error processing send-scheduled-campaign job ${job.id} for campaign ${campaignId}: ${err?.message}`,
        err?.stack,
      );
      throw err;
    }
  }
}

