import { Module } from '@nestjs/common';
import { ReporteController } from './controllers/reporte.controller.js';
import { ReporteService } from './services/reporte.service.js';
import { ReporteRepository } from './repositories/reporte.repository.js';
import { PrismaReporteRepository } from './repositories/prisma-reporte.repository.js';
import { PrismaModule } from '../../shared/prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { ScopeFilter } from '../../shared/auth/scope-filter.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ReporteController],
  providers: [
    ReporteService,
    ScopeFilter,
    {
      provide: ReporteRepository,
      useClass: PrismaReporteRepository,
    },
  ],
  exports: [ReporteService, ReporteRepository, ScopeFilter],
})
export class ReportsModule {}
