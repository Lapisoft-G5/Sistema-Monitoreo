import { Module } from '@nestjs/common';
import { EspecialistaController } from './controllers/especialista.controller.js';
import { EspecialistaService } from './services/especialista.service.js';
import { EspecialistaRepository } from './repositories/especialista.repository.js';
import { PrismaEspecialistaRepository } from './repositories/prisma-especialista.repository.js';
import { PrismaModule } from '../../shared/prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [EspecialistaController],
  providers: [
    EspecialistaService,
    {
      provide: EspecialistaRepository,
      useClass: PrismaEspecialistaRepository,
    },
  ],
  exports: [EspecialistaService, EspecialistaRepository],
})
export class EspecialistasModule {}
