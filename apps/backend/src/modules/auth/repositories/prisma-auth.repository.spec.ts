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
  let updateMock: jest.Mock<(args: unknown) => Promise<unknown>>;

  beforeEach(async () => {
    findUniqueMock = jest.fn();
    updateMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaAuthRepository,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: findUniqueMock,
              update: updateMock,
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

      findUniqueMock.mockResolvedValue(mockPrismaUser);

      const result = await repository.findUserByDni('76358911');

      expect(result).toBeDefined();
      expect(result?.id).toBe('123e4567-e89b-12d3-a456-426614174000');

      expect(findUniqueMock).toHaveBeenCalledWith({
        where: {
          dni: '76358911',
        },
        include: {
          role: true,
        },
      });
    });

    it('should return null if user is not found', async () => {
      findUniqueMock.mockResolvedValue(null);

      const result = await repository.findUserByDni('00000000');

      expect(result).toBeNull();

      expect(findUniqueMock).toHaveBeenCalledWith({
        where: {
          dni: '00000000',
        },
        include: {
          role: true,
        },
      });
    });
  });

  describe('updatePassword', () => {
    it('should update user password and firstLogin status', async () => {
      updateMock.mockResolvedValue({});

      await repository.updatePassword('user-uuid', 'hashed_pwd');

      expect(updateMock).toHaveBeenCalledWith({
        where: { id: 'user-uuid' },
        data: {
          passwordHash: 'hashed_pwd',
          isFirstLogin: false,
          passwordChangedAt: expect.any(Date),
        },
      });
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
        include: { role: true },
      });
    });

    it('should return null if user not found by ID', async () => {
      findUniqueMock.mockResolvedValue(null);

      const result = await repository.findUserById('nonexistent-uuid');

      expect(result).toBeNull();
    });
  });
});
