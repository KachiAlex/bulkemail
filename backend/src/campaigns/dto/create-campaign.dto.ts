import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, IsDateString } from 'class-validator';
import { CampaignType } from '../entities/campaign.entity';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Summer Sale 2024' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Promotional campaign for summer sale', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CampaignType })
  @IsEnum(CampaignType)
  type: CampaignType;

  @ApiProperty({ example: 'Special Summer Offer - 50% Off!', required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: 'Hi {{firstName}}, check out our amazing summer deals!' })
  @IsString()
  content: string;

  @ApiProperty({ example: '<html>...</html>', required: false })
  @IsOptional()
  @IsString()
  htmlContent?: string;

  @ApiProperty({ example: ['uuid1', 'uuid2'], required: false })
  @IsOptional()
  @IsArray()
  recipientContactIds?: string[];

  @ApiProperty({ example: 'segment-uuid', required: false })
  @IsOptional()
  @IsString()
  segmentId?: string;

  @ApiProperty({ example: '2024-06-01T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

