import { Test } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { FichaService } from './ficha.service.js';
import { FichaRepository } from '../repositories/ficha.repository.js';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';

describe('FichaService - ILA-0046 409 PLANTILLA_VERSIONADA', () => {
  let service: FichaService;
  let repo: jest.Mocked<FichaRepository>;
  let prisma: jest.Mocked<PrismaService>;

  const baseFicha = {
    id: 'ficha-1',
    cronogramaId: 'cronograma-1',
    plantillaId: 'plantilla-v1',
    especialistaId: 'user-1',
    estado: 'BORRADOR',
    anioAcademico: 2026,
    puntajeTotal: 0,
    promedio: 0,
    nivelLogro: 'EN_PROCESO',
    observaciones: null,
    respuestasDesempeno: [],
    respuestasAspecto: [],
    contexto: null,
    createdAt: new Date().toISOString(),
    finalizadaAt: null,
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FichaService,
        {
          provide: FichaRepository,
          useValue: {
            findById: jest.fn<any>(),
            findByVisitaId: jest.fn<any>(),
            create: jest.fn<any>(),
            saveRespuestaDesempeno: jest.fn<any>(),
            saveRespuestaAspecto: jest.fn<any>(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            plantillaMonitoreo: {
              findUnique: jest.fn<any>(),
              findFirst: jest.fn<any>(),
            },
          },
        },
      ],
    }).compile();

    service = module.get(FichaService);
    repo = module.get(FichaRepository);
    prisma = module.get(PrismaService);
  });

  describe('guardarRespuesta con plantilla vigente', () => {
    it('permite guardar normalmente', async () => {
      repo.findById = jest.fn<any>().mockResolvedValue(baseFicha);
      (prisma.plantillaMonitoreo.findUnique as jest.Mock<any>).mockResolvedValue({
        id: 'plantilla-v1',
        tipoMonitoreo: 'DOCENTE',
        anioAcademico: 2026,
        estado: 'Vigente',
      });
      repo.saveRespuestaDesempeno = jest.fn<any>().mockResolvedValue(undefined);
      repo.findById = jest
        .fn<any>()
        .mockResolvedValueOnce(baseFicha)
        .mockResolvedValueOnce({
          ...baseFicha,
          respuestasDesempeno: [{ desempenoId: 'd1', nivel: 3 }],
        });

      const result = await service.guardarRespuesta(
        'ficha-1',
        { desempenoId: 'd1', nivel: 3 },
        { id: 'user-1', role: 'especialista' },
      );

      expect(result.respuestasDesempeno).toHaveLength(1);
      expect(repo.saveRespuestaDesempeno).toHaveBeenCalled();
    });
  });

  describe('guardarRespuesta con plantilla HISTORICO (ILA-0046)', () => {
    it('lanza 409 con code PLANTILLA_VERSIONADA y datos de la v2', async () => {
      repo.findById = jest.fn<any>().mockResolvedValue(baseFicha);
      (prisma.plantillaMonitoreo.findUnique as jest.Mock<any>).mockResolvedValue({
        id: 'plantilla-v1',
        tipoMonitoreo: 'DOCENTE',
        anioAcademico: 2026,
        estado: 'Historico',
      });
      (prisma.plantillaMonitoreo.findFirst as jest.Mock<any>).mockResolvedValue({
        id: 'plantilla-v2',
        descripcion: 'Plantilla DOCENTE 2026 v2',
      });

      try {
        await service.guardarRespuesta(
          'ficha-1',
          { desempenoId: 'd1', nivel: 3 },
          { id: 'user-1', role: 'especialista' },
        );
        fail('Debio lanzar ConflictException');
      } catch (err) {
        expect(err).toBeInstanceOf(ConflictException);
        const body = (err as ConflictException).getResponse() as Record<string, unknown>;
        expect(body.code).toBe('PLANTILLA_VERSIONADA');
        expect(body.plantillaVigenteId).toBe('plantilla-v2');
        expect(body.plantillaVigenteNombre).toBe('Plantilla DOCENTE 2026 v2');
      }

      expect(repo.saveRespuestaDesempeno).not.toHaveBeenCalled();
    });

    it('lanza 409 sin plantillaVigenteId si no hay vigente', async () => {
      repo.findById = jest.fn<any>().mockResolvedValue(baseFicha);
      (prisma.plantillaMonitoreo.findUnique as jest.Mock<any>).mockResolvedValue({
        id: 'plantilla-v1',
        tipoMonitoreo: 'DOCENTE',
        anioAcademico: 2026,
        estado: 'Historico',
      });
      (prisma.plantillaMonitoreo.findFirst as jest.Mock<any>).mockResolvedValue(null);

      try {
        await service.guardarRespuesta(
          'ficha-1',
          { desempenoId: 'd1', nivel: 3 },
          { id: 'user-1', role: 'especialista' },
        );
        fail('Debio lanzar ConflictException');
      } catch (err) {
        const body = (err as ConflictException).getResponse() as Record<string, unknown>;
        expect(body.code).toBe('PLANTILLA_VERSIONADA');
        expect(body.plantillaVigenteId).toBeNull();
      }
    });
  });

  describe('guardarRespuestaAspecto con plantilla HISTORICO (ILA-0046)', () => {
    it('tambien aplica a aspectos', async () => {
      repo.findById = jest.fn<any>().mockResolvedValue(baseFicha);
      (prisma.plantillaMonitoreo.findUnique as jest.Mock<any>).mockResolvedValue({
        id: 'plantilla-v1',
        tipoMonitoreo: 'DOCENTE',
        anioAcademico: 2026,
        estado: 'Historico',
      });
      (prisma.plantillaMonitoreo.findFirst as jest.Mock<any>).mockResolvedValue(null);

      try {
        await service.guardarRespuestaAspecto('ficha-1', 'aspecto-1', true, {
          id: 'user-1',
          role: 'especialista',
        });
        fail('Debio lanzar ConflictException');
      } catch (err) {
        expect(err).toBeInstanceOf(ConflictException);
        const body = (err as ConflictException).getResponse() as Record<string, unknown>;
        expect(body.code).toBe('PLANTILLA_VERSIONADA');
      }

      expect(repo.saveRespuestaAspecto).not.toHaveBeenCalled();
    });
  });

  describe('errores que ya existian', () => {
    it('lanza NotFound si la ficha no existe', async () => {
      repo.findById = jest.fn<any>().mockResolvedValue(null);
      await expect(
        service.guardarRespuesta(
          'ficha-x',
          { desempenoId: 'd1', nivel: 1 },
          { id: 'user-1', role: 'especialista' },
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
