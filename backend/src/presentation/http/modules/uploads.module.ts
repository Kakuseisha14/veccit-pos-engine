import { Module } from '@nestjs/common';
import { StorageModule } from '../../../infrastructure/storage/storage.module';
import { GetAvatarUseCase } from '../../../application/use-cases/get-avatar.use-case';
import { UploadsController } from '../controllers/uploads.controller';

@Module({
  imports: [StorageModule],
  controllers: [UploadsController],
  providers: [GetAvatarUseCase],
})
export class UploadsModule {}
