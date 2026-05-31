import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { PrismaAuthRepository } from './prisma-auth.repository.js';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';

type MockPrismaUser = {
  id: string;
  email: string;
  role: {
    code: string;
  };
};

describe('PrismaAuthRepository', () => {
  let repository: PrismaAuthRepository;

  let findUniqueMock: jest.Mock<
    (args: unknown) => Promise<MockPrismaUser | null>
  >;

  beforeEach(async () => {
    findUniqueMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaAuthRepository,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: findUniqueMock,
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

  describe('findUserByEmail', () => {
    it('should return a user if found', async () => {
      const mockPrismaUser: MockPrismaUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: {
          code: 'ADMIN',
        },
      };

      findUniqueMock.mockResolvedValue(mockPrismaUser);

      const result = await repository.findUserByEmail('test@example.com');

      expect(result).toBeDefined();
      expect(result?.id).toBe('123e4567-e89b-12d3-a456-426614174000');

      expect(findUniqueMock).toHaveBeenCalledWith({
        where: {
          email: 'test@example.com',
        },
        include: {
          role: true,
        },
      });
    });

    it('should return null if user is not found', async () => {
      findUniqueMock.mockResolvedValue(null);

      const result = await repository.findUserByEmail(
        'notfound@example.com',
      );

      expect(result).toBeNull();

      expect(findUniqueMock).toHaveBeenCalledWith({
        where: {
          email: 'notfound@example.com',
        },
        include: {
          role: true,
        },
      });
    });
  });
});