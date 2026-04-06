import httpClient from './httpClient';
import { Campaign } from '../types/crm';

export interface CampaignFilters {
  status?: Campaign['status'];
  type?: Campaign['type'];
  search?: string;
}

export interface CreateCampaignPayload {
  name: string;
  type: Campaign['type'];
  subject?: string;
  content: string;
  status?: Campaign['status'];
  recipientIds?: string[];
  segmentId?: string;
  scheduledAt?: Date;
}

export type UpdateCampaignPayload = Partial<CreateCampaignPayload>;

const normalizeCampaign = (campaign: any): Campaign => ({
  ...campaign,
  createdAt: campaign.createdAt ? new Date(campaign.createdAt) : new Date(),
  updatedAt: campaign.updatedAt ? new Date(campaign.updatedAt) : new Date(),
  scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt) : undefined,
  sentAt: campaign.sentAt ? new Date(campaign.sentAt) : undefined,
});

export const campaignsApi = {
  async list(filters?: CampaignFilters): Promise<Campaign[]> {
    const { data } = await httpClient.get<Campaign[]>('/campaigns', {
      params: filters,
    });
    return data.map(normalizeCampaign);
  },

  async get(id: string): Promise<Campaign> {
    const { data } = await httpClient.get<Campaign>(`/campaigns/${id}`);
    return normalizeCampaign(data);
  },

  async create(payload: CreateCampaignPayload): Promise<Campaign> {
    // Ensure status is provided
    const campaignPayload = {
      status: 'draft',
      ...payload,
    };
    const { data } = await httpClient.post<Campaign>('/campaigns', campaignPayload);
    return normalizeCampaign(data);
  },

  async update(id: string, payload: UpdateCampaignPayload): Promise<Campaign> {
    const { data } = await httpClient.patch<Campaign>(`/campaigns/${id}`, payload);
    return normalizeCampaign(data);
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/campaigns/${id}`);
  },

  async send(id: string): Promise<void> {
    await httpClient.post(`/campaigns/${id}/send`);
  },

  async pause(id: string): Promise<void> {
    await httpClient.post(`/campaigns/${id}/pause`);
  },

  async resume(id: string): Promise<void> {
    await httpClient.post(`/campaigns/${id}/resume`);
  },

  async duplicate(id: string): Promise<Campaign> {
    const { data } = await httpClient.post<Campaign>(`/campaigns/${id}/duplicate`);
    return normalizeCampaign(data);
  },

  async getAnalytics(id: string): Promise<any> {
    const { data } = await httpClient.get(`/campaigns/${id}/analytics`);
    return data;
  },
};
