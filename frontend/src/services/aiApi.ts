import httpClient from './httpClient';

export interface GenerateContentPayload {
  prompt: string;
  type: 'email' | 'sms' | 'summary';
  context?: Record<string, any>;
}

export interface LeadAnalysisPayload {
  contactData: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    jobTitle?: string;
    status: string;
    tags: string[];
    recentActivities?: any[];
  };
}

export interface CallSummaryPayload {
  transcript: string;
  duration?: number;
  contactId?: string;
}

export const aiApi = {
  async generateContent(payload: GenerateContentPayload): Promise<{
    content: string;
    subject?: string;
    suggestions?: string[];
  }> {
    const { data } = await httpClient.post('/ai/generate-content', payload);
    return data;
  },

  async analyzeLeadScore(payload: LeadAnalysisPayload): Promise<{
    score: number;
    reasoning: string;
    factors: Array<{ factor: string; impact: number; explanation: string }>;
    recommendations: string[];
  }> {
    const { data } = await httpClient.post('/ai/analyze-lead', payload);
    return data;
  },

  async summarizeCall(payload: CallSummaryPayload): Promise<{
    summary: string;
    actionItems: Array<{ title: string; priority: 'low' | 'medium' | 'high'; dueDate?: string }>;
    sentiment: 'positive' | 'neutral' | 'negative';
    keyTopics: string[];
  }> {
    const { data } = await httpClient.post('/ai/summarize-call', payload);
    return data;
  },

  async suggestNextActions(contactId: string): Promise<string[]> {
    const { data } = await httpClient.get(`/ai/suggest-actions/${contactId}`);
    return data.actions;
  },

  async categorizeEmail(subject: string, body: string): Promise<{
    category: string;
    priority: 'low' | 'medium' | 'high';
    urgency: number;
  }> {
    const { data } = await httpClient.post('/ai/categorize-email', { subject, body });
    return data;
  },
};
