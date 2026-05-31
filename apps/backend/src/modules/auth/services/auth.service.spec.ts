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
const hashMock = jest.fn() as jest.MockedFunction<
  (password: string, salt: number | string) => Promise<string>
>;

jest.unstable_mockModule('bcrypt', () => ({
  compare: compareMock,
  hash: hashMock,
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
  let findUserByDniMock: jest.MockedFunction<(dni: string) => Promise<User | null>>;
  let findUserByIdMock: jest.MockedFunction<(id: string) => Promise<User | null>>;
  let createSessionMock: jest.MockedFunction<(data: unknown) => Promise<unknown>>;
  let updateLastLoginMock: jest.MockedFunction<(userId: string, date: Date) => Promise<void>>;
  let updatePasswordMock: jest.MockedFunction<(userId: string, passwordHash: string) => Promise<void>>;
  let jwtSignAsyncMock: jest.MockedFunction<
    (payload: unknown, options?: unknown) => Promise<string>
  >;

  beforeEach(async () => {
    findUserByDniMock = jest.fn();
    findUserByIdMock = jest.fn();
    createSessionMock = jest.fn();
    updateLastLoginMock = jest.fn();
    updatePasswordMock = jest.fn();
    jwtSignAsyncMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: {
            findUserByDni: findUserByDniMock,
            findUserById: findUserByIdMock,
            createSession: createSessionMock,
            updateLastLogin: updateLastLoginMock,
            updatePassword: updatePasswordMock,
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
    hashMock.mockReset();
    findUserByDniMock.mockReset();
    findUserByIdMock.mockReset();
    createSessionMock.mockReset();
    updateLastLoginMock.mockReset();
    updatePasswordMock.mockReset();
    jwtSignAsyncMock.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const dto: LoginDto = Object.assign(new LoginDto(), {
      dni: '12345678',
      password: 'plain_password',
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      findUserByDniMock.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(findUserByDniMock).toHaveBeenCalledWith(dto.dni);
    });

    it('should throw ForbiddenException when account is inactive', async () => {
      findUserByDniMock.mockResolvedValue(buildUser({ isActive: false }));

      await expect(service.login(dto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when account is locked', async () => {
      const lockedUntil = new Date(Date.now() + 60_000);
      findUserByDniMock.mockResolvedValue(buildUser({ lockedUntil }));

      await expect(service.login(dto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      findUserByDniMock.mockResolvedValue(buildUser());
      compareMock.mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return accessToken and user data on successful login', async () => {
      const user = buildUser();
      findUserByDniMock.mockResolvedValue(user);
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
      expect(result.user.dni).toBe(user.dni);
      expect(result.user.nombres).toBe(user.firstName);
      expect(result.user.apellidos).toBe(user.lastName);
      expect(result.user.role).toBe('ADMIN');
      expect(result.user.firstLogin).toBe(user.isFirstLogin);
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
      findUserByDniMock.mockResolvedValue(user);
      compareMock.mockResolvedValue(true);
      createSessionMock.mockResolvedValue({});
      updateLastLoginMock.mockResolvedValue(undefined);
      jwtSignAsyncMock.mockResolvedValue('signed.jwt.token');

      await expect(service.login(dto)).resolves.toBeDefined();
    });
  });

  describe('changePassword', () => {
    const changePasswordDto = {
      newPassword: 'NewSecurePassword123!',
    };

    it('should throw UnauthorizedException if user does not exist', async () => {
      findUserByIdMock.mockResolvedValue(null);

      await expect(
        service.changePassword('nonexistent-uuid', changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);

      expect(findUserByIdMock).toHaveBeenCalledWith('nonexistent-uuid');
    });

    it('should hash new password, update it in repository, and return success', async () => {
      const user = buildUser({ isFirstLogin: true });
      findUserByIdMock.mockResolvedValue(user);
      hashMock.mockResolvedValue('new_hashed_password');
      updatePasswordMock.mockResolvedValue(undefined);

      const result = await service.changePassword(user.id, changePasswordDto);

      expect(result).toEqual({
        success: true,
        message: 'Contraseña actualizada correctamente',
      });
      expect(findUserByIdMock).toHaveBeenCalledWith(user.id);
      expect(hashMock).toHaveBeenCalledWith(changePasswordDto.newPassword, 10);
      expect(updatePasswordMock).toHaveBeenCalledWith(user.id, 'new_hashed_password');
    });
  });
});
