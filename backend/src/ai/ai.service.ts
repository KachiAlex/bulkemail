import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Calculate lead score based on contact engagement and attributes
   */
  async calculateLeadScore(contactData: any): Promise<number> {
    let score = 0;

    // Engagement metrics (40 points)
    if (contactData.emailsOpened > 0) {
      score += Math.min(contactData.emailsOpened * 2, 20);
    }
    if (contactData.linksClicked > 0) {
      score += Math.min(contactData.linksClicked * 5, 20);
    }

    // Contact completeness (20 points)
    const fields = ['phone', 'company', 'jobTitle', 'website'];
    const completedFields = fields.filter(f => contactData[f]).length;
    score += (completedFields / fields.length) * 20;

    // Recency (20 points)
    if (contactData.lastContactedAt) {
      const daysSinceContact = Math.floor(
        (Date.now() - new Date(contactData.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceContact < 7) score += 20;
      else if (daysSinceContact < 30) score += 10;
      else if (daysSinceContact < 90) score += 5;
    }

    // Status (20 points)
    const statusScores = {
      new: 5,
      contacted: 10,
      qualified: 15,
      negotiating: 20,
      converted: 0,
      lost: 0,
    };
    score += statusScores[contactData.status] || 0;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Generate email content using AI
   */
  async generateEmailContent(params: {
    purpose: string;
    tone?: string;
    contactName?: string;
    companyName?: string;
    context?: string;
  }): Promise<{ subject: string; body: string }> {
    if (!this.openai) {
      throw new Error('OpenAI client not configured');
    }

    const tone = params.tone || 'professional';
    const prompt = `Generate a ${tone} email for the following purpose: ${params.purpose}
    
${params.contactName ? `Recipient name: ${params.contactName}` : ''}
${params.companyName ? `Company: ${params.companyName}` : ''}
${params.context ? `Additional context: ${params.context}` : ''}

Please provide:
1. A compelling subject line
2. A complete email body with proper greeting and signature placeholders

Format the response as JSON with "subject" and "body" fields.`;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get('OPENAI_MODEL') || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a professional sales and marketing email writer. Generate clear, compelling emails.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = JSON.parse(response.choices[0].message.content);
    return content;
  }

  /**
   * Generate SMS message using AI
   */
  async generateSmsContent(params: {
    purpose: string;
    contactName?: string;
    maxLength?: number;
  }): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI client not configured');
    }

    const maxLength = params.maxLength || 160;
    const prompt = `Generate a brief SMS message for the following purpose: ${params.purpose}
    
${params.contactName ? `Recipient name: ${params.contactName}` : ''}

Requirements:
- Maximum ${maxLength} characters
- Clear and direct
- Include a call to action if appropriate
- Professional but friendly tone`;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get('OPENAI_MODEL') || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at writing concise, effective SMS messages for business communication.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 100,
    });

    return response.choices[0].message.content.trim();
  }

  /**
   * Summarize call transcription
   */
  async summarizeCall(transcription: string): Promise<{
    summary: string;
    keyPoints: string[];
    sentiment: { score: number; label: string };
    actionItems: string[];
    nextSteps: string[];
  }> {
    if (!this.openai) {
      throw new Error('OpenAI client not configured');
    }

    const prompt = `Analyze the following call transcription and provide:
1. A brief summary (2-3 sentences)
2. Key points discussed (bullet points)
3. Sentiment analysis (positive/neutral/negative with score 0-100)
4. Action items identified
5. Recommended next steps

Call transcription:
${transcription}

Format the response as JSON with fields: summary, keyPoints (array), sentiment (object with score and label), actionItems (array), nextSteps (array).`;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get('OPENAI_MODEL') || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing sales calls and extracting actionable insights.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = JSON.parse(response.choices[0].message.content);
    return content;
  }

  /**
   * Analyze sentiment of text
   */
  async analyzeSentiment(text: string): Promise<{ score: number; label: string }> {
    if (!this.openai) {
      throw new Error('OpenAI client not configured');
    }

    const prompt = `Analyze the sentiment of the following text and provide a score from 0 (very negative) to 100 (very positive), and a label (positive/neutral/negative).

Text: ${text}

Format the response as JSON with fields: score (number), label (string).`;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get('OPENAI_MODEL') || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = JSON.parse(response.choices[0].message.content);
    return content;
  }

  /**
   * Get AI-powered follow-up recommendations
   */
  async getFollowUpRecommendations(contactData: any): Promise<{
    recommendations: string[];
    priority: 'high' | 'medium' | 'low';
    bestContactTime: string;
  }> {
    if (!this.openai) {
      throw new Error('OpenAI client not configured');
    }

    const prompt = `Based on the following contact information and interaction history, provide follow-up recommendations:

Contact Status: ${contactData.status}
Lead Score: ${contactData.leadScore}
Last Contacted: ${contactData.lastContactedAt}
Emails Opened: ${contactData.emailsOpened}
Links Clicked: ${contactData.linksClicked}
Calls Made: ${contactData.callsReceived}
Notes: ${contactData.notes || 'None'}

Provide:
1. Specific follow-up recommendations (array of strings)
2. Priority level (high/medium/low)
3. Best time to contact (e.g., "morning", "afternoon", "within 24 hours")

Format as JSON with fields: recommendations (array), priority (string), bestContactTime (string).`;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get('OPENAI_MODEL') || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert sales advisor providing actionable follow-up recommendations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = JSON.parse(response.choices[0].message.content);
    return content;
  }

  /**
   * Transcribe audio using Whisper API
   */
  async transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI client not configured');
    }

    const file = new File([audioBuffer], filename, { type: 'audio/mpeg' });
    
    const response = await this.openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
    });

    return response.text;
  }

  /**
   * Generate content variations for A/B testing
   */
  async generateContentVariations(
    originalContent: string,
    numVariations: number = 2,
  ): Promise<string[]> {
    if (!this.openai) {
      throw new Error('OpenAI client not configured');
    }

    const prompt = `Generate ${numVariations} alternative versions of the following content. Each version should maintain the same message but use different wording, structure, or approach for A/B testing.

Original content:
${originalContent}

Format the response as JSON with a "variations" array containing ${numVariations} strings.`;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get('OPENAI_MODEL') || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert copywriter creating content variations for A/B testing.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = JSON.parse(response.choices[0].message.content);
    return content.variations;
  }
}

