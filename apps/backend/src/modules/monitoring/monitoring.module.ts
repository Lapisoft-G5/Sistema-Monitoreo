import { Module } from '@nestjs/common';
import { MonitoringPlanController } from './controllers/monitoring-plan.controller.js';
import { MonitoringPlanService } from './services/monitoring-plan.service.js';
import { MonitoringPlanRepository } from './repositories/monitoring-plan.repository.js';
import { PrismaMonitoringPlanRepository } from './repositories/prisma-monitoring-plan.repository.js';
import { PrismaModule } from '../../shared/prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MonitoringPlanController],
  providers: [
    MonitoringPlanService,
    {
      provide: MonitoringPlanRepository,
      useClass: PrismaMonitoringPlanRepository,
    },
  ],
  exports: [MonitoringPlanService, MonitoringPlanRepository],
})
export class MonitoringModule {}
