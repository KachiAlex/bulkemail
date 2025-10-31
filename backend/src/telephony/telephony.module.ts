import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelephonyService } from './telephony.service';
import { TelephonyController } from './telephony.controller';
import { Call } from './entities/call.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Call])],
  controllers: [TelephonyController],
  providers: [TelephonyService],
  exports: [TelephonyService],
})
export class TelephonyModule {}

