import { Body, Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailService } from '../campaigns/services/email.service';
import { IsEmail, IsOptional, IsString } from 'class-validator';

class SendEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  @IsString()
  text?: string;
}

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async send(@Body() body: SendEmailDto) {
    const { to, subject, html, text } = body;
    try {
      await this.emailService.sendEmail({ to, subject, html: html || text || '', text: text || '' });
      return { success: true };
    } catch (err: any) {
      // If the provider returned a response body, include it for debugging
      const details = err?.response?.body || err?.message || 'Unknown error';
      console.error('Email send failed:', details);
      throw new HttpException({ error: 'Email send failed', details }, HttpStatus.BAD_GATEWAY);
    }
  }
}
