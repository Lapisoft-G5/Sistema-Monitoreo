import { Module } from '@nestjs/common';
import { DashboardController } from './controllers/dashboard.controller.js';
import { DashboardService } from './services/dashboard.service.js';
import { DashboardRepository } from './repositories/dashboard.repository.js';
import { PrismaDashboardRepository } from './repositories/prisma-dashboard.repository.js';
import { PrismaModule } from '../../shared/prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { ScopeFilter } from '../../shared/auth/scope-filter.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    ScopeFilter,
    {
      provide: DashboardRepository,
      useClass: PrismaDashboardRepository,
    },
  ],
  exports: [DashboardService],
})
export class DashboardModule {}
