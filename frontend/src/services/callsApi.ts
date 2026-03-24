import httpClient from './httpClient';
import { Call } from '../types/crm';

export interface CallFilters {
  type?: Call['type'];
  status?: Call['status'];
  contactId?: string;
  accountId?: string;
  opportunityId?: string;
  search?: string;
}

export interface CreateCallPayload {
  type: Call['type'];
  status?: Call['status'];
  duration?: number;
  recordingUrl?: string;
  transcript?: string;
  notes?: string;
  outcome?: string;
  contactId?: string;
  accountId?: string;
  opportunityId?: string;
}

export type UpdateCallPayload = Partial<CreateCallPayload>;

const normalizeCall = (call: any): Call => ({
  ...call,
  timestamp: call.timestamp ? new Date(call.timestamp) : new Date(),
});

export const callsApi = {
  async list(filters?: CallFilters): Promise<Call[]> {
    const { data } = await httpClient.get<Call[]>('/calls', {
      params: filters,
    });
    return data.map(normalizeCall);
  },

  async get(id: string): Promise<Call> {
    const { data } = await httpClient.get<Call>(`/calls/${id}`);
    return normalizeCall(data);
  },

  async create(payload: CreateCallPayload): Promise<Call> {
    const { data } = await httpClient.post<Call>('/calls', payload);
    return normalizeCall(data);
  },

  async update(id: string, payload: UpdateCallPayload): Promise<Call> {
    const { data } = await httpClient.patch<Call>(`/calls/${id}`, payload);
    return normalizeCall(data);
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/calls/${id}`);
  },

  async logCall(payload: CreateCallPayload): Promise<Call> {
    const { data } = await httpClient.post<Call>('/calls/log', payload);
    return normalizeCall(data);
  },

  async getRecordings(id: string): Promise<any> {
    const { data } = await httpClient.get(`/calls/${id}/recordings`);
    return data;
  },

  async getTranscript(id: string): Promise<any> {
    const { data } = await httpClient.get(`/calls/${id}/transcript`);
    return data;
  },
};
