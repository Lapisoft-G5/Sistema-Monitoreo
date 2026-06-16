var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
import { Module } from '@nestjs/common';
import { EspecialistaController } from './controllers/especialista.controller.js';
import { EspecialistaService } from './services/especialista.service.js';
import { EspecialistaRepository } from './repositories/especialista.repository.js';
import { PrismaEspecialistaRepository } from './repositories/prisma-especialista.repository.js';
import { PrismaModule } from '../../shared/prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { CatalogsModule } from '../catalogs/catalogs.module.js';
let EspecialistasModule = class EspecialistasModule {};
EspecialistasModule = __decorate(
  [
    Module({
      imports: [PrismaModule, AuthModule, CatalogsModule],
      controllers: [EspecialistaController],
      providers: [
        EspecialistaService,
        {
          provide: EspecialistaRepository,
          useClass: PrismaEspecialistaRepository,
        },
      ],
      exports: [EspecialistaService, EspecialistaRepository],
    }),
  ],
  EspecialistasModule,
);
export { EspecialistasModule };
//# sourceMappingURL=especialistas.module.js.map
