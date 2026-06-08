import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { ForbiddenException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../repositories/auth.repository.js';
import { LoginDto } from '../dto/login.dto.js';
import { User } from '../entities/user.entity.js';
import { Role } from '../entities/role.entity.js';
import { Persona } from '../entities/persona.entity.js';
import { MailerService } from '../../../shared/mailer/mailer.service.js';
import { RoleCode } from '../../../common/enums/role.enum.js';

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

function buildPersona(overrides: Partial<Persona> = {}): Persona {
  return Object.assign(new Persona(), {
    id: 'persona-uuid',
    dni: '12345678',
    nombres: 'Juan',
    apellidos: 'Pérez',
    correo: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

function buildUser(overrides: Partial<User> = {}): User {
  return Object.assign(new User(), {
    id: 'user-uuid',
    personaId: 'persona-uuid',
    roleId: 'role-uuid',
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
    persona: buildPersona(),
    role: buildRole(),
    ...overrides,
  });
}

describe('AuthService', () => {
  let service: InstanceType<typeof AuthService>;
  let findUserByDniMock: jest.MockedFunction<(dni: string) => Promise<User | null>>;
  let findUserByIdMock: jest.MockedFunction<(id: string) => Promise<User | null>>;
  let findUserByDniAndEmailMock: jest.MockedFunction<
    (dni: string, email: string) => Promise<User | null>
  >;
  let createSessionMock: jest.MockedFunction<(data: unknown) => Promise<unknown>>;
  let createPasswordResetTokenMock: jest.MockedFunction<(data: unknown) => Promise<void>>;
  let updateLastLoginMock: jest.MockedFunction<(userId: string, date: Date) => Promise<void>>;
  let updatePasswordMock: jest.MockedFunction<
    (userId: string, passwordHash: string) => Promise<void>
  >;
  let incrementFailedAttemptsMock: jest.MockedFunction<
    (userId: string, now: Date) => Promise<number>
  >;
  let lockAccountMock: jest.MockedFunction<(userId: string, until: Date) => Promise<void>>;
  let resetFailedAttemptsMock: jest.MockedFunction<(userId: string) => Promise<void>>;
  let findResetTokenMock: jest.MockedFunction<(tokenHash: string) => Promise<any>>;
  let useResetTokenMock: jest.MockedFunction<
    (tokenId: string, userId: string, passwordHash: string) => Promise<void>
  >;
  let invalidateSessionMock: jest.MockedFunction<
    (sessionJti: string, reason: string) => Promise<void>
  >;
  let hasActiveSessionMock: jest.MockedFunction<(userId: string) => Promise<boolean>>;
  let logAuthEventMock: jest.MockedFunction<(data: any) => Promise<void>>;
  let jwtSignAsyncMock: jest.MockedFunction<
    (payload: unknown, options?: unknown) => Promise<string>
  >;
  let sendPasswordResetEmailMock: jest.MockedFunction<
    (to: string, dni: string, token: string) => Promise<void>
  >;

  beforeEach(async () => {
    findUserByDniMock = jest.fn();
    findUserByIdMock = jest.fn();
    findUserByDniAndEmailMock = jest.fn();
    createSessionMock = jest.fn();
    createPasswordResetTokenMock = jest.fn();
    findResetTokenMock = jest.fn();
    useResetTokenMock = jest.fn();
    invalidateSessionMock = jest.fn();
    hasActiveSessionMock = jest.fn();
    updateLastLoginMock = jest.fn();
    updatePasswordMock = jest.fn();
    incrementFailedAttemptsMock = jest.fn();
    lockAccountMock = jest.fn();
    resetFailedAttemptsMock = jest.fn();
    logAuthEventMock = jest.fn();
    jwtSignAsyncMock = jest.fn();
    sendPasswordResetEmailMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: {
            findUserByDni: findUserByDniMock,
            findUserById: findUserByIdMock,
            findUserByDniAndEmail: findUserByDniAndEmailMock,
            createSession: createSessionMock,
            createPasswordResetToken: createPasswordResetTokenMock,
            findResetToken: findResetTokenMock,
            useResetToken: useResetTokenMock,
            invalidateSession: invalidateSessionMock,
            hasActiveSession: hasActiveSessionMock,
            updateLastLogin: updateLastLoginMock,
            updatePassword: updatePasswordMock,
            incrementFailedAttempts: incrementFailedAttemptsMock,
            lockAccount: lockAccountMock,
            resetFailedAttempts: resetFailedAttemptsMock,
            logAuthEvent: logAuthEventMock,
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jwtSignAsyncMock,
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendPasswordResetEmail: sendPasswordResetEmailMock,
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
    findUserByDniAndEmailMock.mockReset();
    createSessionMock.mockReset();
    createPasswordResetTokenMock.mockReset();
    findResetTokenMock.mockReset();
    useResetTokenMock.mockReset();
    invalidateSessionMock.mockReset();
    hasActiveSessionMock.mockReset();
    updateLastLoginMock.mockReset();
    updatePasswordMock.mockReset();
    incrementFailedAttemptsMock.mockReset();
    lockAccountMock.mockReset();
    resetFailedAttemptsMock.mockReset();
    logAuthEventMock.mockReset();
    jwtSignAsyncMock.mockReset();
    sendPasswordResetEmailMock.mockReset();
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
      expect(logAuthEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'LOGIN_FAILURE_UNREGISTERED',
        }),
      );
    });

    it('should throw ForbiddenException when account is inactive', async () => {
      findUserByDniMock.mockResolvedValue(buildUser({ isActive: false }));

      await expect(service.login(dto)).rejects.toThrow(ForbiddenException);
      expect(logAuthEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'LOGIN_FAILURE_INACTIVE',
        }),
      );
    });

    it('should throw ForbiddenException when account is locked', async () => {
      const lockedUntil = new Date(Date.now() + 60_000);
      findUserByDniMock.mockResolvedValue(buildUser({ lockedUntil }));

      await expect(service.login(dto)).rejects.toThrow(ForbiddenException);
      expect(logAuthEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'LOGIN_FAILURE_LOCKED',
        }),
      );
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      findUserByDniMock.mockResolvedValue(buildUser());
      compareMock.mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(logAuthEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'LOGIN_FAILURE',
        }),
      );
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
      expect(result.user.dni).toBe(user.persona?.dni);
      expect(result.user.nombres).toBe(user.persona?.nombres);
      expect(result.user.apellidos).toBe(user.persona?.apellidos);
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
      expect(logAuthEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: user.id,
          eventType: 'LOGIN_SUCCESS',
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
        }),
      );
    });

    it('should inject institucion_id and colegio_id in JWT payload on successful login for director_institucion role', async () => {
      const directorRole = buildRole({ code: RoleCode.DIRECTOR_INSTITUCION });
      const personaWithDocente = buildPersona({
        docente: {
          id: 'docente-uuid',
          institucionId: 'ie-modular-uuid',
          gradoAcademico: 'Licenciado',
          nivelEducativo: 'Secundaria',
          cursoAsignado: null,
          estado: 'Activo',
        },
      });
      const user = buildUser({
        role: directorRole,
        persona: personaWithDocente,
      });

      findUserByDniMock.mockResolvedValue(user);
      compareMock.mockResolvedValue(true);
      createSessionMock.mockResolvedValue({});
      updateLastLoginMock.mockResolvedValue(undefined);
      jwtSignAsyncMock.mockResolvedValue('signed.jwt.token');

      await service.login(dto);

      expect(jwtSignAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({
          role: RoleCode.DIRECTOR_INSTITUCION,
          institucion_id: 'ie-modular-uuid',
          colegio_id: 'ie-modular-uuid',
        }),
        expect.any(Object),
      );
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
      expect(resetFailedAttemptsMock).toHaveBeenCalledWith(user.id);
    });

    it('should increment failed attempts and throw UnauthorizedException on wrong password', async () => {
      const user = buildUser({ failedLoginAttempts: 0 });
      findUserByDniMock.mockResolvedValue(user);
      compareMock.mockResolvedValue(false);
      incrementFailedAttemptsMock.mockResolvedValue(1);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(incrementFailedAttemptsMock).toHaveBeenCalledWith(user.id, expect.any(Date));
      expect(lockAccountMock).not.toHaveBeenCalled();
    });

    it('should lock account for 15 minutes and throw ForbiddenException when attempts reach 3', async () => {
      const user = buildUser({ failedLoginAttempts: 2 });
      findUserByDniMock.mockResolvedValue(user);
      compareMock.mockResolvedValue(false);
      incrementFailedAttemptsMock.mockResolvedValue(3);

      await expect(service.login(dto)).rejects.toThrow(ForbiddenException);
      expect(incrementFailedAttemptsMock).toHaveBeenCalledWith(user.id, expect.any(Date));
      expect(lockAccountMock).toHaveBeenCalledWith(user.id, expect.any(Date));
      expect(logAuthEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: user.id,
          eventType: 'ACCOUNT_LOCKED',
        }),
      );
    });

    it('should reset attempts on successful login if user had previous attempts', async () => {
      const user = buildUser({ failedLoginAttempts: 1 });
      findUserByDniMock.mockResolvedValue(user);
      compareMock.mockResolvedValue(true);
      createSessionMock.mockResolvedValue({});
      updateLastLoginMock.mockResolvedValue(undefined);
      jwtSignAsyncMock.mockResolvedValue('signed.jwt.token');

      await service.login(dto);
      expect(resetFailedAttemptsMock).toHaveBeenCalledWith(user.id);
    });

    it('should reset attempts first if login fails but past lock has expired', async () => {
      const pastDate = new Date(Date.now() - 60_000);
      const user = buildUser({ failedLoginAttempts: 3, lockedUntil: pastDate });
      findUserByDniMock.mockResolvedValue(user);
      compareMock.mockResolvedValue(false);
      incrementFailedAttemptsMock.mockResolvedValue(1);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(resetFailedAttemptsMock).toHaveBeenCalledWith(user.id);
      expect(incrementFailedAttemptsMock).toHaveBeenCalledWith(user.id, expect.any(Date));
    });
  });

  describe('changePassword', () => {
    const changePasswordDto = {
      newPassword: 'NewSecurePassword123!',
    };

    it('should throw UnauthorizedException if user does not exist', async () => {
      findUserByIdMock.mockResolvedValue(null);

      await expect(service.changePassword('nonexistent-uuid', 'fake-jti', changePasswordDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(findUserByIdMock).toHaveBeenCalledWith('nonexistent-uuid');
    });

    it('should hash new password, update it in repository, and return success', async () => {
      const user = buildUser({ isFirstLogin: true });
      findUserByIdMock.mockResolvedValue(user);
      hashMock.mockResolvedValue('new_hashed_password');
      updatePasswordMock.mockResolvedValue(undefined);

      jwtSignAsyncMock.mockResolvedValue('new-fake-jwt-token');

      const result = await service.changePassword(user.id, 'fake-jti', changePasswordDto, {
        ipAddress: '127.0.0.1',
        userAgent: 'Jest',
      });

      expect(result).toEqual({
        success: true,
        message: 'Contraseña actualizada correctamente',
        accessToken: 'new-fake-jwt-token',
      });
      expect(findUserByIdMock).toHaveBeenCalledWith(user.id);
      expect(hashMock).toHaveBeenCalledWith(changePasswordDto.newPassword, 10);
      expect(updatePasswordMock).toHaveBeenCalledWith(user.id, 'new_hashed_password');
      expect(logAuthEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: user.id,
          eventType: 'PASSWORD_CHANGE',
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
        }),
      );
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto = {
      dni: '76358911',
      email: 'carlos.quispe@ugel-lampa.gob.pe',
    };

    it('should securely return generic message if user is not found (prevents account enumeration)', async () => {
      findUserByDniAndEmailMock.mockResolvedValue(null);

      const result = await service.forgotPassword(forgotPasswordDto, {
        ipAddress: '127.0.0.1',
        userAgent: 'Jest',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('recibirá un correo');
      expect(findUserByDniAndEmailMock).toHaveBeenCalledWith(
        forgotPasswordDto.dni,
        forgotPasswordDto.email,
      );
      expect(createPasswordResetTokenMock).not.toHaveBeenCalled();
      expect(sendPasswordResetEmailMock).not.toHaveBeenCalled();
      expect(logAuthEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'PASSWORD_RESET_REQUEST_UNREGISTERED',
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
        }),
      );
    });

    it('should generate token, hash it, save reset request and return success if user exists', async () => {
      const user = buildUser();
      findUserByDniAndEmailMock.mockResolvedValue(user);
      hasActiveSessionMock.mockResolvedValue(false); // No active session
      createPasswordResetTokenMock.mockResolvedValue(undefined);

      const result = await service.forgotPassword(forgotPasswordDto, {
        ipAddress: '127.0.0.1',
        userAgent: 'Jest',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('recibirá un correo');
      expect(findUserByDniAndEmailMock).toHaveBeenCalledWith(
        forgotPasswordDto.dni,
        forgotPasswordDto.email,
      );
      expect(createPasswordResetTokenMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: user.id,
          tokenHash: expect.any(String),
          expiresAt: expect.any(Date),
          requestedIp: '127.0.0.1',
        }),
      );
      expect(logAuthEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: user.id,
          eventType: 'PASSWORD_RESET_REQUEST',
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
        }),
      );
      expect(sendPasswordResetEmailMock).toHaveBeenCalledWith(
        user.persona?.correo,
        user.persona?.dni,
        expect.any(String),
      );
    });

    it('should throw BadRequestException if user exists but has an active parallel session', async () => {
      const user = buildUser();
      findUserByDniAndEmailMock.mockResolvedValue(user);
      hasActiveSessionMock.mockResolvedValue(true); // Active session exists!

      await expect(
        service.forgotPassword(forgotPasswordDto, {
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(createPasswordResetTokenMock).not.toHaveBeenCalled();
      expect(sendPasswordResetEmailMock).not.toHaveBeenCalled();
      expect(logAuthEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: user.id,
          eventType: 'PASSWORD_RESET_BLOCKED_ACTIVE_SESSION',
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
        }),
      );
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto = {
      token: 'some-valid-plain-token',
      newPassword: 'NewSecurePassword123!',
    };

    it('should throw BadRequestException if token is not found in DB', async () => {
      findResetTokenMock.mockResolvedValue(null);

      await expect(
        service.resetPassword(resetPasswordDto, {
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(logAuthEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'PASSWORD_RESET_FAILURE',
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
        }),
      );
    });

    it('should throw BadRequestException if token is already used', async () => {
      findResetTokenMock.mockResolvedValue({
        id: 'token-uuid',
        userId: 'user-uuid',
        isUsed: true,
        expiresAt: new Date(Date.now() + 60_000),
      });

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token has expired', async () => {
      findResetTokenMock.mockResolvedValue({
        id: 'token-uuid',
        userId: 'user-uuid',
        isUsed: false,
        expiresAt: new Date(Date.now() - 60_000),
      });

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(BadRequestException);
    });

    it('should update password and invalidate token on success', async () => {
      findResetTokenMock.mockResolvedValue({
        id: 'token-uuid',
        userId: 'user-uuid',
        isUsed: false,
        expiresAt: new Date(Date.now() + 60_000),
      });
      hashMock.mockResolvedValue('new_hashed_pwd');
      useResetTokenMock.mockResolvedValue(undefined);

      const result = await service.resetPassword(resetPasswordDto, {
        ipAddress: '127.0.0.1',
        userAgent: 'Jest',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('restablecida con éxito');
      expect(hashMock).toHaveBeenCalledWith(resetPasswordDto.newPassword, 10);
      expect(useResetTokenMock).toHaveBeenCalledWith('token-uuid', 'user-uuid', 'new_hashed_pwd');
      expect(logAuthEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-uuid',
          eventType: 'PASSWORD_RESET_SUCCESS',
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
        }),
      );
    });
  });

  describe('logout', () => {
    it('should invalidate session and return success', async () => {
      invalidateSessionMock.mockResolvedValue(undefined);

      const result = await service.logout('session-jti', 'user-uuid', {
        ipAddress: '127.0.0.1',
        userAgent: 'Jest',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('cerrada correctamente');
      expect(invalidateSessionMock).toHaveBeenCalledWith('session-jti', 'LOGOUT');
      expect(logAuthEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-uuid',
          eventType: 'LOGOUT',
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
        }),
      );
    });
  });
});
