import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContactsService } from '../contacts/contacts.service';
import { TelephonyService } from '../telephony/telephony.service';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly contactsService: ContactsService,
    private readonly telephonyService: TelephonyService,
  ) {}

  @Post('lead-score/:contactId')
  @ApiOperation({ summary: 'Calculate lead score for a contact' })
  async calculateLeadScore(@Param('contactId') contactId: string) {
    const contact = await this.contactsService.findOne(contactId);
    const score = await this.aiService.calculateLeadScore(contact);
    await this.contactsService.updateLeadScore(contactId, score);
    return { contactId, score };
  }

  @Post('generate-email')
  @ApiOperation({ summary: 'Generate email content using AI' })
  generateEmail(
    @Body()
    body: {
      purpose: string;
      tone?: string;
      contactName?: string;
      companyName?: string;
      context?: string;
    },
  ) {
    return this.aiService.generateEmailContent(body);
  }

  @Post('generate-sms')
  @ApiOperation({ summary: 'Generate SMS content using AI' })
  generateSms(
    @Body()
    body: {
      purpose: string;
      contactName?: string;
      maxLength?: number;
    },
  ) {
    return this.aiService.generateSmsContent(body);
  }

  @Post('summarize-call/:callId')
  @ApiOperation({ summary: 'Summarize call transcription' })
  async summarizeCall(@Param('callId') callId: string) {
    const call = await this.telephonyService.findOne(callId);
    
    if (!call.transcription) {
      throw new Error('Call does not have a transcription');
    }

    const summary = await this.aiService.summarizeCall(call.transcription);
    
    await this.telephonyService.updateAiSummary(
      callId,
      summary.summary,
      summary.sentiment,
    );

    return summary;
  }

  @Post('analyze-sentiment')
  @ApiOperation({ summary: 'Analyze sentiment of text' })
  analyzeSentiment(@Body('text') text: string) {
    return this.aiService.analyzeSentiment(text);
  }

  @Get('follow-up-recommendations/:contactId')
  @ApiOperation({ summary: 'Get AI-powered follow-up recommendations' })
  async getFollowUpRecommendations(@Param('contactId') contactId: string) {
    const contact = await this.contactsService.findOne(contactId);
    return this.aiService.getFollowUpRecommendations(contact);
  }

  @Post('generate-variations')
  @ApiOperation({ summary: 'Generate content variations for A/B testing' })
  generateVariations(
    @Body() body: { content: string; numVariations?: number },
  ) {
    return this.aiService.generateContentVariations(
      body.content,
      body.numVariations,
    );
  }
}

