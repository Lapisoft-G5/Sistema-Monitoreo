import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { TeachersService } from './teachers.service.js';
import { TeachersRepository } from '../repositories/teachers.repository.js';
import { CreateDocenteDto } from '../dto/create-docente.dto.js';
import { UpdateDocenteDto } from '../dto/update-docente.dto.js';
import { RoleCode } from '../../../common/enums/role.enum.js';

describe('TeachersService', () => {
  let service: TeachersService;

  // Mocks del repositorio
  let findInstitucionByIdMock: jest.Mock<any>;
  let findCargoByIdMock: jest.Mock<any>;
  let findDocenteByIdMock: jest.Mock<any>;
  let findDocentesMock: jest.Mock<any>;
  let findPersonaByEmailNotIdMock: jest.Mock<any>;
  let updateDocenteEstadoMock: jest.Mock<any>;
  let createDocenteWithTransactionMock: jest.Mock<any>;
  let updateDocenteWithTransactionMock: jest.Mock<any>;

  beforeEach(async () => {
    findInstitucionByIdMock = jest.fn();
    findCargoByIdMock = jest.fn();
    findDocenteByIdMock = jest.fn();
    findDocentesMock = jest.fn();
    findPersonaByEmailNotIdMock = jest.fn();
    updateDocenteEstadoMock = jest.fn();
    createDocenteWithTransactionMock = jest.fn();
    updateDocenteWithTransactionMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        {
          provide: TeachersRepository,
          useValue: {
            findInstitucionById: findInstitucionByIdMock,
            findCargoById: findCargoByIdMock,
            findDocenteById: findDocenteByIdMock,
            findDocentes: findDocentesMock,
            findPersonaByEmailNotId: findPersonaByEmailNotIdMock,
            updateDocenteEstado: updateDocenteEstadoMock,
            createDocenteWithTransaction: createDocenteWithTransactionMock,
            updateDocenteWithTransaction: updateDocenteWithTransactionMock,
          },
        },
      ],
    }).compile();

    service = module.get<TeachersService>(TeachersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDocente', () => {
    const defaultDto: CreateDocenteDto = {
      dni: '12345678',
      nombres: 'Juan Carlos',
      apellidos: 'Pérez Mamani',
      correo: 'juan.perez@example.com',
      institucionId: 'inst-uuid',
      gradoAcademico: 'Licenciado',
      nivelEducativo: 'Secundaria',
      cursoAsignado: 'Matemáticas',
      cargoId: 'cargo-uuid',
    };

    const mockDirectorIeUser = {
      id: 'director-uuid',
      role: RoleCode.DIRECTOR_INSTITUCION, // Se mapea el rol de Director IE
      colegio_id: 'inst-uuid',
      institucion_id: 'inst-uuid',
    };

    // Ajustar alias para coincidir con la definición de RoleCode
    const directorIeRole = RoleCode.DIRECTOR_INSTITUCION;

    it('should throw ForbiddenException if user has an invalid role', async () => {
      const invalidUser = { id: 'some-id', role: RoleCode.DOCENTE };
      await expect(service.createDocente(defaultDto, invalidUser)).rejects.toThrow(
        new ForbiddenException('No tiene permisos para realizar esta acción.')
      );
    });

    it('should throw ForbiddenException if director_institucion does not have an assigned institution in token', async () => {
      const directorWithoutSchool = { id: 'director-uuid', role: directorIeRole };
      await expect(service.createDocente(defaultDto, directorWithoutSchool)).rejects.toThrow(
        new ForbiddenException('El director de IE no tiene una institución educativa asignada en su token.')
      );
    });

    it('should throw ForbiddenException if director_institucion tries to register in a different institution', async () => {
      const directorForOtherSchool = {
        id: 'director-uuid',
        role: directorIeRole,
        colegio_id: 'other-inst-uuid',
      };
      await expect(service.createDocente(defaultDto, directorForOtherSchool)).rejects.toThrow(
        new ForbiddenException('No tiene permisos para registrar un docente en otra institución educativa.')
      );
    });

    it('should throw NotFoundException if institution does not exist', async () => {
      findInstitucionByIdMock.mockResolvedValue(null);

      await expect(service.createDocente(defaultDto, { ...mockDirectorIeUser, role: directorIeRole })).rejects.toThrow(
        new NotFoundException('La institución educativa especificada no existe.')
      );
      expect(findInstitucionByIdMock).toHaveBeenCalledWith('inst-uuid');
    });

    it('should throw NotFoundException if cargo does not exist', async () => {
      findInstitucionByIdMock.mockResolvedValue({ id: 'inst-uuid' });
      findCargoByIdMock.mockResolvedValue(null);

      await expect(service.createDocente(defaultDto, { ...mockDirectorIeUser, role: directorIeRole })).rejects.toThrow(
        new NotFoundException('El cargo especificado no existe.')
      );
      expect(findCargoByIdMock).toHaveBeenCalledWith('cargo-uuid');
    });

    it('should successfully delegate creation to repository when validation passes', async () => {
      findInstitucionByIdMock.mockResolvedValue({ id: 'inst-uuid' });
      findCargoByIdMock.mockResolvedValue({ id: 'cargo-uuid', nombre: 'Docente de Aula' });
      
      const expectedResult = { id: 'docente-uuid' };
      createDocenteWithTransactionMock.mockResolvedValue(expectedResult);

      const result = await service.createDocente(defaultDto, { ...mockDirectorIeUser, role: directorIeRole });

      expect(result).toBe(expectedResult);
      expect(createDocenteWithTransactionMock).toHaveBeenCalledWith(defaultDto);
    });
  });

  describe('getDocentes', () => {
    const mockTeachersList = [
      {
        id: 'docente-1',
        personaId: 'persona-1',
        institucionId: 'inst-uuid',
        gradoAcademico: 'Licenciado',
        nivelEducativo: 'Secundaria',
        estado: 'Activo',
      },
    ];

    const directorIeRole = RoleCode.DIRECTOR_INSTITUCION;

    it('should throw ForbiddenException if user role is not authorized', async () => {
      await expect(service.getDocentes({ role: RoleCode.DOCENTE })).rejects.toThrow(
        new ForbiddenException('No tiene permisos para realizar esta acción.')
      );
    });

    it('should throw ForbiddenException if director_institucion does not have school_id in token', async () => {
      await expect(service.getDocentes({ role: directorIeRole })).rejects.toThrow(
        new ForbiddenException('El director de IE no tiene una institución educativa asignada en su token.')
      );
    });

    it('should return teachers filtered by institution for director_institucion', async () => {
      findDocentesMock.mockResolvedValue(mockTeachersList);
      
      const result = await service.getDocentes({
        role: directorIeRole,
        colegio_id: 'inst-uuid',
      });

      expect(result).toEqual(mockTeachersList);
      expect(findDocentesMock).toHaveBeenCalledWith({ institucionId: 'inst-uuid' });
    });

    it('should return all teachers for director_ugel', async () => {
      findDocentesMock.mockResolvedValue(mockTeachersList);

      const result = await service.getDocentes({ role: RoleCode.DIRECTOR_UGEL });

      expect(result).toEqual(mockTeachersList);
      expect(findDocentesMock).toHaveBeenCalledWith({});
    });
  });

  describe('updateDocente', () => {
    const updateDto: UpdateDocenteDto = {
      nombres: 'Juan Carlos (Editado)',
      apellidos: 'Pérez Mamani (Editado)',
      correo: 'juan.perez.new@example.com',
      gradoAcademico: 'Magister',
      nivelEducativo: 'Secundaria',
      cursoAsignado: 'Física',
      cargoId: 'new-cargo-uuid',
    };

    const mockDocente = {
      id: 'docente-uuid',
      personaId: 'persona-uuid',
      institucionId: 'inst-uuid',
      gradoAcademico: 'Licenciado',
      nivelEducativo: 'Secundaria',
      cursoAsignado: 'Matemáticas',
      estado: 'Activo',
      persona: {
        id: 'persona-uuid',
        correo: 'juan.perez@example.com',
      },
      docenteCargos: [
        {
          id: 'docente-cargo-old-uuid',
          cargoId: 'old-cargo-uuid',
          fechaInicio: new Date(),
          fechaFin: null,
        },
      ],
    };

    const directorIeRole = RoleCode.DIRECTOR_INSTITUCION;

    const mockDirectorIeUser = {
      id: 'director-uuid',
      role: directorIeRole,
      colegio_id: 'inst-uuid',
    };

    it('should throw ForbiddenException if user has invalid role', async () => {
      await expect(service.updateDocente('docente-uuid', updateDto, { id: 'user', role: RoleCode.DOCENTE })).rejects.toThrow(
        new ForbiddenException('No tiene permisos para realizar esta acción.')
      );
    });

    it('should throw NotFoundException if teacher does not exist', async () => {
      findDocenteByIdMock.mockResolvedValue(null);

      await expect(service.updateDocente('nonexistent-uuid', updateDto, mockDirectorIeUser)).rejects.toThrow(
        new NotFoundException('El docente especificado no existe.')
      );
    });

    it('should throw ForbiddenException if director_institucion tries to edit teacher from another school', async () => {
      findDocenteByIdMock.mockResolvedValue({
        ...mockDocente,
        institucionId: 'other-inst-uuid',
      });

      await expect(service.updateDocente('docente-uuid', updateDto, mockDirectorIeUser)).rejects.toThrow(
        new ForbiddenException('No tiene permisos para editar un docente de otra institución educativa.')
      );
    });

    it('should throw NotFoundException if new cargo does not exist', async () => {
      findDocenteByIdMock.mockResolvedValue(mockDocente);
      findCargoByIdMock.mockResolvedValue(null); // Cargo no existe

      await expect(service.updateDocente('docente-uuid', updateDto, mockDirectorIeUser)).rejects.toThrow(
        new NotFoundException('El cargo especificado no existe.')
      );
    });

    it('should throw ConflictException if updated email is already in use by another person', async () => {
      findDocenteByIdMock.mockResolvedValue(mockDocente);
      findCargoByIdMock.mockResolvedValue({ id: 'new-cargo-uuid' });
      findPersonaByEmailNotIdMock.mockResolvedValue({ id: 'other-person-uuid', email: 'juan.perez.new@example.com' });

      await expect(service.updateDocente('docente-uuid', updateDto, mockDirectorIeUser)).rejects.toThrow(
        new ConflictException('El correo electrónico ya está registrado para otra persona.')
      );
      expect(findPersonaByEmailNotIdMock).toHaveBeenCalledWith('juan.perez.new@example.com', 'persona-uuid');
    });

    it('should successfully delegate update to repository if validation passes', async () => {
      findDocenteByIdMock.mockResolvedValue(mockDocente);
      findCargoByIdMock.mockResolvedValue({ id: 'new-cargo-uuid', nombre: 'Coordinador Pedagógico' });
      findPersonaByEmailNotIdMock.mockResolvedValue(null); // Correo libre

      const expectedResult = { id: 'docente-uuid', cursoAsignado: 'Física' };
      updateDocenteWithTransactionMock.mockResolvedValue(expectedResult);

      const result = await service.updateDocente('docente-uuid', updateDto, mockDirectorIeUser);

      expect(result).toBe(expectedResult);
      expect(updateDocenteWithTransactionMock).toHaveBeenCalledWith(
        'docente-uuid',
        updateDto,
        mockDocente.docenteCargos[0],
        'persona-uuid'
      );
    });
  });

  describe('bajaDocente', () => {
    const mockDocente = {
      id: 'docente-uuid',
      institucionId: 'inst-uuid',
      personaId: 'persona-uuid',
    };

    const directorIeRole = RoleCode.DIRECTOR_INSTITUCION;

    const mockDirectorIeUser = {
      id: 'director-uuid',
      role: directorIeRole,
      colegio_id: 'inst-uuid',
    };

    it('should throw ForbiddenException if user has invalid role', async () => {
      await expect(service.bajaDocente('docente-uuid', { id: 'user', role: RoleCode.DOCENTE })).rejects.toThrow(
        new ForbiddenException('No tiene permisos para realizar esta acción.')
      );
    });

    it('should throw NotFoundException if teacher does not exist', async () => {
      findDocenteByIdMock.mockResolvedValue(null);

      await expect(service.bajaDocente('nonexistent-uuid', mockDirectorIeUser)).rejects.toThrow(
        new NotFoundException('El docente especificado no existe.')
      );
    });

    it('should throw ForbiddenException if director_institucion tries to deactivate teacher from another school', async () => {
      findDocenteByIdMock.mockResolvedValue({
        ...mockDocente,
        institucionId: 'other-inst-uuid',
      });

      await expect(service.bajaDocente('docente-uuid', mockDirectorIeUser)).rejects.toThrow(
        new ForbiddenException('No tiene permisos para dar de baja a un docente de otra institución educativa.')
      );
    });

    it('should successfully delegate deactivation to repository', async () => {
      findDocenteByIdMock.mockResolvedValue(mockDocente);
      
      const repositoryResponse = {
        id: 'docente-uuid',
        estado: 'Inactivo',
        persona: {
          dni: '12345678',
          nombres: 'Juan Carlos',
          apellidos: 'Pérez Mamani',
        },
      };
      updateDocenteEstadoMock.mockResolvedValue(repositoryResponse);

      const result = await service.bajaDocente('docente-uuid', mockDirectorIeUser);

      expect(result.success).toBe(true);
      expect(result.docente.estado).toBe('Inactivo');
      expect(updateDocenteEstadoMock).toHaveBeenCalledWith('docente-uuid', 'Inactivo');
    });
  });
});
