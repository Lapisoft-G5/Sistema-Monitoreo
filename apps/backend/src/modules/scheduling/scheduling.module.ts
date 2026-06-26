import { Module } from '@nestjs/common';
import { SchedulingController } from './controllers/scheduling.controller.js';
import { SchedulingService } from './services/scheduling.service.js';
import {
  CronogramaRepository,
  SolicitudReprogramacionRepository,
} from './repositories/cronograma.repository.js';
import {
  PrismaCronogramaRepository,
  PrismaSolicitudReprogramacionRepository,
} from './repositories/prisma-cronograma.repository.js';
import { PrismaModule } from '../../shared/prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { ScopeFilter } from '../../shared/auth/scope-filter.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SchedulingController],
  providers: [
    SchedulingService,
    ScopeFilter,
    {
      provide: CronogramaRepository,
      useClass: PrismaCronogramaRepository,
    },
    {
      provide: SolicitudReprogramacionRepository,
      useClass: PrismaSolicitudReprogramacionRepository,
    },
  ],
  exports: [
    SchedulingService,
    CronogramaRepository,
    SolicitudReprogramacionRepository,
    ScopeFilter,
  ],
})
export class SchedulingModule {}
