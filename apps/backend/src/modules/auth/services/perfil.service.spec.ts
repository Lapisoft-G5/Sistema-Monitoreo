import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { PerfilService } from './perfil.service.js';
import { UserRepository } from '../repositories/user.repository.js';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';

describe('PerfilService', () => {
  let service: PerfilService;
  let userRepository: {
    findUserById: jest.Mock<any>;
  };
  let prisma: {
    persona: {
      findFirst: jest.Mock<any>;
      update: jest.Mock<any>;
    };
  };

  const mockUser = {
    id: 'user-1',
    personaId: 'persona-1',
    rol: { codigo: 'docente', nombre: 'Docente de Aula' },
    persona: {
      id: 'persona-1',
      dni: '02432354',
      nombres: 'MARTHA IRENE',
      apellidos: 'VILLASANTE CANAZA',
      correo: 'martha@ugel.gob.pe',
      telefono: '987654321',
      docente: {
        institucion: { codigoModular: '0234567', nombre: '70440' },
        docenteCargos: [{ cargo: { nombre: 'Director' } }],
        nivelEducativo: 'PRIMARIA',
        condicionLaboral: 'Designado',
        escalaMagisterial: 3,
      },
    },
  };

  beforeEach(async () => {
    userRepository = {
      findUserById: jest.fn<any>(),
    };
    prisma = {
      persona: {
        findFirst: jest.fn<any>(),
        update: jest.fn<any>(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerfilService,
        { provide: UserRepository, useValue: userRepository },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PerfilService>(PerfilService);
  });

  describe('getPerfil', () => {
    it('retorna los datos del perfil del usuario correctamente', async () => {
      userRepository.findUserById.mockResolvedValue(mockUser);

      const result = await service.getPerfil('user-1');

      expect(result).toEqual({
        id: 'user-1',
        dni: '02432354',
        nombres: 'MARTHA IRENE',
        apellidos: 'VILLASANTE CANAZA',
        correo: 'martha@ugel.gob.pe',
        telefono: '987654321',
        role: 'docente',
        cargo: 'Director de PRIMARIA',
        institucion: '0234567 - 70440',
        condicion: 'Designado',
        escala: 3,
        nivelEducativo: 'PRIMARIA',
      });
    });

    it('lanza NotFoundException si el usuario no existe', async () => {
      userRepository.findUserById.mockResolvedValue(null);

      await expect(service.getPerfil('inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePerfil', () => {
    it('actualiza el correo y teléfono sin alterar DNI ni nombres', async () => {
      userRepository.findUserById.mockResolvedValue(mockUser);
      prisma.persona.findFirst.mockResolvedValue(null);
      prisma.persona.update.mockResolvedValue({
        ...mockUser.persona,
        correo: 'nuevo@ugel.gob.pe',
        telefono: '912345678',
      });

      const result = await service.updatePerfil('user-1', {
        correo: 'nuevo@ugel.gob.pe',
        telefono: '912345678',
      });

      expect(prisma.persona.update).toHaveBeenCalledWith({
        where: { id: 'persona-1' },
        data: {
          correo: 'nuevo@ugel.gob.pe',
          telefono: '912345678',
        },
      });
      expect(result.correo).toBe('nuevo@ugel.gob.pe');
      expect(result.telefono).toBe('912345678');
      expect(result.dni).toBe('02432354');
      expect(result.nombres).toBe('MARTHA IRENE');
    });

    it('lanza ConflictException si el correo ya pertenece a otra persona', async () => {
      userRepository.findUserById.mockResolvedValue(mockUser);
      prisma.persona.findFirst.mockResolvedValue({ id: 'otra-persona' });

      await expect(
        service.updatePerfil('user-1', { correo: 'ocupado@ugel.gob.pe' }),
      ).rejects.toThrow(ConflictException);
    });

    it('lanza ConflictException si el teléfono ya pertenece a otra persona', async () => {
      userRepository.findUserById.mockResolvedValue(mockUser);
      prisma.persona.findFirst.mockResolvedValue({ id: 'otra-persona' });

      await expect(service.updatePerfil('user-1', { telefono: '999888777' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('convierte cadenas vacías a null para preservar unicidad en BD', async () => {
      userRepository.findUserById.mockResolvedValue(mockUser);
      prisma.persona.update.mockResolvedValue({
        ...mockUser.persona,
        correo: null,
        telefono: null,
      });

      await service.updatePerfil('user-1', {
        correo: '',
        telefono: '',
      });

      expect(prisma.persona.update).toHaveBeenCalledWith({
        where: { id: 'persona-1' },
        data: {
          correo: null,
          telefono: null,
        },
      });
    });
  });
});
