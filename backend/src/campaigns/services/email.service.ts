import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import * as AWS from 'aws-sdk';
import * as nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
}

@Injectable()
export class EmailService {
  private emailProvider: 'sendgrid' | 'ses' | 'smtp';
  private sesClient?: AWS.SES;
  private smtpTransporter?: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Determine which email provider to use
    if (this.configService.get<string>('SENDGRID_API_KEY')) {
      this.emailProvider = 'sendgrid';
      sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
    } else if (this.configService.get<string>('AWS_SES_REGION')) {
      this.emailProvider = 'ses';
      this.sesClient = new AWS.SES({
        region: this.configService.get<string>('AWS_SES_REGION'),
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      });
    } else if (this.configService.get<string>('SMTP_HOST')) {
      this.emailProvider = 'smtp';
      this.smtpTransporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST'),
        port: this.configService.get<number>('SMTP_PORT') || 587,
        secure: this.configService.get<boolean>('SMTP_SECURE') || false,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });
    } else {
      console.warn('No email provider configured. Using SMTP fallback.');
      this.emailProvider = 'smtp';
    }

    console.log(`Email service initialized with provider: ${this.emailProvider}`);
    }

  private getFromEmail(): string {
    return this.configService.get<string>('FROM_EMAIL') || 
           this.configService.get<string>('SENDGRID_FROM_EMAIL') || 
           'noreply@example.com';
  }

  private getFromName(): string {
    return this.configService.get<string>('FROM_NAME') || 
           this.configService.get<string>('SENDGRID_FROM_NAME') || 
           'PANDI CRM';
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const fromEmail = options.from || this.getFromEmail();
    const fromName = this.getFromName();

    switch (this.emailProvider) {
      case 'sendgrid':
        await this.sendViaSendGrid(options, fromEmail, fromName);
        break;
      case 'ses':
        await this.sendViaSES(options, fromEmail, fromName);
        break;
      case 'smtp':
        await this.sendViaSMTP(options, fromEmail, fromName);
        break;
      default:
        throw new Error('No email provider configured');
    }
  }

  private async sendViaSendGrid(options: EmailOptions, fromEmail: string, fromName: string): Promise<void> {
    const msg = {
      to: options.to,
      from: { email: fromEmail, name: fromName },
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Error sending email via SendGrid:', error);
      throw error;
    }
  }

  private async sendViaSES(options: EmailOptions, fromEmail: string, fromName: string): Promise<void> {
    if (!this.sesClient) {
      throw new Error('AWS SES client not initialized');
    }

    const params: AWS.SES.SendEmailRequest = {
      Source: `${fromName} <${fromEmail}>`,
      Destination: {
        ToAddresses: [options.to],
      },
      Message: {
        Subject: {
          Data: options.subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: options.html || options.text,
            Charset: 'UTF-8',
          },
          Text: {
            Data: options.text,
            Charset: 'UTF-8',
          },
        },
      },
    };

    try {
      await this.sesClient.sendEmail(params).promise();
    } catch (error) {
      console.error('Error sending email via AWS SES:', error);
      throw error;
    }
  }

  private async sendViaSMTP(options: EmailOptions, fromEmail: string, fromName: string): Promise<void> {
    if (!this.smtpTransporter) {
      // Fallback to console log if no SMTP configured
      console.log('SMTP not configured. Email would be sent:');
      console.log(`From: ${fromName} <${fromEmail}>`);
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body: ${options.text}`);
      return;
    }

    const mailOptions = {
      from: `${fromName} <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    };

    try {
      await this.smtpTransporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email via SMTP:', error);
      throw error;
    }
  }

  async sendBulkEmail(emails: EmailOptions[]): Promise<void> {
    for (const email of emails) {
      await this.sendEmail(email);
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

