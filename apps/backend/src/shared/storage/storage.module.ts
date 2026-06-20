import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiskStorageService } from './disk-storage.service.js';
import { STORAGE_SERVICE } from './storage.constants.js';
import type { StorageService } from './storage.constants.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    DiskStorageService,
    {
      provide: STORAGE_SERVICE,
      useExisting: DiskStorageService,
    },
  ],
  exports: [STORAGE_SERVICE, DiskStorageService],
})
export class StorageModule {}

export type { StorageService, StorageBucket, StoragePutResult } from './storage.constants.js';
export { STORAGE_SERVICE } from './storage.constants.js';
