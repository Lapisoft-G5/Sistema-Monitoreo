import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { PrismaAuthRepository } from './prisma-auth.repository.js';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';

type MockPrismaUser = {
  id: string;
  dni: string;
  role: {
    code: string;
  };
};

describe('PrismaAuthRepository', () => {
  let repository: PrismaAuthRepository;

  let findUniqueMock: jest.Mock<(args: unknown) => Promise<MockPrismaUser | null>>;
  let findFirstMock: jest.Mock<(args: unknown) => Promise<MockPrismaUser | null>>;
  let updateMock: jest.Mock<(args: unknown) => Promise<unknown>>;
  let createTokenMock: jest.Mock<(args: unknown) => Promise<unknown>>;
  let findUniqueTokenMock: jest.Mock<(args: unknown) => Promise<unknown>>;
  let updateTokenMock: jest.Mock<(args: unknown) => Promise<unknown>>;
  let transactionMock: jest.Mock<(args: unknown) => Promise<unknown>>;
  let createSessionMock: jest.Mock<(args: unknown) => Promise<unknown>>;
  let updateManySessionMock: jest.Mock<(args: unknown) => Promise<unknown>>;
  let findUniqueSessionMock: jest.Mock<(args: unknown) => Promise<unknown>>;
  let findFirstSessionMock: jest.Mock<(args: unknown) => Promise<unknown>>;
  let logAuthEventMock: jest.Mock<(args: unknown) => Promise<unknown>>;

  beforeEach(async () => {
    findUniqueMock = jest.fn();
    findFirstMock = jest.fn();
    updateMock = jest.fn();
    createTokenMock = jest.fn();
    findUniqueTokenMock = jest.fn();
    updateTokenMock = jest.fn();
    transactionMock = jest.fn();
    createSessionMock = jest.fn();
    updateManySessionMock = jest.fn();
    findUniqueSessionMock = jest.fn();
    findFirstSessionMock = jest.fn();
    logAuthEventMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaAuthRepository,
        {
          provide: PrismaService,
          useValue: {
            $transaction: transactionMock,
            user: {
              findUnique: findUniqueMock,
              findFirst: findFirstMock,
              update: updateMock,
            },
            passwordResetToken: {
              create: createTokenMock,
              findUnique: findUniqueTokenMock,
              update: updateTokenMock,
            },
            authSession: {
              create: createSessionMock,
              updateMany: updateManySessionMock,
              findUnique: findUniqueSessionMock,
              findFirst: findFirstSessionMock,
            },
            authAuditLog: {
              create: logAuthEventMock,
            },
          },
        },
      ],
    }).compile();

    repository = module.get<PrismaAuthRepository>(PrismaAuthRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findUserByDni', () => {
    it('should return a user if found', async () => {
      const mockPrismaUser: MockPrismaUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        dni: '76358911',
        role: {
          code: 'ADMIN',
        },
      };

      findFirstMock.mockResolvedValue(mockPrismaUser);

      const result = await repository.findUserByDni('76358911');

      expect(result).toBeDefined();
      expect(result?.id).toBe('123e4567-e89b-12d3-a456-426614174000');

      expect(findFirstMock).toHaveBeenCalledWith({
        where: {
          persona: {
            dni: '76358911',
          },
        },
        include: {
          role: true,
          persona: true,
        },
      });
    });

    it('should return null if user is not found', async () => {
      findFirstMock.mockResolvedValue(null);

      const result = await repository.findUserByDni('00000000');

      expect(result).toBeNull();

      expect(findFirstMock).toHaveBeenCalledWith({
        where: {
          persona: {
            dni: '00000000',
          },
        },
        include: {
          role: true,
          persona: true,
        },
      });
    });
  });

  describe('updatePassword', () => {
    it('should update user password and firstLogin status in transaction', async () => {
      transactionMock.mockImplementation(async (actions) => actions);

      await repository.updatePassword('user-uuid', 'hashed_pwd');

      expect(transactionMock).toHaveBeenCalled();
    });
  });

  describe('findUserById', () => {
    it('should return a user if found by ID', async () => {
      const mockPrismaUser: MockPrismaUser = {
        id: 'user-uuid',
        dni: '76358911',
        role: {
          code: 'ADMIN',
        },
      };

      findUniqueMock.mockResolvedValue(mockPrismaUser);

      const result = await repository.findUserById('user-uuid');

      expect(result).toBeDefined();
      expect(result?.id).toBe('user-uuid');
      expect(findUniqueMock).toHaveBeenCalledWith({
        where: { id: 'user-uuid' },
        include: {
          role: true,
          persona: true,
        },
      });
    });

    it('should return null if user not found by ID', async () => {
      findUniqueMock.mockResolvedValue(null);

      const result = await repository.findUserById('nonexistent-uuid');

      expect(result).toBeNull();
    });
  });

  describe('findUserByDniAndEmail', () => {
    it('should return a user if found by DNI and Email', async () => {
      const mockPrismaUser: MockPrismaUser = {
        id: 'user-uuid',
        dni: '76358911',
        role: { code: 'ADMIN' },
      };
      findFirstMock.mockResolvedValue(mockPrismaUser);

      const result = await repository.findUserByDniAndEmail('76358911', 'carlos.quispe@ugel-lampa.gob.pe');

      expect(result).toBeDefined();
      expect(result?.id).toBe('user-uuid');
      expect(findFirstMock).toHaveBeenCalledWith({
        where: {
          persona: {
            dni: '76358911',
            correo: 'carlos.quispe@ugel-lampa.gob.pe',
          },
        },
        include: {
          role: true,
          persona: true,
        },
      });
    });

    it('should return null if user not found by DNI and Email', async () => {
      findFirstMock.mockResolvedValue(null);

      const result = await repository.findUserByDniAndEmail('00000000', 'notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('createPasswordResetToken', () => {
    it('should insert password reset token into DB', async () => {
      createTokenMock.mockResolvedValue({});
      const expiresAt = new Date();

      await repository.createPasswordResetToken({
        userId: 'user-uuid',
        tokenHash: 'hashed_token',
        expiresAt,
        requestedIp: '127.0.0.1',
      });

      expect(createTokenMock).toHaveBeenCalledWith({
        data: {
          userId: 'user-uuid',
          tokenHash: 'hashed_token',
          expiresAt,
          requestedIp: '127.0.0.1',
          isUsed: false,
        },
      });
    });
  });

  describe('findResetToken', () => {
    it('should return a token if found', async () => {
      const mockToken = {
        id: 'token-uuid',
        userId: 'user-uuid',
        tokenHash: 'hashed_token',
        expiresAt: new Date(),
        isUsed: false,
        user: { id: 'user-uuid', dni: '76358911' },
      };
      findUniqueTokenMock.mockResolvedValue(mockToken);

      const result = await repository.findResetToken('hashed_token');

      expect(result).toBeDefined();
      expect(result?.id).toBe('token-uuid');
      expect(findUniqueTokenMock).toHaveBeenCalledWith({
        where: { tokenHash: 'hashed_token' },
        include: {
          user: {
            include: {
              persona: true,
            },
          },
        },
      });
    });

    it('should return null if token is not found', async () => {
      findUniqueTokenMock.mockResolvedValue(null);

      const result = await repository.findResetToken('nonexistent_token');

      expect(result).toBeNull();
    });
  });

  describe('useResetToken', () => {
    it('should run transaction to update user password and mark token as used', async () => {
      transactionMock.mockImplementation(async (actions) => actions);

      await repository.useResetToken('token-uuid', 'user-uuid', 'new_pwd_hash');

      expect(transactionMock).toHaveBeenCalled();
    });
  });

  describe('createSession', () => {
    it('should insert session into DB', async () => {
      const expiresAt = new Date();
      createSessionMock.mockResolvedValue({ id: 'session-uuid' });

      const result = await repository.createSession({
        userId: 'user-uuid',
        sessionJti: 'session-jti',
        ipAddress: '127.0.0.1',
        userAgent: 'Jest',
        expiresAt,
      });

      expect(result).toBeDefined();
      expect(createSessionMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-uuid',
          sessionJti: 'session-jti',
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
          expiresAt,
          isActive: true,
        }),
      });
    });
  });

  describe('invalidateSession', () => {
    it('should update session and set isActive to false and terminatedReason', async () => {
      updateManySessionMock.mockResolvedValue({});

      await repository.invalidateSession('session-jti', 'LOGOUT');

      expect(updateManySessionMock).toHaveBeenCalledWith({
        where: { sessionJti: 'session-jti' },
        data: expect.objectContaining({
          isActive: false,
          terminatedReason: 'LOGOUT',
          loggedOutAt: expect.any(Date),
        }),
      });
    });
  });

  describe('isSessionActive', () => {
    it('should return true if session is active', async () => {
      findUniqueSessionMock.mockResolvedValue({ isActive: true });

      const result = await repository.isSessionActive('session-jti');

      expect(result).toBe(true);
      expect(findUniqueSessionMock).toHaveBeenCalledWith({
        where: { sessionJti: 'session-jti' },
        select: { isActive: true },
      });
    });

    it('should return false if session is inactive or not found', async () => {
      findUniqueSessionMock.mockResolvedValue(null);

      const result = await repository.isSessionActive('session-jti');

      expect(result).toBe(false);
    });
  });

  describe('hasActiveSession', () => {
    it('should return true if active session exists', async () => {
      findFirstSessionMock.mockResolvedValue({ id: 'session-uuid' });

      const result = await repository.hasActiveSession('user-uuid');

      expect(result).toBe(true);
      expect(findFirstSessionMock).toHaveBeenCalledWith({
        where: {
          userId: 'user-uuid',
          isActive: true,
          expiresAt: { gt: expect.any(Date) },
        },
        select: { id: true },
      });
    });

    it('should return false if no active session exists', async () => {
      findFirstSessionMock.mockResolvedValue(null);

      const result = await repository.hasActiveSession('user-uuid');

      expect(result).toBe(false);
    });
  });

  describe('logAuthEvent', () => {
    it('should insert audit log record in DB', async () => {
      logAuthEventMock.mockResolvedValue({});

      await repository.logAuthEvent({
        userId: 'user-uuid',
        eventType: 'LOGIN_SUCCESS',
        eventDetail: 'Login correct',
        ipAddress: '127.0.0.1',
        userAgent: 'Jest',
      });

      expect(logAuthEventMock).toHaveBeenCalledWith({
        data: {
          userId: 'user-uuid',
          eventType: 'LOGIN_SUCCESS',
          eventDetail: 'Login correct',
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
        },
      });
    });

    it('should handle optional and null parameters', async () => {
      logAuthEventMock.mockResolvedValue({});

      await repository.logAuthEvent({
        eventType: 'LOGIN_FAILURE',
      });

      expect(logAuthEventMock).toHaveBeenCalledWith({
        data: {
          userId: null,
          eventType: 'LOGIN_FAILURE',
          eventDetail: null,
          ipAddress: null,
          userAgent: null,
        },
      });
    });
  });
});
