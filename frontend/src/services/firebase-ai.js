// Firebase Cloud Functions for AI processing
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase-config';

export const aiService = {
  // Generate AI content for campaigns
  async generateContent(prompt, type = 'email') {
    const generateContent = httpsCallable(functions, 'generateContent');
    try {
      const result = await generateContent({ prompt, type });
      return result.data;
    } catch (error) {
      console.error('AI content generation failed:', error);
      throw new Error('Failed to generate AI content');
    }
  },

  // Analyze lead score
  async analyzeLeadScore(contactData) {
    const analyzeLead = httpsCallable(functions, 'analyzeLead');
    try {
      const result = await analyzeLead({ contactData });
      return result.data;
    } catch (error) {
      console.error('Lead analysis failed:', error);
      return { score: 50, reasoning: 'Unable to analyze lead' };
    }
  },

  // Summarize call
  async summarizeCall(transcript) {
    const summarizeCall = httpsCallable(functions, 'summarizeCall');
    try {
      const result = await summarizeCall({ transcript });
      return result.data;
    } catch (error) {
      console.error('Call summarization failed:', error);
      return { summary: 'Unable to generate summary', actionItems: [] };
    }
  }
};
