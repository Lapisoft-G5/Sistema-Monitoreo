import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { InstitutionsController } from './institutions.controller.js';
import { InstitutionsService } from '../services/institutions.service.js';
import { CreateInstitucionDto } from '../dto/create-institucion.dto.js';
import { UpdateInstitucionDto } from '../dto/update-institucion.dto.js';
import { QueryInstitucionDto } from '../dto/query-institucion.dto.js';
import { Institucion } from '../entities/institucion.entity.js';
import { AuthGuard } from '../../auth/guards/auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../../auth/repositories/auth.repository.js';
import { ConfigService } from '@nestjs/config';

describe('InstitutionsController', () => {
  let controller: InstitutionsController;
  let createServiceMock: jest.Mock<(dto: any) => Promise<Institucion>>;
  let updateServiceMock: jest.Mock<(id: string, dto: any) => Promise<Institucion>>;
  let softDeleteServiceMock: jest.Mock<(id: string) => Promise<Institucion>>;
  let restoreServiceMock: jest.Mock<(id: string) => Promise<Institucion>>;
  let findAllServiceMock: jest.Mock<(query: any) => Promise<any>>;

  beforeEach(async () => {
    createServiceMock = jest.fn();
    updateServiceMock = jest.fn();
    softDeleteServiceMock = jest.fn();
    restoreServiceMock = jest.fn();
    findAllServiceMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstitutionsController],
      providers: [
        {
          provide: InstitutionsService,
          useValue: {
            create: createServiceMock,
            update: updateServiceMock,
            softDelete: softDeleteServiceMock,
            restore: restoreServiceMock,
            findAll: findAllServiceMock,
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: AuthRepository,
          useValue: {
            isSessionActive: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: AuthGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: RolesGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<InstitutionsController>(InstitutionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service create and return result', async () => {
      const dto = new CreateInstitucionDto();
      dto.codigoModular = '1234567';
      dto.nombre = 'Test IE';

      const mockResult = { id: 'ie-uuid', ...dto } as unknown as Institucion;
      createServiceMock.mockResolvedValue(mockResult);

      const result = await controller.create(dto);
      expect(result).toBeDefined();
      expect(result.id).toBe('ie-uuid');
      expect(createServiceMock).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call service findAll and return result', async () => {
      const query = new QueryInstitucionDto();
      query.nombre = 'Test IE';

      const mockResult = {
        data: [{ id: 'ie-uuid', nombre: 'Test IE' } as Institucion],
        total: 1,
        limit: 10,
        offset: 0,
      };
      findAllServiceMock.mockResolvedValue(mockResult);

      const result = await controller.findAll(query);
      expect(result).toBeDefined();
      expect(result.data.length).toBe(1);
      expect(findAllServiceMock).toHaveBeenCalledWith(query);
    });
  });

  describe('update', () => {
    it('should call service update and return result', async () => {
      const dto = new UpdateInstitucionDto();
      dto.nombre = 'Updated Name';

      const mockResult = { id: 'ie-uuid', nombre: 'Updated Name' } as unknown as Institucion;
      updateServiceMock.mockResolvedValue(mockResult);

      const result = await controller.update('ie-uuid', dto);
      expect(result).toBeDefined();
      expect(result.nombre).toBe('Updated Name');
      expect(updateServiceMock).toHaveBeenCalledWith('ie-uuid', dto);
    });
  });

  describe('softDelete', () => {
    it('should call service softDelete and return success response', async () => {
      softDeleteServiceMock.mockResolvedValue({ id: 'ie-uuid', estado: 'Inactiva' } as Institucion);

      const result = await controller.softDelete('ie-uuid');
      expect(result).toEqual({
        success: true,
        message: 'Institución dada de baja correctamente',
      });
      expect(softDeleteServiceMock).toHaveBeenCalledWith('ie-uuid');
    });
  });

  describe('restore', () => {
    it('should call service restore and return success response', async () => {
      restoreServiceMock.mockResolvedValue({ id: 'ie-uuid', estado: 'Activa' } as Institucion);

      const result = await controller.restore('ie-uuid');
      expect(result).toEqual({
        success: true,
        message: 'Institución educativa reactivada correctamente',
      });
      expect(restoreServiceMock).toHaveBeenCalledWith('ie-uuid');
    });
  });
});
