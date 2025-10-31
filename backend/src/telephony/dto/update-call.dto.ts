import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { CallStatus, CallDisposition } from '../entities/call.entity';

export class UpdateCallDto {
  @ApiProperty({ enum: CallStatus, required: false })
  @IsOptional()
  @IsEnum(CallStatus)
  status?: CallStatus;

  @ApiProperty({ enum: CallDisposition, required: false })
  @IsOptional()
  @IsEnum(CallDisposition)
  disposition?: CallDisposition;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;
}

