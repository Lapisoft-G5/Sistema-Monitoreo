import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { TeachersRepository } from './teachers.repository.js';
import { CreateDocenteDto } from '../dto/create-docente.dto.js';
import { UpdateDocenteDto } from '../dto/update-docente.dto.js';

@Injectable()
export class PrismaTeachersRepository implements TeachersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findInstitucionById(id: string): Promise<any> {
    return this.prisma.institucionEducativa.findUnique({
      where: { id },
    });
  }

  async findCargoById(id: string): Promise<any> {
    return this.prisma.cargo.findUnique({
      where: { id },
    });
  }

  async findDocenteById(id: string): Promise<any> {
    return this.prisma.docente.findUnique({
      where: { id },
      include: {
        persona: true,
        docenteCargos: {
          where: { fechaFin: null },
        },
      },
    });
  }

  async findDocentes(whereClause: any): Promise<any[]> {
    return this.prisma.docente.findMany({
      where: whereClause,
      include: {
        persona: true,
        docenteCargos: {
          where: {
            fechaFin: null,
          },
          include: {
            cargo: true,
          },
        },
      },
    });
  }

  async findPersonaByEmailNotId(email: string, excludePersonaId: string): Promise<any> {
    return this.prisma.persona.findFirst({
      where: {
        correo: email,
        NOT: { id: excludePersonaId },
      },
    });
  }

  async updateDocenteEstado(id: string, estado: string): Promise<any> {
    return this.prisma.docente.update({
      where: { id },
      data: { estado },
      include: {
        persona: true,
      },
    });
  }

  async createDocenteWithTransaction(dto: CreateDocenteDto): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      // Verificar si la persona con ese DNI ya existe
      const existingPersona = await tx.persona.findUnique({
        where: { dni: dto.dni },
        include: { docente: true },
      });

      let personaId: string;
      let finalPersona: any;

      if (existingPersona) {
        // Si la persona existe y ya tiene un registro de docente, lanzar conflicto
        if (existingPersona.docente) {
          throw new ConflictException('El docente con este DNI ya se encuentra registrado.');
        }

        // Si la persona existe pero no es docente, actualizar sus datos si cambiaron
        const updatedPersona = await tx.persona.update({
          where: { id: existingPersona.id },
          data: {
            nombres: dto.nombres,
            apellidos: dto.apellidos,
            correo: dto.correo ?? existingPersona.correo,
          },
        });
        personaId = updatedPersona.id;
        finalPersona = updatedPersona;
      } else {
        // Validar si el correo ya está registrado en otra persona (si se proporciona)
        if (dto.correo) {
          const correoExists = await tx.persona.findUnique({
            where: { correo: dto.correo },
          });
          if (correoExists) {
            throw new ConflictException(
              'El correo electrónico ya está registrado para otra persona.',
            );
          }
        }

        // Crear la persona física
        const newPersona = await tx.persona.create({
          data: {
            dni: dto.dni,
            nombres: dto.nombres,
            apellidos: dto.apellidos,
            correo: dto.correo ?? null,
          },
        });
        personaId = newPersona.id;
        finalPersona = newPersona;
      }

      // Crear el registro de docente enlazado a la persona
      const docente = await tx.docente.create({
        data: {
          personaId: personaId,
          institucionId: dto.institucionId,
          gradoAcademico: dto.gradoAcademico ?? null,
          nivelEducativo: dto.nivelEducativo,
          cursoAsignado: dto.cursoAsignado ?? null,
          estado: 'Activo',
        },
      });

      // Registrar el cargo inicial asignado al docente
      const docenteCargo = await tx.docenteCargo.create({
        data: {
          docenteId: docente.id,
          cargoId: dto.cargoId,
          fechaInicio: new Date(),
        },
        include: {
          cargo: true,
        },
      });

      return {
        id: docente.id,
        personaId: docente.personaId,
        institucionId: docente.institucionId,
        gradoAcademico: docente.gradoAcademico,
        nivelEducativo: docente.nivelEducativo,
        cursoAsignado: docente.cursoAsignado,
        estado: docente.estado,
        createdAt: docente.createdAt,
        updatedAt: docente.updatedAt,
        persona: {
          id: finalPersona.id,
          dni: finalPersona.dni,
          nombres: finalPersona.nombres,
          apellidos: finalPersona.apellidos,
          correo: finalPersona.correo,
        },
        docenteCargos: [
          {
            id: docenteCargo.id,
            cargoId: docenteCargo.cargoId,
            fechaInicio: docenteCargo.fechaInicio,
            fechaFin: docenteCargo.fechaFin,
            cargo: {
              id: docenteCargo.cargo.id,
              nombre: docenteCargo.cargo.nombre,
            },
          },
        ],
      };
    });
  }

  async updateDocenteWithTransaction(
    id: string,
    dto: UpdateDocenteDto,
    activeCargo: any,
    personaId: string,
  ): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      // A. Actualizar datos de Persona
      const updatedPersona = await tx.persona.update({
        where: { id: personaId },
        data: {
          nombres: dto.nombres,
          apellidos: dto.apellidos,
          correo: dto.correo ?? null,
        },
      });

      // B. Actualizar datos de Docente
      const updatedDocente = await tx.docente.update({
        where: { id },
        data: {
          gradoAcademico: dto.gradoAcademico ?? null,
          nivelEducativo: dto.nivelEducativo,
          cursoAsignado: dto.cursoAsignado ?? null,
        },
      });

      // C. Manejo de cargo activo e histórico
      if (!activeCargo || activeCargo.cargoId !== dto.cargoId) {
        // Finalizar el cargo anterior si existe
        if (activeCargo) {
          await tx.docenteCargo.update({
            where: { id: activeCargo.id },
            data: { fechaFin: new Date() },
          });
        }

        // Crear el nuevo cargo activo
        await tx.docenteCargo.create({
          data: {
            docenteId: id,
            cargoId: dto.cargoId,
            fechaInicio: new Date(),
          },
        });
      }

      // Obtener todos los cargos actuales para retornar en la respuesta
      const allCargos = await tx.docenteCargo.findMany({
        where: { docenteId: id },
        include: { cargo: true },
        orderBy: { fechaInicio: 'desc' },
      });

      return {
        id: updatedDocente.id,
        personaId: updatedDocente.personaId,
        institucionId: updatedDocente.institucionId,
        gradoAcademico: updatedDocente.gradoAcademico,
        nivelEducativo: updatedDocente.nivelEducativo,
        cursoAsignado: updatedDocente.cursoAsignado,
        estado: updatedDocente.estado,
        createdAt: updatedDocente.createdAt,
        updatedAt: updatedDocente.updatedAt,
        persona: {
          id: updatedPersona.id,
          dni: updatedPersona.dni,
          nombres: updatedPersona.nombres,
          apellidos: updatedPersona.apellidos,
          correo: updatedPersona.correo,
        },
        docenteCargos: allCargos.map((dc) => ({
          id: dc.id,
          cargoId: dc.cargoId,
          fechaInicio: dc.fechaInicio,
          fechaFin: dc.fechaFin,
          cargo: {
            id: dc.cargo.id,
            nombre: dc.cargo.nombre,
          },
        })),
      };
    });
  }
}
