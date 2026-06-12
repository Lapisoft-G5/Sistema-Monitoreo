import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { InstitutionsController } from './controllers/institutions.controller.js';
import { InstitutionsService } from './services/institutions.service.js';
import { InstitutionsRepository } from './repositories/institutions.repository.js';
import { PrismaInstitutionsRepository } from './repositories/prisma-institutions.repository.js';

@Module({
  imports: [AuthModule],
  controllers: [InstitutionsController],
  providers: [
    InstitutionsService,
    {
      provide: InstitutionsRepository,
      useClass: PrismaInstitutionsRepository,
    },
  ],
  exports: [InstitutionsService, InstitutionsRepository],
})
export class InstitutionsModule {}
