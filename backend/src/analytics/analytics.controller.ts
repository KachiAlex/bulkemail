import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getDashboardStats(@Query('userId') userId?: string) {
    return this.analyticsService.getDashboardStats(userId);
  }

  @Get('contact-trends')
  @ApiOperation({ summary: 'Get contact engagement trends' })
  getContactEngagementTrends(@Query('days') days?: number) {
    return this.analyticsService.getContactEngagementTrends(days ? parseInt(days.toString()) : 30);
  }

  @Get('campaign-performance')
  @ApiOperation({ summary: 'Get campaign performance metrics' })
  getCampaignPerformance(@Query('campaignId') campaignId?: string) {
    return this.analyticsService.getCampaignPerformance(campaignId);
  }

  @Get('lead-sources')
  @ApiOperation({ summary: 'Get lead source analysis' })
  getLeadSourceAnalysis() {
    return this.analyticsService.getLeadSourceAnalysis();
  }

  @Get('user-performance')
  @ApiOperation({ summary: 'Get user performance metrics' })
  getUserPerformance() {
    return this.analyticsService.getUserPerformance();
  }

  @Get('conversion-funnel')
  @ApiOperation({ summary: 'Get conversion funnel data' })
  getConversionFunnel() {
    return this.analyticsService.getConversionFunnel();
  }
}

