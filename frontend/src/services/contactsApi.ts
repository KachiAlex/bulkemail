import httpClient from './httpClient';
import { Contact } from '../types/crm';

export interface ContactFilters {
  status?: string;
  category?: string;
  search?: string;
}

export interface CreateContactPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  company?: string;
  status?: Contact['status'];
  category?: Contact['category'];
  tags?: string[];
  source?: string;
  leadScore?: number;
}

export type UpdateContactPayload = Partial<CreateContactPayload>;

const normalizeContact = (contact: any): Contact => ({
  ...contact,
  createdAt: contact.createdAt ? new Date(contact.createdAt) : new Date(),
  updatedAt: contact.updatedAt ? new Date(contact.updatedAt) : new Date(),
});

export const contactsApi = {
  async list(filters?: ContactFilters): Promise<Contact[]> {
    const { data } = await httpClient.get<Contact[]>('/contacts', {
      params: filters,
    });
    return data.map(normalizeContact);
  },

  async get(id: string): Promise<Contact> {
    const { data } = await httpClient.get<Contact>(`/contacts/${id}`);
    return normalizeContact(data);
  },

  async create(payload: CreateContactPayload): Promise<Contact> {
    const { data } = await httpClient.post<Contact>('/contacts', payload);
    return normalizeContact(data);
  },

  async update(id: string, payload: UpdateContactPayload): Promise<Contact> {
    const { data } = await httpClient.patch<Contact>(`/contacts/${id}`, payload);
    return normalizeContact(data);
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/contacts/${id}`);
  },

  async bulkDelete(ids: string[]): Promise<void> {
    await httpClient.post('/contacts/bulk-delete', { ids });
  },

  async updateLeadScore(id: string, score: number): Promise<void> {
    await httpClient.patch(`/contacts/${id}/lead-score`, { score });
  },

  async addTags(id: string, tags: string[]): Promise<void> {
    await httpClient.post(`/contacts/${id}/tags`, { tags });
  },

  async removeTags(id: string, tags: string[]): Promise<void> {
    await httpClient.delete(`/contacts/${id}/tags`, { data: { tags } });
  },
};
