import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { EspecialistaRepository } from '../repositories/especialista.repository.js';
import { CreateEspecialistaDto } from '../dto/create-especialista.dto.js';
import { UpdateEspecialistaDto } from '../dto/update-especialista.dto.js';
import { QueryEspecialistaDto } from '../dto/query-especialista.dto.js';
import type { IEspecialistaResponse } from '@sistema-monitoreo/shared-contracts';

const hashMock = jest.fn() as jest.MockedFunction<
  (password: string, salt: number | string) => Promise<string>
>;

jest.unstable_mockModule('bcrypt', () => ({
  hash: hashMock,
}));

const { EspecialistaService } = await import('./especialista.service.js');

function buildEspecialistaResponse(
  overrides: Partial<Record<string, unknown>> = {},
): IEspecialistaResponse {
  return {
    id: 'esp-uuid',
    personaId: 'persona-uuid',
    especialidad: 'Matemáticas',
    nivelEducativo: 'Secundaria',
    estado: 'Activo',
    createdAt: new Date(),
    updatedAt: new Date(),
    persona: {
      id: 'persona-uuid',
      dni: '12345678',
      nombres: 'Juan',
      apellidos: 'Pérez',
      correo: 'juan@test.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    user: {
      id: 'user-uuid',
      role: {
        code: 'especialista_admin',
        name: 'Especialista Admin',
      },
    },
    ...overrides,
  } as unknown as IEspecialistaResponse;
}

describe('EspecialistaService', () => {
  let service: InstanceType<typeof EspecialistaService>;
  let findAllMock: jest.Mock<any>;
  let findByIdMock: jest.Mock<any>;
  let createMock: jest.Mock<any>;
  let updateMock: jest.Mock<any>;
  let deleteMock: jest.Mock<any>;

  beforeEach(async () => {
    findAllMock = jest.fn();
    findByIdMock = jest.fn();
    createMock = jest.fn();
    updateMock = jest.fn();
    deleteMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EspecialistaService,
        {
          provide: EspecialistaRepository,
          useValue: {
            findAll: findAllMock,
            findById: findByIdMock,
            create: createMock,
            update: updateMock,
            delete: deleteMock,
          },
        },
      ],
    }).compile();

    service = module.get(EspecialistaService);
  });

  beforeEach(() => {
    hashMock.mockReset();
    findAllMock.mockReset();
    findByIdMock.mockReset();
    createMock.mockReset();
    updateMock.mockReset();
    deleteMock.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all especialistas when called without filters', async () => {
      const mockList = [buildEspecialistaResponse()];
      findAllMock.mockResolvedValue(mockList);

      const result = await service.findAll();
      expect(result).toEqual(mockList);
      expect(findAllMock).toHaveBeenCalledWith(undefined);
    });

    it('should pass filters to repository', async () => {
      const filters = Object.assign(new QueryEspecialistaDto(), {
        estado: 'Activo',
        especialidad: 'Matemáticas',
      });
      const mockList = [buildEspecialistaResponse()];
      findAllMock.mockResolvedValue(mockList);

      const result = await service.findAll(filters);
      expect(result).toEqual(mockList);
      expect(findAllMock).toHaveBeenCalledWith(filters);
    });
  });

  describe('findById', () => {
    it('should return especialista when found', async () => {
      const esp = buildEspecialistaResponse();
      findByIdMock.mockResolvedValue(esp);

      const result = await service.findById('esp-uuid');
      expect(result).toEqual(esp);
      expect(findByIdMock).toHaveBeenCalledWith('esp-uuid');
    });

    it('should return null when not found', async () => {
      findByIdMock.mockResolvedValue(null);

      const result = await service.findById('nonexistent-uuid');
      expect(result).toBeNull();
      expect(findByIdMock).toHaveBeenCalledWith('nonexistent-uuid');
    });
  });

  describe('create', () => {
    const dto = Object.assign(new CreateEspecialistaDto(), {
      dni: '12345678',
      nombres: 'Juan',
      apellidos: 'Pérez',
      correo: 'juan@test.com',
      especialidad: 'Matemáticas',
      nivelEducativo: 'Secundaria',
      rolCode: 'especialista_admin',
    });

    it('should hash the DNI with 12 salt rounds as the initial password and delegate to repository', async () => {
      const esp = buildEspecialistaResponse();
      hashMock.mockResolvedValue('hashed_12345678');
      createMock.mockResolvedValue(esp);

      const result = await service.create(dto);
      expect(result).toEqual(esp);
      expect(hashMock).toHaveBeenCalledWith('12345678', 12);
      expect(createMock).toHaveBeenCalledWith(dto, 'hashed_12345678');
    });
  });

  describe('update', () => {
    const dto = Object.assign(new UpdateEspecialistaDto(), {
      nombres: 'Carlos',
      apellidos: 'Quispe',
      especialidad: 'Ciencias Naturales',
      nivelEducativo: 'Primaria',
      estado: 'Activo',
      rolCode: 'director_ugel',
    });

    it('should delegate update to repository with id and dto', async () => {
      const esp = buildEspecialistaResponse({ especialidad: 'Ciencias Naturales' });
      updateMock.mockResolvedValue(esp);

      const result = await service.update('esp-uuid', dto);
      expect(result).toEqual(esp);
      expect(updateMock).toHaveBeenCalledWith('esp-uuid', dto);
    });
  });

  describe('delete', () => {
    it('should delegate delete to repository and return the inactivated especialista', async () => {
      const esp = buildEspecialistaResponse({ estado: 'Inactivo' });
      deleteMock.mockResolvedValue(esp);

      const result = await service.delete('esp-uuid');
      expect(result).toEqual(esp);
      expect(deleteMock).toHaveBeenCalledWith('esp-uuid');
    });
  });
});
