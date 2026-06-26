import { Module } from '@nestjs/common';
import { MonitoringPlanController } from './controllers/monitoring-plan.controller.js';
import { PlantillaController } from './controllers/plantilla.controller.js';
import { MonitoringPlanService } from './services/monitoring-plan.service.js';
import { PlantillaService } from './services/plantilla.service.js';
import { MonitoringPlanRepository } from './repositories/monitoring-plan.repository.js';
import { PrismaMonitoringPlanRepository } from './repositories/prisma-monitoring-plan.repository.js';
import { PlantillaRepository } from './repositories/plantilla.repository.js';
import { PrismaPlantillaRepository } from './repositories/prisma-plantilla.repository.js';
import { PrismaModule } from '../../shared/prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MonitoringPlanController, PlantillaController],
  providers: [
    MonitoringPlanService,
    {
      provide: MonitoringPlanRepository,
      useClass: PrismaMonitoringPlanRepository,
    },
    PlantillaService,
    {
      provide: PlantillaRepository,
      useClass: PrismaPlantillaRepository,
    },
  ],
  exports: [MonitoringPlanService, MonitoringPlanRepository, PlantillaService, PlantillaRepository],
})
export class MonitoringModule {}
