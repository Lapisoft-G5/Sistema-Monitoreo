import { Module } from '@nestjs/common';
import { JefeAreaController } from './controllers/jefe-area.controller.js';
import { JefeAreaService } from './services/jefe-area.service.js';
import { JefeAreaRepository } from './repositories/jefe-area.repository.js';
import { PrismaJefeAreaRepository } from './repositories/prisma-jefe-area.repository.js';
import { PrismaModule } from '../../shared/prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { CatalogsModule } from '../catalogs/catalogs.module.js';

@Module({
  imports: [PrismaModule, AuthModule, CatalogsModule],
  controllers: [JefeAreaController],
  providers: [
    JefeAreaService,
    {
      provide: JefeAreaRepository,
      useClass: PrismaJefeAreaRepository,
    },
  ],
  exports: [JefeAreaService, JefeAreaRepository],
})
export class JefesAreaModule {}
