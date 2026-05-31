import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module.js';
import { AuthService } from './services/auth.service.js';
import { AuthRepository } from './repositories/auth.repository.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
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
});
