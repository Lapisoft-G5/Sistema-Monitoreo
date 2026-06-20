import { Test } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PlantillaService } from './plantilla.service.js';
import { PlantillaRepository } from '../repositories/plantilla.repository.js';

describe('PlantillaService - ILA-0046 Versionado', () => {
  let service: PlantillaService;
  let repo: jest.Mocked<PlantillaRepository>;

  const basePlantilla = {
    id: 'plantilla-v1',
    tipoMonitoreo: 'DOCENTE' as const,
    anioAcademico: 2026,
    version: 1,
    baremo: 'Vigente' as const,
    descripcion: 'Plantilla oficial',
    estado: 'Vigente' as const,
    autorId: 'user-jefe',
    rolAutorAlCrear: 'jefe_gestion' as const,
    institucionId: null,
    niveles: [],
    desempenos: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PlantillaService,
        {
          provide: PlantillaRepository,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            countFichasAsociadas: jest.fn(),
            create: jest.fn(),
            updateInPlace: jest.fn(),
            versionarConClon: jest.fn(),
            updateEstado: jest.fn(),
            clone: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(PlantillaService);
    repo = module.get(PlantillaRepository);
  });

  describe('cambiarEstado (Borrador -> Vigente)', () => {
    it('debe transicionar Borrador a Vigente', async () => {
      const borrador = { ...basePlantilla, estado: 'Borrador' as const };
      repo.findById = jest.fn().mockResolvedValue(borrador);
      repo.findAll = jest.fn().mockResolvedValue([]);
      repo.updateEstado = jest.fn().mockResolvedValue({ ...borrador, estado: 'Vigente' as const });

      const result = await service.cambiarEstado(
        'plantilla-v1',
        { estado: 'Vigente' },
        { id: 'admin', rol: 'admin' }
      );

      expect(result.estado).toBe('Vigente');
      expect(repo.updateEstado).toHaveBeenCalledWith('plantilla-v1', 'Vigente');
    });

    it('debe fallar con NotFoundException si la plantilla no existe', async () => {
      repo.findById = jest.fn().mockResolvedValue(null);

      await expect(
        service.cambiarEstado('plantilla-inexistente', { estado: 'Vigente' }, { id: 'admin', rol: 'admin' })
      ).rejects.toThrow(NotFoundException);
    });

    it('debe fallar con BadRequest si la plantilla ya es Historico', async () => {
      const historico = { ...basePlantilla, estado: 'Historico' as const };
      repo.findById = jest.fn().mockResolvedValue(historico);

      await expect(
        service.cambiarEstado('plantilla-v1', { estado: 'Vigente' }, { id: 'admin', rol: 'admin' })
      ).rejects.toThrow(BadRequestException);
    });

    it('debe fallar con Conflict si ya existe otra plantilla Vigente del mismo tipo+anio', async () => {
      const borrador = { ...basePlantilla, estado: 'Borrador' as const };
      const otraVigente = { ...basePlantilla, id: 'otra-vigente', estado: 'Vigente' as const };
      repo.findById = jest.fn().mockResolvedValue(borrador);
      repo.findAll = jest.fn().mockResolvedValue([basePlantilla, otraVigente]);

      await expect(
        service.cambiarEstado('plantilla-v1', { estado: 'Vigente' }, { id: 'admin', rol: 'admin' })
      ).rejects.toThrow(ConflictException);
    });

    it('debe ser idempotente: si el estado es el mismo, retorna sin error', async () => {
      repo.findById = jest.fn().mockResolvedValue(basePlantilla);

      const result = await service.cambiarEstado(
        'plantilla-v1',
        { estado: 'Vigente' },
        { id: 'admin', rol: 'admin' }
      );

      expect(result).toBe(basePlantilla);
      expect(repo.updateEstado).not.toHaveBeenCalled();
    });
  });

  describe('update (versionado por fichas asociadas)', () => {
    it('debe versionar (clonar a v+1) si la plantilla tiene fichas asociadas', async () => {
      const clon = { ...basePlantilla, id: 'plantilla-v2', version: 2 };
      repo.findById = jest.fn().mockResolvedValue(basePlantilla);
      repo.countFichasAsociadas = jest.fn().mockResolvedValue(3);
      repo.versionarConClon = jest.fn().mockResolvedValue(clon);

      const result = await service.update(
        'plantilla-v1',
        { descripcion: 'cambiada' },
        { id: 'admin', rol: 'admin' }
      );

      expect(result.modo).toBe('VERSIONADO');
      expect(result.version).toBe(2);
      expect(result.mensaje).toContain('3 ficha(s)');
      expect(repo.updateInPlace).not.toHaveBeenCalled();
    });

    it('debe hacer updateInPlace si NO tiene fichas asociadas', async () => {
      repo.findById = jest.fn().mockResolvedValue(basePlantilla);
      repo.countFichasAsociadas = jest.fn().mockResolvedValue(0);
      repo.updateInPlace = jest.fn().mockResolvedValue({ ...basePlantilla, descripcion: 'actualizada' });

      const result = await service.update(
        'plantilla-v1',
        { descripcion: 'actualizada' },
        { id: 'admin', rol: 'admin' }
      );

      expect(result.modo).toBe('IN_PLACE');
      expect(result.plantilla.descripcion).toBe('actualizada');
      expect(repo.versionarConClon).not.toHaveBeenCalled();
    });

    it('debe fallar con NotFound si la plantilla no existe', async () => {
      repo.findById = jest.fn().mockResolvedValue(null);

      await expect(
        service.update('plantilla-inexistente', { descripcion: 'x' }, { id: 'admin', rol: 'admin' })
      ).rejects.toThrow(NotFoundException);
    });
  });
});
