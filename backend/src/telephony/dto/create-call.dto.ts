import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { CallDirection } from '../entities/call.entity';

export class CreateCallDto {
  @ApiProperty({ example: '+1234567890' })
  @IsString()
  toNumber: string;

  @ApiProperty({ example: 'contact-uuid', required: false })
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiProperty({ enum: CallDirection, default: CallDirection.OUTBOUND })
  @IsEnum(CallDirection)
  direction: CallDirection;
}

