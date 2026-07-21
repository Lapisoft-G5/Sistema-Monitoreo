import { Module } from '@nestjs/common';
import { VisitRequestsController } from './controllers/visit-requests.controller.js';
import { VisitRequestsService } from './services/visit-requests.service.js';
import { PrismaModule } from '../../shared/prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [PrismaModule, AuthModule, NotificationsModule],
  controllers: [VisitRequestsController],
  providers: [VisitRequestsService],
})
export class VisitRequestsModule {}
