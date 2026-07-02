import { Module } from '@nestjs/common';
import { ReporteController } from './controllers/reporte.controller.js';
import { ReporteService } from './services/reporte.service.js';
import { PdfGeneratorService } from './services/pdf-generator.service.js';
import { ReporteRepository } from './repositories/reporte.repository.js';
import { PrismaReporteRepository } from './repositories/prisma-reporte.repository.js';
import { PrismaModule } from '../../shared/prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { ScopeFilter } from '../../shared/auth/scope-filter.js';
import { EvaluationsModule } from '../evaluations/evaluations.module.js';
import { MailerModule } from '../../shared/mailer/mailer.module.js';
import { FichaFinalizadaListener } from './listeners/ficha-finalizada.listener.js';

@Module({
  imports: [PrismaModule, AuthModule, EvaluationsModule, MailerModule],
  controllers: [ReporteController],
  providers: [
    ReporteService,
    PdfGeneratorService,
    FichaFinalizadaListener,
    ScopeFilter,
    {
      provide: ReporteRepository,
      useClass: PrismaReporteRepository,
    },
  ],
  exports: [ReporteService, PdfGeneratorService, ReporteRepository, ScopeFilter],
})
export class ReportsModule {}
