import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { ConfigModule } from '@nestjs/config';
import { EspecialistasModule } from './especialistas.module.js';
import { EspecialistaService } from './services/especialista.service.js';
import { EspecialistaRepository } from './repositories/especialista.repository.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { CatalogsRepository } from '../catalogs/repositories/catalogs.repository.js';

describe('EspecialistasModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), EspecialistasModule],
    })
      .overrideProvider(CatalogsRepository)
      .useValue({
        findRoleByCode: jest.fn<any>(),
        findPersonaByDni: jest.fn<any>(),
      })
      .overrideProvider(PrismaService)
      .useValue({
        especialista: {
          findMany: jest.fn<any>(),
          findUnique: jest.fn<any>(),
          create: jest.fn<any>(),
          update: jest.fn<any>(),
        },
        persona: {
          findUnique: jest.fn<any>(),
          create: jest.fn<any>(),
          update: jest.fn<any>(),
        },
        user: {
          findUnique: jest.fn<any>(),
          create: jest.fn<any>(),
          update: jest.fn<any>(),
          updateMany: jest.fn<any>(),
        },
        role: { findUnique: jest.fn<any>() },
        $transaction: jest.fn<any>(),
        $queryRaw: jest.fn<any>(),
      })
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide EspecialistaService', () => {
    const service = module.get<EspecialistaService>(EspecialistaService);
    expect(service).toBeDefined();
  });

  it('should provide EspecialistaRepository', () => {
    const repository = module.get<EspecialistaRepository>(EspecialistaRepository);
    expect(repository).toBeDefined();
  });
});
