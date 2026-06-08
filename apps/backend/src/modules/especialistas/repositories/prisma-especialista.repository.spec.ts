import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { ConflictException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { PrismaEspecialistaRepository } from './prisma-especialista.repository.js';

describe('PrismaEspecialistaRepository', () => {
  let repository: PrismaEspecialistaRepository;

  let especialistaFindManyMock: jest.Mock<any>;
  let especialistaFindUniqueMock: jest.Mock<any>;
  let especialistaCreateMock: jest.Mock<any>;
  let especialistaUpdateMock: jest.Mock<any>;
  let personaFindUniqueMock: jest.Mock<any>;
  let personaCreateMock: jest.Mock<any>;
  let personaUpdateMock: jest.Mock<any>;
  let userFindUniqueMock: jest.Mock<any>;
  let userCreateMock: jest.Mock<any>;
  let userUpdateMock: jest.Mock<any>;
  let userUpdateManyMock: jest.Mock<any>;
  let roleFindUniqueMock: jest.Mock<any>;
  let transactionMock: jest.Mock<any>;
  let queryRawMock: jest.Mock<any>;

  const mockPersona = {
    id: 'persona-uuid',
    dni: '12345678',
    nombres: 'Juan',
    apellidos: 'Pérez',
    correo: 'juan@test.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRole = {
    id: 'role-uuid',
    code: 'especialista_admin',
    name: 'Especialista Admin',
    description: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 'user-uuid',
    personaId: 'persona-uuid',
    roleId: 'role-uuid',
    passwordHash: 'hashed_password',
    isActive: true,
    isFirstLogin: true,
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: mockRole,
  };

  const mockEspecialista = {
    id: 'esp-uuid',
    personaId: 'persona-uuid',
    especialidad: 'Matemáticas',
    nivelEducativo: 'Secundaria',
    estado: 'Activo',
    createdAt: new Date(),
    updatedAt: new Date(),
    persona: mockPersona,
  };

  beforeEach(async () => {
    especialistaFindManyMock = jest.fn();
    especialistaFindUniqueMock = jest.fn();
    especialistaCreateMock = jest.fn();
    especialistaUpdateMock = jest.fn();
    personaFindUniqueMock = jest.fn();
    personaCreateMock = jest.fn();
    personaUpdateMock = jest.fn();
    userFindUniqueMock = jest.fn();
    userCreateMock = jest.fn();
    userUpdateMock = jest.fn();
    userUpdateManyMock = jest.fn();
    roleFindUniqueMock = jest.fn();
    transactionMock = jest.fn();
    queryRawMock = jest.fn();

    const txMock = {
      persona: { create: personaCreateMock, update: personaUpdateMock },
      user: {
        create: userCreateMock,
        update: userUpdateMock,
        findUnique: userFindUniqueMock,
        updateMany: userUpdateManyMock,
      },
      role: { findUnique: roleFindUniqueMock },
      especialista: { create: especialistaCreateMock, update: especialistaUpdateMock },
    };

    transactionMock.mockImplementation((fn: any) => fn(txMock));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaEspecialistaRepository,
        {
          provide: PrismaService,
          useValue: {
            especialista: {
              findMany: especialistaFindManyMock,
              findUnique: especialistaFindUniqueMock,
            },
            persona: {
              findUnique: personaFindUniqueMock,
            },
            user: {
              findUnique: userFindUniqueMock,
            },
            $transaction: transactionMock,
            $queryRaw: queryRawMock,
          },
        },
      ],
    }).compile();

    repository = module.get<PrismaEspecialistaRepository>(PrismaEspecialistaRepository);
  });

  describe('findAll', () => {
    it('should return list of especialistas with user and role data', async () => {
      especialistaFindManyMock.mockResolvedValue([mockEspecialista]);
      userFindUniqueMock.mockResolvedValue(mockUser);

      const result = await repository.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('esp-uuid');
      expect(result[0].user?.role.code).toBe('especialista_admin');
      expect(especialistaFindManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ estado: 'Activo' }),
          include: { persona: true },
        }),
      );
    });

    it('should apply provided filters to the query', async () => {
      especialistaFindManyMock.mockResolvedValue([]);

      const result = await repository.findAll({ estado: 'Inactivo', especialidad: 'Ciencias' });
      expect(result).toHaveLength(0);
      expect(especialistaFindManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ estado: 'Inactivo', especialidad: 'Ciencias' }),
        }),
      );
    });

    it('should include user as undefined when no user is found for an especialista', async () => {
      especialistaFindManyMock.mockResolvedValue([mockEspecialista]);
      userFindUniqueMock.mockResolvedValue(null);

      const result = await repository.findAll();
      expect(result[0].user).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should return especialista with user data when found', async () => {
      especialistaFindUniqueMock.mockResolvedValue(mockEspecialista);
      userFindUniqueMock.mockResolvedValue(mockUser);

      const result = await repository.findById('esp-uuid');
      expect(result).toBeDefined();
      expect(result?.id).toBe('esp-uuid');
      expect(result?.user?.id).toBe('user-uuid');
      expect(especialistaFindUniqueMock).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'esp-uuid' } }),
      );
    });

    it('should return null when especialista is not found', async () => {
      especialistaFindUniqueMock.mockResolvedValue(null);

      const result = await repository.findById('nonexistent-uuid');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createData = {
      dni: '12345678',
      nombres: 'Juan',
      apellidos: 'Pérez',
      correo: 'juan@test.com',
      especialidad: 'Matemáticas',
      nivelEducativo: 'Secundaria',
      rolCode: 'especialista_admin',
    };

    it('should throw ConflictException if persona with same DNI already exists', async () => {
      personaFindUniqueMock.mockResolvedValue(mockPersona);

      await expect(repository.create(createData, 'hashed_pwd')).rejects.toThrow(ConflictException);
      expect(transactionMock).not.toHaveBeenCalled();
    });

    it('should create persona, user and especialista in transaction when DNI is unique', async () => {
      personaFindUniqueMock.mockResolvedValue(null);
      personaCreateMock.mockResolvedValue(mockPersona);
      roleFindUniqueMock.mockResolvedValue(mockRole);
      userCreateMock.mockResolvedValue(mockUser);
      especialistaCreateMock.mockResolvedValue(mockEspecialista);

      const result = await repository.create(createData, 'hashed_pwd');
      expect(result).toBeDefined();
      expect(result.id).toBe('esp-uuid');
      expect(result.user?.role.code).toBe('especialista_admin');
      expect(personaCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ dni: '12345678' }),
        }),
      );
      expect(userCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordHash: 'hashed_pwd',
            isFirstLogin: true,
            isActive: true,
          }),
        }),
      );
      expect(especialistaCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            especialidad: 'Matemáticas',
            nivelEducativo: 'Secundaria',
            estado: 'Activo',
          }),
        }),
      );
    });

    it('should throw NotFoundException inside transaction when rolCode does not exist', async () => {
      personaFindUniqueMock.mockResolvedValue(null);
      personaCreateMock.mockResolvedValue(mockPersona);
      roleFindUniqueMock.mockResolvedValue(null);

      await expect(repository.create(createData, 'hashed_pwd')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateData = {
      nombres: 'Carlos',
      apellidos: 'Quispe',
      especialidad: 'Ciencias',
      nivelEducativo: 'Primaria',
      estado: 'Activo',
      rolCode: 'director_ugel',
    };

    it('should throw NotFoundException when especialista does not exist', async () => {
      especialistaFindUniqueMock.mockResolvedValue(null);

      await expect(repository.update('nonexistent-uuid', updateData)).rejects.toThrow(
        NotFoundException,
      );
      expect(transactionMock).not.toHaveBeenCalled();
    });

    it('should update persona, user role and especialista in transaction', async () => {
      especialistaFindUniqueMock.mockResolvedValue(mockEspecialista);
      const updatedEspecialista = {
        ...mockEspecialista,
        especialidad: 'Ciencias',
        nivelEducativo: 'Primaria',
      };
      const updatedRole = { ...mockRole, code: 'director_ugel', name: 'Director UGEL' };
      personaUpdateMock.mockResolvedValue(undefined);
      roleFindUniqueMock.mockResolvedValue(updatedRole);
      userUpdateMock.mockResolvedValue(undefined);
      especialistaUpdateMock.mockResolvedValue(updatedEspecialista);
      userFindUniqueMock.mockResolvedValue({ ...mockUser, role: updatedRole });

      const result = await repository.update('esp-uuid', updateData);
      expect(result).toBeDefined();
      expect(result.especialidad).toBe('Ciencias');
      expect(especialistaUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'esp-uuid' },
          data: expect.objectContaining({
            especialidad: 'Ciencias',
            nivelEducativo: 'Primaria',
            estado: 'Activo',
          }),
        }),
      );
      expect(personaUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'persona-uuid' },
          data: expect.objectContaining({
            nombres: 'Carlos',
            apellidos: 'Quispe',
          }),
        }),
      );
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException when especialista does not exist', async () => {
      especialistaFindUniqueMock.mockResolvedValue(null);

      await expect(repository.delete('nonexistent-uuid')).rejects.toThrow(NotFoundException);
      expect(queryRawMock).not.toHaveBeenCalled();
      expect(transactionMock).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException when especialista has visitas de monitoreo', async () => {
      especialistaFindUniqueMock.mockResolvedValue(mockEspecialista);
      queryRawMock.mockResolvedValue([{ count: 3n }]);

      await expect(repository.delete('esp-uuid')).rejects.toThrow(UnprocessableEntityException);
      expect(transactionMock).not.toHaveBeenCalled();
    });

    it('should inactivate user and especialista in transaction when no visitas exist', async () => {
      especialistaFindUniqueMock.mockResolvedValue(mockEspecialista);
      queryRawMock.mockResolvedValue([{ count: 0n }]);
      const inactiveEspecialista = { ...mockEspecialista, estado: 'Inactivo' };
      userUpdateManyMock.mockResolvedValue(undefined);
      especialistaUpdateMock.mockResolvedValue(inactiveEspecialista);
      userFindUniqueMock.mockResolvedValue({ ...mockUser, isActive: false, role: mockRole });

      const result = await repository.delete('esp-uuid');
      expect(result).toBeDefined();
      expect(result.estado).toBe('Inactivo');
      expect(userUpdateManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { personaId: 'persona-uuid' },
          data: { isActive: false },
        }),
      );
      expect(especialistaUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'esp-uuid' },
          data: { estado: 'Inactivo' },
        }),
      );
    });
  });
});
