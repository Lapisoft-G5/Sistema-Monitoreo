import { Module } from '@nestjs/common';
import { TeachersService } from './services/teachers.service.js';
import { TeachersController } from './controllers/teachers.controller.js';
import { PrismaModule } from '../../shared/prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { TeachersRepository } from './repositories/teachers.repository.js';
import { PrismaTeachersRepository } from './repositories/prisma-teachers.repository.js';
import { CatalogsModule } from '../catalogs/catalogs.module.js';

@Module({
  imports: [PrismaModule, AuthModule, CatalogsModule],
  controllers: [TeachersController],
  providers: [
    TeachersService,
    {
      provide: TeachersRepository,
      useClass: PrismaTeachersRepository,
    },
  ],
  exports: [TeachersService, TeachersRepository],
})
export class TeachersModule {}
