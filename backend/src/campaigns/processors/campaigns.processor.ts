import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { CampaignsService } from '../campaigns.service';

@Processor('campaigns')
export class CampaignsProcessor {
  constructor(private campaignsService: CampaignsService) {}

  @Process('send-campaign')
  async handleSendCampaign(job: Job) {
    const { campaignId } = job.data;
    await this.campaignsService.processCampaignSending(campaignId);
  }

  @Process('send-scheduled-campaign')
  async handleScheduledCampaign(job: Job) {
    const { campaignId } = job.data;
    await this.campaignsService.processCampaignSending(campaignId);
  }
}

