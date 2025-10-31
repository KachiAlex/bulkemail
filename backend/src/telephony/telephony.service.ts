import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';
import { Call, CallStatus, CallDirection } from './entities/call.entity';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';

@Injectable()
export class TelephonyService {
  private twilioClient: twilio.Twilio;
  private twilioNumber: string;

  constructor(
    @InjectRepository(Call)
    private callsRepository: Repository<Call>,
    private configService: ConfigService,
  ) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.twilioNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');

    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
    }
  }

  async initiateCall(createCallDto: CreateCallDto, userId: string): Promise<Call> {
    if (!this.twilioClient) {
      throw new Error('Twilio client not configured');
    }

    // Create call record
    const call = this.callsRepository.create({
      ...createCallDto,
      userId,
      fromNumber: this.twilioNumber,
      status: CallStatus.INITIATED,
    });

    const savedCall = await this.callsRepository.save(call);

    try {
      // Initiate call via Twilio
      const twilioCall = await this.twilioClient.calls.create({
        to: createCallDto.toNumber,
        from: this.twilioNumber,
        url: `${this.configService.get('API_URL')}/api/telephony/twiml/${savedCall.id}`,
        statusCallback: `${this.configService.get('API_URL')}/api/telephony/callback/${savedCall.id}`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        record: true,
        recordingStatusCallback: `${this.configService.get('API_URL')}/api/telephony/recording/${savedCall.id}`,
      });

      savedCall.externalCallSid = twilioCall.sid;
      savedCall.status = CallStatus.RINGING;
      await this.callsRepository.save(savedCall);

      return savedCall;
    } catch (error) {
      savedCall.status = CallStatus.FAILED;
      savedCall.metadata = { error: error.message };
      await this.callsRepository.save(savedCall);
      throw error;
    }
  }

  async findAll(userId?: string): Promise<Call[]> {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    return this.callsRepository.find({
      where,
      relations: ['contact', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Call> {
    const call = await this.callsRepository.findOne({
      where: { id },
      relations: ['contact', 'user'],
    });

    if (!call) {
      throw new NotFoundException(`Call with ID ${id} not found`);
    }

    return call;
  }

  async update(id: string, updateCallDto: UpdateCallDto): Promise<Call> {
    const call = await this.findOne(id);
    Object.assign(call, updateCallDto);
    return this.callsRepository.save(call);
  }

  async handleStatusCallback(callId: string, status: string, duration?: number): Promise<void> {
    const call = await this.findOne(callId);

    switch (status) {
      case 'ringing':
        call.status = CallStatus.RINGING;
        break;
      case 'in-progress':
        call.status = CallStatus.IN_PROGRESS;
        call.startedAt = new Date();
        break;
      case 'completed':
        call.status = CallStatus.COMPLETED;
        call.endedAt = new Date();
        if (duration) {
          call.duration = duration;
        }
        break;
      case 'failed':
        call.status = CallStatus.FAILED;
        break;
      case 'busy':
        call.status = CallStatus.BUSY;
        break;
      case 'no-answer':
        call.status = CallStatus.NO_ANSWER;
        break;
    }

    await this.callsRepository.save(call);
  }

  async handleRecordingCallback(
    callId: string,
    recordingSid: string,
    recordingUrl: string,
  ): Promise<void> {
    const call = await this.findOne(callId);
    call.recordingSid = recordingSid;
    call.recordingUrl = recordingUrl;
    await this.callsRepository.save(call);
  }

  async updateTranscription(callId: string, transcription: string): Promise<Call> {
    const call = await this.findOne(callId);
    call.transcription = transcription;
    return this.callsRepository.save(call);
  }

  async updateAiSummary(callId: string, summary: string, sentiment?: any): Promise<Call> {
    const call = await this.findOne(callId);
    call.aiSummary = summary;
    if (sentiment) {
      call.sentiment = sentiment;
    }
    return this.callsRepository.save(call);
  }

  async getCallStats(userId?: string): Promise<any> {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const calls = await this.callsRepository.find({ where });

    const stats = {
      total: calls.length,
      completed: calls.filter(c => c.status === CallStatus.COMPLETED).length,
      failed: calls.filter(c => c.status === CallStatus.FAILED).length,
      totalDuration: calls.reduce((sum, c) => sum + c.duration, 0),
      averageDuration: calls.length > 0 
        ? calls.reduce((sum, c) => sum + c.duration, 0) / calls.filter(c => c.duration > 0).length 
        : 0,
      byDisposition: {},
    };

    // Count by disposition
    calls.forEach(call => {
      if (call.disposition) {
        stats.byDisposition[call.disposition] = (stats.byDisposition[call.disposition] || 0) + 1;
      }
    });

    return stats;
  }

  async remove(id: string): Promise<void> {
    const call = await this.findOne(id);
    await this.callsRepository.remove(call);
  }
}

