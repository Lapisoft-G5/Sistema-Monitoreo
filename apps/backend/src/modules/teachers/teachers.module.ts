import { Module } from '@nestjs/common';
import { TeachersService } from './services/teachers.service.js';
import { TeachersController } from './controllers/teachers.controller.js';
import { DocentesCargosController } from './controllers/docentes-cargos.controller.js';
import { DocentesCargosService } from './services/docentes-cargos.service.js';
import { PrismaModule } from '../../shared/prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { TeachersRepository } from './repositories/teachers.repository.js';
import { PrismaTeachersRepository } from './repositories/prisma-teachers.repository.js';
import { CatalogsModule } from '../catalogs/catalogs.module.js';
import { CargoCompatibilityService } from '../../shared/auth/cargo-compatibility.service.js';

@Module({
  imports: [PrismaModule, AuthModule, CatalogsModule],
  controllers: [TeachersController, DocentesCargosController],
  providers: [
    TeachersService,
    DocentesCargosService,
    CargoCompatibilityService,
    {
      provide: TeachersRepository,
      useClass: PrismaTeachersRepository,
    },
  ],
  exports: [TeachersService, TeachersRepository, DocentesCargosService],
})
export class TeachersModule {}
