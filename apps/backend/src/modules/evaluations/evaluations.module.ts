import { Module } from '@nestjs/common';
import { FichaController } from './controllers/ficha.controller.js';
import { FichaService } from './services/ficha.service.js';
import { FichaRepository } from './repositories/ficha.repository.js';
import { PrismaFichaRepository } from './repositories/prisma-ficha.repository.js';
import { PrismaModule } from '../../shared/prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [FichaController],
  providers: [
    FichaService,
    {
      provide: FichaRepository,
      useClass: PrismaFichaRepository,
    },
  ],
  exports: [FichaService, FichaRepository],
})
export class EvaluationsModule {}
