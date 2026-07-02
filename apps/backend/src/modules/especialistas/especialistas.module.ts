import { Module } from '@nestjs/common';
import { EspecialistaController } from './controllers/especialista.controller.js';
import { EspecialistasCargosController } from './controllers/especialistas-cargos.controller.js';
import { EspecialistaService } from './services/especialista.service.js';
import { EspecialistasCargosService } from './services/especialistas-cargos.service.js';
import { EspecialistaRepository } from './repositories/especialista.repository.js';
import { PrismaEspecialistaRepository } from './repositories/prisma-especialista.repository.js';
import { PrismaModule } from '../../shared/prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { CatalogsModule } from '../catalogs/catalogs.module.js';

@Module({
  imports: [PrismaModule, AuthModule, CatalogsModule],
  controllers: [EspecialistaController, EspecialistasCargosController],
  providers: [
    EspecialistaService,
    EspecialistasCargosService,
    {
      provide: EspecialistaRepository,
      useClass: PrismaEspecialistaRepository,
    },
  ],
  exports: [EspecialistaService, EspecialistaRepository, EspecialistasCargosService],
})
export class EspecialistasModule {}
