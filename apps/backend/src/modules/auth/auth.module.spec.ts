import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { AuthModule } from './auth.module.js';
import { AuthService } from './services/auth.service.js';
import { AuthRepository } from './repositories/auth.repository.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        user: { findUnique: jest.fn(), update: jest.fn() },
        authSession: { create: jest.fn() },
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

  it('should provide AuthService', () => {
    const authService = module.get<AuthService>(AuthService);
    expect(authService).toBeDefined();
  });

  it('should provide AuthRepository', () => {
    const authRepository = module.get<AuthRepository>(AuthRepository);
    expect(authRepository).toBeDefined();
  });

  it('should provide JwtService', () => {
    const jwtService = module.get<JwtService>(JwtService);
    expect(jwtService).toBeDefined();
  });

  it('should provide AuthGuard', () => {
    const authGuard = module.get<AuthGuard>(AuthGuard);
    expect(authGuard).toBeDefined();
  });

  it('should provide RolesGuard', () => {
    const rolesGuard = module.get<RolesGuard>(RolesGuard);
    expect(rolesGuard).toBeDefined();
  });
});
