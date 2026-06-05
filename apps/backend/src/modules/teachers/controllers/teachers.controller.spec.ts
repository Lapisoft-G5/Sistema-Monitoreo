import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { TeachersController } from './teachers.controller.js';
import { TeachersService } from '../services/teachers.service.js';
import { CreateDocenteDto } from '../dto/create-docente.dto.js';
import { UpdateDocenteDto } from '../dto/update-docente.dto.js';
import { AuthGuard } from '../../auth/guards/auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../../auth/repositories/auth.repository.js';
import { ConfigService } from '@nestjs/config';

describe('TeachersController', () => {
  let controller: TeachersController;
  let createDocenteMock: jest.Mock<(dto: any, user: any) => Promise<any>>;
  let getDocentesMock: jest.Mock<(user: any) => Promise<any>>;
  let updateDocenteMock: jest.Mock<(id: string, dto: any, user: any) => Promise<any>>;
  let bajaDocenteMock: jest.Mock<(id: string, user: any) => Promise<any>>;

  beforeEach(async () => {
    createDocenteMock = jest.fn();
    getDocentesMock = jest.fn();
    updateDocenteMock = jest.fn();
    bajaDocenteMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeachersController],
      providers: [
        {
          provide: TeachersService,
          useValue: {
            createDocente: createDocenteMock,
            getDocentes: getDocentesMock,
            updateDocente: updateDocenteMock,
            bajaDocente: bajaDocenteMock,
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

    controller = module.get<TeachersController>(TeachersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service createDocente with dto and current user', async () => {
      const dto = new CreateDocenteDto();
      dto.institucionId = 'inst-id';
      dto.cargoId = 'cargo-id';
      dto.dni = '11223344';
      dto.nombres = 'Carlos';
      dto.apellidos = 'Flores';
      dto.nivelEducativo = 'Primaria';

      const currentUser = { id: 'user-id', role: 'director_ugel' };
      const expectedResult = { id: 'docente-id', ...dto };
      createDocenteMock.mockResolvedValue(expectedResult);

      const result = await controller.create(dto, { user: currentUser });
      expect(result).toEqual(expectedResult);
      expect(createDocenteMock).toHaveBeenCalledWith(dto, currentUser);
    });
  });

  describe('findAll', () => {
    it('should call service getDocentes with current user', async () => {
      const currentUser = { id: 'user-id', role: 'director_ugel' };
      const expectedList = [{ id: 'docente-id', nombres: 'Carlos' }];
      getDocentesMock.mockResolvedValue(expectedList);

      const result = await controller.findAll({ user: currentUser });
      expect(result).toEqual(expectedList);
      expect(getDocentesMock).toHaveBeenCalledWith(currentUser);
    });
  });

  describe('update', () => {
    it('should call service updateDocente with id, dto and current user', async () => {
      const dto = new UpdateDocenteDto();
      dto.nombres = 'Carlos Modificado';
      dto.apellidos = 'Flores Modificado';
      dto.nivelEducativo = 'Primaria';
      dto.cargoId = 'cargo-id';

      const currentUser = { id: 'user-id', role: 'director_ugel' };
      const expectedResult = { id: 'docente-id', ...dto };
      updateDocenteMock.mockResolvedValue(expectedResult);

      const result = await controller.update('docente-id', dto, { user: currentUser });
      expect(result).toEqual(expectedResult);
      expect(updateDocenteMock).toHaveBeenCalledWith('docente-id', dto, currentUser);
    });
  });

  describe('deactivate', () => {
    it('should call service bajaDocente and return result', async () => {
      const currentUser = { id: 'user-id', role: 'director_ugel' };
      const expectedResult = { success: true, message: 'Docente dado de baja correctamente.' };
      bajaDocenteMock.mockResolvedValue(expectedResult);

      const result = await controller.deactivate('docente-id', { user: currentUser });
      expect(result).toEqual(expectedResult);
      expect(bajaDocenteMock).toHaveBeenCalledWith('docente-id', currentUser);
    });
  });
});
