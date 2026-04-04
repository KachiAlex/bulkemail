import httpClient from './httpClient';
import { contactsApi } from './contactsApi';
import { campaignsApi } from './campaignsApi';
import { aiApi } from './aiApi';
import { analyticsApi } from './analyticsApi';
import { callsApi } from './callsApi';

// Adapter: expose the legacy `crmAPI` interface but call backend HTTP endpoints
export const crmAPI = {
  // Contacts
  async getContacts(filters?: any) {
    return contactsApi.list(filters);
  },

  async getContact(id: string) {
    return contactsApi.get(id);
  },

  async createContact(payload: any) {
    return contactsApi.create(payload);
  },

  async updateContact(id: string, payload: any) {
    return contactsApi.update(id, payload);
  },

  async deleteContact(id: string) {
    return contactsApi.remove(id);
  },

  async bulkDeleteContacts(ids: string[]) {
    return contactsApi.bulkDelete(ids);
  },

  // Campaigns
  async getCampaigns(filters?: any) {
    return campaignsApi.list(filters);
  },

  async getCampaign(id: string) {
    return campaignsApi.get(id);
  },

  async createCampaign(payload: any) {
    return campaignsApi.create(payload);
  },

  async updateCampaign(id: string, payload: any) {
    return campaignsApi.update(id, payload);
  },

  async deleteCampaign(id: string) {
    return campaignsApi.remove(id);
  },

  async sendCampaign(id: string) {
    return campaignsApi.send(id);
  },

  // Email threads & sending
  async getEmailThreads() {
    try {
      const { data } = await httpClient.get('/email/threads');
      return data;
    } catch (err) {
      console.warn('email threads endpoint missing, returning empty list', err);
      return [];
    }
  },

  async sendEmail(payload: any) {
    return httpClient.post('/email/send', payload).then((r) => r.data);
  },

  // Calls
  async getCalls() {
    return callsApi.getAll();
  },

  async createCall(payload: any) {
    return callsApi.create(payload);
  },

  // Analytics
  async getDashboardStats() {
    return analyticsApi.getDashboard();
  },

  // Tasks, opportunities, accounts, activities — map to REST endpoints if available
  async getTasks() {
    const { data } = await httpClient.get('/tasks');
    return data;
  },

  async createTask(payload: any) {
    const { data } = await httpClient.post('/tasks', payload);
    return data;
  },

  async updateTask(id: string, payload: any) {
    return httpClient.patch(`/tasks/${id}`, payload).then((r) => r.data);
  },

  async deleteTask(id: string) {
    return httpClient.delete(`/tasks/${id}`).then((r) => r.data);
  },

  async getOpportunities() {
    const { data } = await httpClient.get('/opportunities');
    return data;
  },

  async createOpportunity(payload: any) {
    const { data } = await httpClient.post('/opportunities', payload);
    return data;
  },

  async getAccounts() {
    const { data } = await httpClient.get('/accounts');
    return data;
  },

  async createAccount(payload: any) {
    const { data } = await httpClient.post('/accounts', payload);
    return data;
  },

  // AI helpers
  async generateContent(payload: any) {
    return aiApi.generateContent(payload);
  },

  async analyzeLeadScore(payload: any) {
    return aiApi.analyzeLeadScore(payload);
  },
};
