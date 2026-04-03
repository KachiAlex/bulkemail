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
    const sendgridKey = this.configService.get<string>('SENDGRID_API_KEY');
    const sesRegion = this.configService.get<string>('AWS_SES_REGION');
    const sesAccessKey = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const sesSecret = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const smtpHost = this.configService.get<string>('SMTP_HOST');

    if (sendgridKey) {
      this.emailProvider = 'sendgrid';
      sgMail.setApiKey(sendgridKey);
    } else if (sesRegion) {
      this.emailProvider = 'ses';
      if (!sesAccessKey || !sesSecret) {
        throw new Error('AWS SES credentials are not fully configured');
      }
      this.sesClient = new AWS.SES({
        region: sesRegion,
        accessKeyId: sesAccessKey,
        secretAccessKey: sesSecret,
      });
    } else if (smtpHost) {
      const smtpPort = this.configService.get<number>('SMTP_PORT') || 587;
      const smtpSecure = this.configService.get<boolean>('SMTP_SECURE') || false;
      const smtpUser = this.configService.get<string>('SMTP_USER');
      const smtpPass = this.configService.get<string>('SMTP_PASS');
      this.emailProvider = 'smtp';
      this.smtpTransporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
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
    // Ensure SendGrid receives a non-empty content value (SendGrid requires at least one character)
    const stripTags = (s: string) => s.replace(/<[^>]*>/g, '');
    const htmlProvided = !!options.html && options.html.trim().length > 0;
    const textProvided = !!options.text && options.text.trim().length > 0;

    let finalText = '';
    if (textProvided) finalText = options.text as string;
    else if (htmlProvided) finalText = stripTags(options.html as string).trim();
    // fallback to subject if still empty
    if (!finalText || finalText.length === 0) finalText = options.subject || 'Message';

    const finalHtml = htmlProvided ? (options.html as string) : `<p>${finalText}</p>`;

    const msg = {
      to: options.to,
      from: { email: fromEmail, name: fromName },
      subject: options.subject,
      text: finalText,
      html: finalHtml,
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

