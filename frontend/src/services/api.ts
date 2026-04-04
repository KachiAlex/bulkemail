
// Adapter layer mapping legacy `*API` names to new backend HTTP adapters
import httpClient from './httpClient';
import { contactsApi } from './contactsApi';
import { campaignsApi } from './campaignsApi';
import { authApi } from './authApi';
import { aiApi } from './aiApi';
import { analyticsApi } from './analyticsApi';
import { callsApi } from './callsApi';

// contactsAPI - legacy name mapped to new `contactsApi`
export const contactsAPI = {
  getAll: (filters?: any) => contactsApi.list(filters),
  getOne: (id: string) => contactsApi.get(id),
  create: (data: any) => contactsApi.create(data),
  update: (id: string, data: any) => contactsApi.update(id, data),
  delete: (id: string) => contactsApi.remove(id),
  bulkDelete: (ids: string[]) => contactsApi.bulkDelete(ids),
  import: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return httpClient.post('/contacts/import', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  export: () => httpClient.get('/contacts/export', { responseType: 'blob' }),
  updateLeadScore: (id: string, score: number) => contactsApi.update(id, { leadScore: score }),
  addTags: (id: string, tags: string[]) => contactsApi.addTags(id, tags),
  removeTags: (id: string, tags: string[]) => contactsApi.removeTags(id, tags),
};

export const campaignsAPI = {
  getAll: (filters?: any) => campaignsApi.list(filters),
  getOne: (id: string) => campaignsApi.get(id),
  create: (data: any) => campaignsApi.create(data),
  update: (id: string, data: any) => campaignsApi.update(id, data),
  send: (id: string) => campaignsApi.send(id),
  pause: (id: string) => campaignsApi.pause(id),
  resume: (id: string) => campaignsApi.resume(id),
  duplicate: (id: string) => campaignsApi.duplicate(id),
  getAnalytics: (id: string) => campaignsApi.getAnalytics(id),
  delete: (id: string) => campaignsApi.remove(id),
};

export const segmentsAPI = {
  getAll: () => httpClient.get('/contacts/segments').then((r: any) => r.data),
  getOne: (id: string) => httpClient.get(`/contacts/segments/${id}`).then((r: any) => r.data),
  getContacts: (id: string) => httpClient.get(`/contacts/segments/${id}/contacts`).then((r: any) => r.data),
  create: (data: any) => httpClient.post('/contacts/segments', data).then((r: any) => r.data),
  delete: (id: string) => httpClient.delete(`/contacts/segments/${id}`).then((r: any) => r.data),
};

export const callsAPI = {
  getAll: () => callsApi.getAll(),
  create: (data: any) => callsApi.initiate(data),
  getOne: (id: string) => callsApi.get(id),
};


export const aiAPI = {
  generateEmail: (data: any) => aiApi.generateContent(data),
  analyzeLeadScore: (data: any) => aiApi.analyzeLeadScore(data),
  summarizeCall: (data: any) => aiApi.summarizeCall(data),
};

export const analyticsAPI = {
  getDashboard: () => analyticsApi.getDashboard(),
};

export const authAPI = {
  login: (p: any) => authApi.login(p),
  register: (p: any) => authApi.register(p),
  logout: () => authApi.logout(),
  getProfile: () => authApi.getProfile(),
};

export const usersAPI = {
  getAll: () => httpClient.get('/users').then(r => r.data),
  getOne: (id: string) => httpClient.get(`/users/${id}`).then(r => r.data),
  create: (data: any) => httpClient.post('/users', data).then(r => r.data),
  update: (id: string, data: any) => httpClient.patch(`/users/${id}`, data).then(r => r.data),
  delete: (id: string) => httpClient.delete(`/users/${id}`).then(r => r.data),
};

export default {};

