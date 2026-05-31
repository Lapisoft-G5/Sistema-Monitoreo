import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { AuthService } from './auth.service.js';
import { AuthRepository } from '../repositories/auth.repository.js';
import { NotImplementedException } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto.js';
import { User } from '../entities/user.entity.js';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: jest.Mocked<AuthRepository>;

  beforeEach(async () => {
    const mockAuthRepository = {
      findUserByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authRepository = module.get(AuthRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw NotImplementedException because it is part of BE-AUTH-02', async () => {
      const dto = new LoginDto();
      dto.email = 'test@test.com';
      dto.password = 'password123';

      const mockUser = new User();
      authRepository.findUserByEmail.mockResolvedValue(mockUser);

      await expect(service.login(dto)).rejects.toThrow(NotImplementedException);
      expect(authRepository.findUserByEmail).toHaveBeenCalledWith(dto.email);
    });
  });
});
