import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ContactsModule } from '../contacts/contacts.module';
import { TelephonyModule } from '../telephony/telephony.module';

@Module({
  imports: [ContactsModule, TelephonyModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}

