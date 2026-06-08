import { Module, Global } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module.js';
import { CatalogsRepository } from './repositories/catalogs.repository.js';
import { PrismaCatalogsRepository } from './repositories/prisma-catalogs.repository.js';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: CatalogsRepository,
      useClass: PrismaCatalogsRepository,
    },
  ],
  exports: [CatalogsRepository],
})
export class CatalogsModule {}
