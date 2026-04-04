// Adapter that substitutes Firebase-backed operations with backend HTTP APIs
import { contactsApi } from './contactsApi';
import { campaignsApi } from './campaignsApi';
import { analyticsApi } from './analyticsApi';
import { authApi } from './authApi';

class FirebaseAPI {
  private async getCurrentUser() {
    try {
      const profile = await authApi.getProfile();
      return profile?.user || profile;
    } catch (err) {
      return null;
    }
  }

  // Contacts
  async getContacts() {
    return contactsApi.list();
  }

  async getContact(id: string) {
    return contactsApi.get(id);
  }

  async createContact(contactData: any) {
    return contactsApi.create(contactData);
  }

  async updateContact(id: string, updateData: any) {
    return contactsApi.update(id, updateData);
  }

  async deleteContact(id: string) {
    return contactsApi.remove(id);
  }

  // Campaigns
  async getCampaigns() {
    return campaignsApi.list();
  }

  async createCampaign(campaignData: any) {
    return campaignsApi.create(campaignData);
  }

  // Analytics
  async getDashboardStats() {
    return analyticsApi.getDashboardStats();
  }
}

const api = new FirebaseAPI();
export default api;
