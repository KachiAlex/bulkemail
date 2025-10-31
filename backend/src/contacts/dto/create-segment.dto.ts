import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { SegmentRule } from '../entities/segment.entity';

export class CreateSegmentDto {
  @ApiProperty({ example: 'High-value leads' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Contacts with lead score > 80', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: {
      conditions: [
        { field: 'leadScore', operator: 'greaterThan', value: 80 },
        { field: 'status', operator: 'in', value: ['qualified', 'negotiating'] }
      ],
      logic: 'AND'
    }
  })
  rules: SegmentRule;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

