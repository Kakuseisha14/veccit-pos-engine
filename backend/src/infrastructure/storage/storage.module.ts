import { Module } from '@nestjs/common';
import { AVATAR_STORAGE } from '../../application/services/avatar-storage.service';
import { DiskAvatarStorageService } from './disk-avatar-storage.service';

@Module({
  providers: [
    DiskAvatarStorageService,
    { provide: AVATAR_STORAGE, useClass: DiskAvatarStorageService },
  ],
  exports: [AVATAR_STORAGE],
})
export class StorageModule {}
