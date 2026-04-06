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
    return callsApi.list();
  },

  async createCall(payload: any) {
    return callsApi.create(payload);
  },

  // Analytics
  async getDashboardStats() {
    return analyticsApi.getDashboardStats();
  },

  // Tasks, opportunities, accounts, activities — map to REST endpoints if available
  async getTasks() {
    try {
      const { data } = await httpClient.get('/tasks');
      return data;
    } catch (error) {
      console.warn('Tasks endpoint not available, returning empty array');
      return [];
    }
  },

  async createTask(payload: any) {
    try {
      const { data } = await httpClient.post('/tasks', payload);
      return data;
    } catch (error) {
      console.warn('Tasks endpoint not available, returning mock data');
      return { id: Date.now().toString(), ...payload };
    }
  },

  async updateTask(id: string, payload: any) {
    try {
      return httpClient.patch(`/tasks/${id}`, payload).then((r) => r.data);
    } catch (error) {
      console.warn('Tasks endpoint not available, returning mock data');
      return { id, ...payload };
    }
  },

  async deleteTask(id: string) {
    try {
      return httpClient.delete(`/tasks/${id}`).then((r) => r.data);
    } catch (error) {
      console.warn('Tasks endpoint not available, returning success');
      return { success: true };
    }
  },

  async getOpportunities() {
    try {
      const { data } = await httpClient.get('/opportunities');
      return data;
    } catch (error) {
      console.warn('Opportunities endpoint not available, returning empty array');
      return [];
    }
  },

  async createOpportunity(payload: any) {
    try {
      const { data } = await httpClient.post('/opportunities', payload);
      return data;
    } catch (error) {
      console.warn('Opportunities endpoint not available, returning mock data');
      return { id: Date.now().toString(), ...payload };
    }
  },

  async getAccounts() {
    try {
      const { data } = await httpClient.get('/accounts');
      return data;
    } catch (error) {
      console.warn('Accounts endpoint not available, returning empty array');
      return [];
    }
  },

  async createAccount(payload: any) {
    try {
      const { data } = await httpClient.post('/accounts', payload);
      return data;
    } catch (error) {
      console.warn('Accounts endpoint not available, returning mock data');
      return { id: Date.now().toString(), ...payload };
    }
  },

  async getActivities() {
    try {
      const { data } = await httpClient.get('/activities');
      return data;
    } catch (error) {
      console.warn('Activities endpoint not available, returning empty array');
      return [];
    }
  },

  // AI helpers
  async generateContent(payload: any) {
    return aiApi.generateContent(payload);
  },

  async analyzeLeadScore(payload: any) {
    return aiApi.analyzeLeadScore(payload);
  },
};
