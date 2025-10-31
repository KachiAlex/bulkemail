import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Res,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { TelephonyService } from './telephony.service';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('telephony')
@Controller('telephony')
export class TelephonyController {
  constructor(private readonly telephonyService: TelephonyService) {}

  @Post('calls')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate a call' })
  initiateCall(@Body() createCallDto: CreateCallDto, @Request() req) {
    return this.telephonyService.initiateCall(createCallDto, req.user.userId);
  }

  @Get('calls')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all calls' })
  findAll(@Request() req, @Query('userId') userId?: string) {
    return this.telephonyService.findAll(userId || req.user.userId);
  }

  @Get('calls/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get call statistics' })
  getCallStats(@Request() req, @Query('userId') userId?: string) {
    return this.telephonyService.getCallStats(userId || req.user.userId);
  }

  @Get('calls/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get call by ID' })
  findOne(@Param('id') id: string) {
    return this.telephonyService.findOne(id);
  }

  @Patch('calls/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update call' })
  update(@Param('id') id: string, @Body() updateCallDto: UpdateCallDto) {
    return this.telephonyService.update(id, updateCallDto);
  }

  @Delete('calls/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete call' })
  remove(@Param('id') id: string) {
    return this.telephonyService.remove(id);
  }

  // Twilio webhooks
  @Get('twiml/:callId')
  @ApiOperation({ summary: 'TwiML endpoint for call handling' })
  getTwiml(@Param('callId') callId: string, @Res() res: Response) {
    const twiml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>Please wait while we connect your call.</Say>
        <Dial>
          <Number>${callId}</Number>
        </Dial>
      </Response>
    `;
    res.type('text/xml');
    res.send(twiml);
  }

  @Post('callback/:callId')
  @ApiOperation({ summary: 'Twilio status callback' })
  async handleCallback(
    @Param('callId') callId: string,
    @Body() body: any,
  ) {
    const { CallStatus, CallDuration } = body;
    await this.telephonyService.handleStatusCallback(
      callId,
      CallStatus,
      CallDuration ? parseInt(CallDuration) : undefined,
    );
    return { success: true };
  }

  @Post('recording/:callId')
  @ApiOperation({ summary: 'Twilio recording callback' })
  async handleRecording(
    @Param('callId') callId: string,
    @Body() body: any,
  ) {
    const { RecordingSid, RecordingUrl } = body;
    await this.telephonyService.handleRecordingCallback(
      callId,
      RecordingSid,
      RecordingUrl,
    );
    return { success: true };
  }
}

