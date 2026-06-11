import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { EspecialistaController, AuthenticatedRequest } from './especialista.controller.js';
import { EspecialistaService } from '../services/especialista.service.js';
import { CreateEspecialistaDto } from '../dto/create-especialista.dto.js';
import { UpdateEspecialistaDto } from '../dto/update-especialista.dto.js';
import { QueryEspecialistaDto } from '../dto/query-especialista.dto.js';
import { AuthGuard } from '../../auth/guards/auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import type { IEspecialistaResponse } from '@sistema-monitoreo/shared-contracts';

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

describe('EspecialistaController', () => {
  let controller: EspecialistaController;
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
      controllers: [EspecialistaController],
      providers: [
        {
          provide: EspecialistaService,
          useValue: {
            findAll: findAllMock,
            findById: findByIdMock,
            create: createMock,
            update: updateMock,
            delete: deleteMock,
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EspecialistaController>(EspecialistaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service findAll and return list', async () => {
      const query = new QueryEspecialistaDto();
      const mockList = [buildEspecialistaResponse()];
      findAllMock.mockResolvedValue(mockList);

      const result = await controller.findAll(query);
      expect(result).toEqual(mockList);
      expect(findAllMock).toHaveBeenCalledWith(query);
    });
  });

  describe('findById', () => {
    it('should call service findById and return especialista', async () => {
      const esp = buildEspecialistaResponse();
      findByIdMock.mockResolvedValue(esp);

      const result = await controller.findById('esp-uuid');
      expect(result).toEqual(esp);
      expect(findByIdMock).toHaveBeenCalledWith('esp-uuid');
    });

    it('should return null when especialista is not found', async () => {
      findByIdMock.mockResolvedValue(null);

      const result = await controller.findById('nonexistent-uuid');
      expect(result).toBeNull();
      expect(findByIdMock).toHaveBeenCalledWith('nonexistent-uuid');
    });
  });

  describe('create', () => {
    it('should call service create and return new especialista', async () => {
      const dto = Object.assign(new CreateEspecialistaDto(), {
        dni: '12345678',
        nombres: 'Juan',
        apellidos: 'Pérez',
        especialidad: 'Matemáticas',
        nivelEducativo: 'Secundaria',
        rolCode: 'especialista_admin',
      });
      const esp = buildEspecialistaResponse();
      createMock.mockResolvedValue(esp);

      const mockReq = {
        user: {
          sub: 'user-id',
          role: 'coordinador_pedagogico',
          permissions: ['especialistas:write'],
          dni: '12345678',
          nombres: 'Test',
          apellidos: 'User',
          firstLogin: false,
        },
      } as unknown as AuthenticatedRequest;
      const result = await controller.create(dto, mockReq);
      expect(result).toEqual(esp);
      expect(createMock).toHaveBeenCalledWith(dto, mockReq.user);
    });
  });

  describe('update', () => {
    it('should call service update and return updated especialista', async () => {
      const dto = Object.assign(new UpdateEspecialistaDto(), {
        nombres: 'Carlos',
        apellidos: 'Quispe',
        especialidad: 'Ciencias',
        nivelEducativo: 'Primaria',
        estado: 'Activo',
        rolCode: 'director_ugel',
      });
      const esp = buildEspecialistaResponse({ especialidad: 'Ciencias' });
      updateMock.mockResolvedValue(esp);

      const mockReq = {
        user: {
          sub: 'user-id',
          role: 'coordinador_pedagogico',
          permissions: ['especialistas:write'],
          dni: '12345678',
          nombres: 'Test',
          apellidos: 'User',
          firstLogin: false,
        },
      } as unknown as AuthenticatedRequest;
      const result = await controller.update('esp-uuid', dto, mockReq);
      expect(result).toEqual(esp);
      expect(updateMock).toHaveBeenCalledWith('esp-uuid', dto, mockReq.user);
    });
  });

  describe('delete', () => {
    it('should call service delete and return inactivated especialista', async () => {
      const esp = buildEspecialistaResponse({ estado: 'Inactivo' });
      deleteMock.mockResolvedValue(esp);

      const result = await controller.delete('esp-uuid');
      expect(result).toEqual(esp);
      expect(deleteMock).toHaveBeenCalledWith('esp-uuid');
    });
  });
});
