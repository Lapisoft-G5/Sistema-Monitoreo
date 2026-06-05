import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { EspecialistasModule } from './especialistas.module.js';
import { EspecialistaService } from './services/especialista.service.js';
import { EspecialistaRepository } from './repositories/especialista.repository.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';

describe('EspecialistasModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [EspecialistasModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        especialista: {
          findMany: jest.fn(),
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
        },
        persona: {
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
        },
        user: {
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          updateMany: jest.fn(),
        },
        role: { findUnique: jest.fn() },
        $transaction: jest.fn(),
        $queryRaw: jest.fn(),
      })
      .overrideProvider(ConfigService)
      .useValue({
        getOrThrow: jest.fn().mockReturnValue('test_secret'),
        get: jest.fn().mockReturnValue(undefined),
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
