// Adapter: call backend AI endpoints instead of Firebase Cloud Functions
import { aiApi } from './aiApi';

export const aiService = {
  async generateContent(prompt, type = 'email', context = {}) {
    const payload = { prompt, type, context };
    try {
      return await aiApi.generateContent(payload);
    } catch (err) {
      console.error('AI generateContent failed:', err);
      throw err;
    }
  },

  async analyzeLeadScore(contactData) {
    try {
      return await aiApi.analyzeLeadScore({ contactData });
    } catch (err) {
      console.error('AI analyzeLeadScore failed:', err);
      return { score: 50, reasoning: 'Unable to analyze lead', factors: [], recommendations: [] };
    }
  },

  async summarizeCall(transcript, duration, contactId) {
    try {
      return await aiApi.summarizeCall({ transcript, duration, contactId });
    } catch (err) {
      console.error('AI summarizeCall failed:', err);
      return { summary: 'Unable to generate summary', actionItems: [], sentiment: 'neutral', keyTopics: [] };
    }
  }
};
