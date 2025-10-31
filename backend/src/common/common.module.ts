import { Module, Global } from '@nestjs/common';
import { EncryptionService } from './services/encryption.service';
import { FileService } from './services/file.service';

@Global()
@Module({
  providers: [EncryptionService, FileService],
  exports: [EncryptionService, FileService],
})
export class CommonModule {}

