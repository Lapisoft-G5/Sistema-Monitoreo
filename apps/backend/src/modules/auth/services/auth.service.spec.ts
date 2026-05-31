import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../repositories/auth.repository.js';
import { LoginDto } from '../dto/login.dto.js';
import { User } from '../entities/user.entity.js';
import { Role } from '../entities/role.entity.js';

const compareMock = jest.fn() as jest.MockedFunction<
  (password: string, hash: string) => Promise<boolean>
>;

jest.unstable_mockModule('bcrypt', () => ({
  compare: compareMock,
}));

const { AuthService } = await import('./auth.service.js');

function buildRole(overrides: Partial<Role> = {}): Role {
  return Object.assign(new Role(), {
    id: 'role-uuid',
    code: 'ADMIN',
    name: 'Administrador',
    description: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

function buildUser(overrides: Partial<User> = {}): User {
  return Object.assign(new User(), {
    id: 'user-uuid',
    roleId: 'role-uuid',
    dni: '12345678',
    email: 'test@example.com',
    firstName: 'Juan',
    lastName: 'Pérez',
    passwordHash: 'hashed_password',
    isActive: true,
    isFirstLogin: false,
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: null,
    lastFailedLoginAt: null,
    passwordChangedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: buildRole(),
    ...overrides,
  });
}

describe('AuthService', () => {
  let service: InstanceType<typeof AuthService>;
  let findUserByEmailMock: jest.MockedFunction<(email: string) => Promise<User | null>>;
  let createSessionMock: jest.MockedFunction<(data: unknown) => Promise<unknown>>;
  let updateLastLoginMock: jest.MockedFunction<(userId: string, date: Date) => Promise<void>>;
  let jwtSignAsyncMock: jest.MockedFunction<
    (payload: unknown, options?: unknown) => Promise<string>
  >;

  beforeEach(async () => {
    findUserByEmailMock = jest.fn();
    createSessionMock = jest.fn();
    updateLastLoginMock = jest.fn();
    jwtSignAsyncMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: {
            findUserByEmail: findUserByEmailMock,
            createSession: createSessionMock,
            updateLastLogin: updateLastLoginMock,
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jwtSignAsyncMock,
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  beforeEach(() => {
    compareMock.mockReset();
    findUserByEmailMock.mockReset();
    createSessionMock.mockReset();
    updateLastLoginMock.mockReset();
    jwtSignAsyncMock.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const dto: LoginDto = Object.assign(new LoginDto(), {
      email: 'test@example.com',
      password: 'plain_password',
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      findUserByEmailMock.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(findUserByEmailMock).toHaveBeenCalledWith(dto.email);
    });

    it('should throw ForbiddenException when account is inactive', async () => {
      findUserByEmailMock.mockResolvedValue(buildUser({ isActive: false }));

      await expect(service.login(dto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when account is locked', async () => {
      const lockedUntil = new Date(Date.now() + 60_000);
      findUserByEmailMock.mockResolvedValue(buildUser({ lockedUntil }));

      await expect(service.login(dto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      findUserByEmailMock.mockResolvedValue(buildUser());
      compareMock.mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return accessToken and user data on successful login', async () => {
      const user = buildUser();
      findUserByEmailMock.mockResolvedValue(user);
      compareMock.mockResolvedValue(true);
      createSessionMock.mockResolvedValue({});
      updateLastLoginMock.mockResolvedValue(undefined);
      jwtSignAsyncMock.mockResolvedValue('signed.jwt.token');

      const result = await service.login(dto, {
        ipAddress: '127.0.0.1',
        userAgent: 'Jest',
      });

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user.id).toBe(user.id);
      expect(result.user.email).toBe(user.email);
      expect(result.user.role).toBe('ADMIN');
      expect(createSessionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: user.id,
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
        }),
      );
      expect(updateLastLoginMock).toHaveBeenCalledWith(user.id, expect.any(Date));
    });

    it('should not throw when lockedUntil is in the past', async () => {
      const pastDate = new Date(Date.now() - 60_000);
      const user = buildUser({ lockedUntil: pastDate });
      findUserByEmailMock.mockResolvedValue(user);
      compareMock.mockResolvedValue(true);
      createSessionMock.mockResolvedValue({});
      updateLastLoginMock.mockResolvedValue(undefined);
      jwtSignAsyncMock.mockResolvedValue('signed.jwt.token');

      await expect(service.login(dto)).resolves.toBeDefined();
    });
  });
});
