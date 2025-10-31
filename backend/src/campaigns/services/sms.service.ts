import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

interface SmsOptions {
  to: string;
  body: string;
  from?: string;
}

@Injectable()
export class SmsService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    }
  }

  async sendSms(options: SmsOptions): Promise<any> {
    if (!this.client) {
      throw new Error('Twilio client not configured');
    }

    try {
      const message = await this.client.messages.create({
        body: options.body,
        from: options.from || this.fromNumber,
        to: options.to,
      });

      return message;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  async sendBulkSms(messages: SmsOptions[]): Promise<any[]> {
    const promises = messages.map(msg => this.sendSms(msg));
    return Promise.all(promises);
  }
}

