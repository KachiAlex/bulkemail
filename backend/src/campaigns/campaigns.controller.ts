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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new campaign' })
  create(@Body() createCampaignDto: CreateCampaignDto, @Request() req) {
    return this.campaignsService.create(createCampaignDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns' })
  findAll(@Request() req) {
    return this.campaignsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send campaign' })
  sendCampaign(@Param('id') id: string) {
    return this.campaignsService.sendCampaign(id);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause campaign' })
  pauseCampaign(@Param('id') id: string) {
    return this.campaignsService.pauseCampaign(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel campaign' })
  cancelCampaign(@Param('id') id: string) {
    return this.campaignsService.cancelCampaign(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get campaign statistics' })
  getCampaignStats(@Param('id') id: string) {
    return this.campaignsService.getCampaignStats(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete campaign' })
  remove(@Param('id') id: string) {
    return this.campaignsService.remove(id);
  }
}

