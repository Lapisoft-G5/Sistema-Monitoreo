import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { RlsMiddleware } from './rls.middleware.js';

@Global()
@Module({
  providers: [PrismaService, RlsMiddleware],
  exports: [PrismaService],
})
export class PrismaModule {}
