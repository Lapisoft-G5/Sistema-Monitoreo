import { Module } from '@nestjs/common';
import { SuperuserService } from './superuser.service.js';
import { SuperuserController } from './superuser.controller.js';
import { PrismaModule } from '../../shared/prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SuperuserController],
  providers: [SuperuserService],
})
export class SuperuserModule {}
