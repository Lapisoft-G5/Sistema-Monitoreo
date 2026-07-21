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
import { MailerModule } from '../../shared/mailer/mailer.module.js';
import { AlertCronService } from './services/alert-cron.service.js';
import { ScopeFilter } from '../../shared/auth/scope-filter.js';

import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [PrismaModule, AuthModule, MailerModule, NotificationsModule],
  controllers: [SchedulingController],
  providers: [
    SchedulingService,
    AlertCronService,
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
