import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { ConflictException } from '@nestjs/common';
import { CargoCompatibilityService } from './cargo-compatibility.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CargoNombre } from './capability-map.js';

describe('CargoCompatibilityService', () => {
  let service: CargoCompatibilityService;
  let prismaDocenteCargo: { findMany: jest.Mock<any> };

  const mockPrisma = () => {
    prismaDocenteCargo = {
      findMany: jest.fn<any>(),
    };
    return {
      docenteCargo: prismaDocenteCargo,
    } as unknown as PrismaService;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CargoCompatibilityService, { provide: PrismaService, useFactory: mockPrisma }],
    }).compile();
    service = module.get<CargoCompatibilityService>(CargoCompatibilityService);
  });

  describe('getActiveDocenteCargos', () => {
    it('devuelve los nombres de cargos activos del docente', async () => {
      prismaDocenteCargo.findMany.mockResolvedValue([
        { cargo: { nombre: CargoNombre.DIRECTOR } },
        { cargo: { nombre: CargoNombre.JEFE_DE_TALLER } },
      ]);
      const result = await service.getActiveDocenteCargos('doc-1');
      expect(result).toEqual([CargoNombre.DIRECTOR, CargoNombre.JEFE_DE_TALLER]);
      expect(prismaDocenteCargo.findMany).toHaveBeenCalledWith({
        where: { docenteId: 'doc-1', fechaFin: null },
        include: { cargo: true },
      });
    });

    it('omite cargos sin nombre', async () => {
      prismaDocenteCargo.findMany.mockResolvedValue([
        { cargo: { nombre: CargoNombre.DIRECTOR } },
        { cargo: null },
        { cargo: { nombre: '' } },
      ]);
      const result = await service.getActiveDocenteCargos('doc-1');
      expect(result).toEqual([CargoNombre.DIRECTOR]);
    });

    it('devuelve array vacio si el docente no tiene cargos activos', async () => {
      prismaDocenteCargo.findMany.mockResolvedValue([]);
      const result = await service.getActiveDocenteCargos('doc-1');
      expect(result).toEqual([]);
    });
  });

  describe('ensureCanAddCargo', () => {
    it('permite agregar un Docente de Aula a un docente sin cargos', async () => {
      prismaDocenteCargo.findMany.mockResolvedValue([]);
      await expect(
        service.ensureCanAddCargo('doc-1', CargoNombre.DOCENTE_DE_AULA),
      ).resolves.toBeUndefined();
    });

    it('permite agregar Jefe de Taller a un docente que ya es Docente de Aula', async () => {
      prismaDocenteCargo.findMany.mockResolvedValue([
        { cargo: { nombre: CargoNombre.DOCENTE_DE_AULA } },
      ]);
      await expect(
        service.ensureCanAddCargo('doc-1', CargoNombre.JEFE_DE_TALLER),
      ).resolves.toBeUndefined();
    });

    it('rechaza Director si el docente ya tiene cualquier cargo (es unico)', async () => {
      prismaDocenteCargo.findMany.mockResolvedValue([
        { cargo: { nombre: CargoNombre.DOCENTE_DE_AULA } },
      ]);
      await expect(service.ensureCanAddCargo('doc-1', CargoNombre.DIRECTOR)).rejects.toThrow(
        ConflictException,
      );
    });

    it('rechaza Director si el docente ya tiene Jefe de Taller (incompatible)', async () => {
      prismaDocenteCargo.findMany.mockResolvedValue([
        { cargo: { nombre: CargoNombre.JEFE_DE_TALLER } },
      ]);
      await expect(service.ensureCanAddCargo('doc-1', CargoNombre.DIRECTOR)).rejects.toThrow(
        ConflictException,
      );
    });

    it('rechaza Subdirector si el docente ya tiene Director (Director es unico)', async () => {
      prismaDocenteCargo.findMany.mockResolvedValue([{ cargo: { nombre: CargoNombre.DIRECTOR } }]);
      await expect(service.ensureCanAddCargo('doc-1', CargoNombre.SUBDIRECTOR)).rejects.toThrow(
        ConflictException,
      );
    });

    it('permite Coordinador Pedagogico + Docente de Aula', async () => {
      prismaDocenteCargo.findMany.mockResolvedValue([
        { cargo: { nombre: CargoNombre.COORDINADOR_PEDAGOGICO } },
      ]);
      await expect(
        service.ensureCanAddCargo('doc-1', CargoNombre.DOCENTE_DE_AULA),
      ).resolves.toBeUndefined();
    });

    it('rechaza combinar dos cargos incompatibles (Director + Subdirector)', async () => {
      prismaDocenteCargo.findMany.mockResolvedValue([{ cargo: { nombre: CargoNombre.DIRECTOR } }]);
      await expect(service.ensureCanAddCargo('doc-1', CargoNombre.SUBDIRECTOR)).rejects.toThrow(
        ConflictException,
      );
    });

    it('el mensaje de error incluye los cargos activos', async () => {
      prismaDocenteCargo.findMany.mockResolvedValue([
        { cargo: { nombre: CargoNombre.JEFE_DE_TALLER } },
      ]);
      try {
        await service.ensureCanAddCargo('doc-1', CargoNombre.DIRECTOR);
        fail('Debio lanzar ConflictException');
      } catch (err) {
        expect(err).toBeInstanceOf(ConflictException);
        expect((err as ConflictException).message).toContain('Director');
        expect((err as ConflictException).message).toContain('Jefe de Taller');
      }
    });
  });
});
