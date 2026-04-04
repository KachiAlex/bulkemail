import httpClient from './httpClient';

export const dbService = {
  async getContacts() {
    const { data } = await httpClient.get('/contacts');
    return data;
  },

  async getContact(contactId) {
    const { data } = await httpClient.get(`/contacts/${contactId}`);
    return data;
  },

  async createContact(contactData) {
    const { data } = await httpClient.post('/contacts', contactData);
    return data;
  },

  async updateContact(contactId, updateData) {
    await httpClient.put(`/contacts/${contactId}`, updateData);
  },

  async deleteContact(contactId) {
    await httpClient.delete(`/contacts/${contactId}`);
  },

  async getCampaigns() {
    const { data } = await httpClient.get('/campaigns');
    return data;
  },

  async createCampaign(campaignData) {
    const { data } = await httpClient.post('/campaigns', campaignData);
    return data;
  },

  async updateCampaign(campaignId, updateData) {
    await httpClient.put(`/campaigns/${campaignId}`, updateData);
  },

  async getDashboardStats() {
    const { data } = await httpClient.get('/analytics/dashboard');
    return data;
  }
};
