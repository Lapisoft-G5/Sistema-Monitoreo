import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { CreateDocenteDto } from '../dto/create-docente.dto.js';
import { UpdateDocenteDto } from '../dto/update-docente.dto.js';
import { DocenteCargo, Prisma } from '../../../generated/prisma/client.js';
import { DocenteEntity, DocenteFilter, TeachersRepository } from './teachers.repository.js';
import { EstadoRegistro } from '../../../common/enums/estado.enum.js';

type DocenteWithRelations = Prisma.DocenteGetPayload<{
  include: {
    persona: true;
    docenteCargos: {
      include: { cargo: true };
    };
    docenteCursos: {
      include: {
        curso: true;
      };
    };
    docenteSecciones: true;
  };
}>;

@Injectable()
export class PrismaTeachersRepository implements TeachersRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapDocente(docente: DocenteWithRelations): DocenteEntity {
    return {
      id: docente.id,
      personaId: docente.personaId,
      institucionId: docente.institucionId,
      gradoAcademico: docente.gradoAcademico,
      nivelEducativo: docente.nivelEducativo,
      cursoAsignado: docente.docenteCursos?.[0]?.curso?.nombre || null,
      condicionLaboral: docente.condicionLaboral,
      escalaMagisterial: docente.escalaMagisterial,
      estado: docente.estado,
      createdAt: docente.createdAt,
      updatedAt: docente.updatedAt,
      persona: {
        id: docente.persona.id,
        dni: docente.persona.dni,
        nombres: docente.persona.nombres,
        apellidos: docente.persona.apellidos,
        correo: docente.persona.correo,
        telefono: docente.persona.telefono,
      },
      docenteCargos: docente.docenteCargos.map((dc) => ({
        id: dc.id,
        cargoId: dc.cargoId,
        fechaInicio: dc.fechaInicio,
        fechaFin: dc.fechaFin,
        cargo: {
          id: dc.cargo.id,
          nombre: dc.cargo.nombre,
        },
      })),
      docenteSecciones: docente.docenteSecciones?.map((ds) => ({
        id: ds.id,
        grado: ds.grado,
        seccion: ds.seccion,
      })) || [],
    };
  }

  async findDocenteById(id: string): Promise<DocenteEntity | null> {
    const docente = await this.prisma.docente.findUnique({
      where: { id },
      include: {
        persona: true,
        docenteCargos: {
          where: { fechaFin: null },
          include: { cargo: true },
        },
        docenteCursos: {
          include: {
            curso: true,
          },
        },
        docenteSecciones: true,
      },
    });
    if (!docente) return null;
    return this.mapDocente(docente);
  }

  async findDocentes(filter?: DocenteFilter): Promise<DocenteEntity[]> {
    const where: Prisma.DocenteWhereInput = {};
    if (filter?.institucionId) {
      where.institucionId = filter.institucionId;
    }
    const list = await this.prisma.docente.findMany({
      where,
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
        docenteCursos: {
          include: {
            curso: true,
          },
        },
        docenteSecciones: true,
      },
    });
    return list.map((d) => this.mapDocente(d));
  }

  async updateDocenteEstado(id: string, estado: string): Promise<DocenteEntity> {
    const docente = await this.prisma.docente.update({
      where: { id },
      data: { estado },
      include: {
        persona: true,
        docenteCargos: {
          include: { cargo: true },
        },
        docenteCursos: {
          include: {
            curso: true,
          },
        },
        docenteSecciones: true,
      },
    });
    return this.mapDocente(docente);
  }

  async createDocenteWithTransaction(dto: CreateDocenteDto): Promise<DocenteEntity> {
    return this.prisma.$transaction(async (tx) => {
      // Validar si el cargo a asignar es 'Director' y si la institución ya tiene uno activo
      const cargo = await tx.cargo.findUnique({
        where: { id: dto.cargoId },
      });

      if (cargo && cargo.nombre === 'Director') {
        const activeDirector = await tx.docenteCargo.findFirst({
          where: {
            docente: {
              institucionId: dto.institucionId,
            },
            cargo: {
              nombre: 'Director',
            },
            fechaFin: null,
          },
          include: {
            docente: {
              include: {
                persona: true,
              },
            },
          },
        });

        if (activeDirector) {
          const directorName = `${activeDirector.docente.persona.nombres} ${activeDirector.docente.persona.apellidos}`;
          throw new ConflictException(
            `La institución educativa ya cuenta con un director activo (${directorName}).`
          );
        }
      }

      // Verificar si la persona con ese DNI ya existe
      const existingPersona = await tx.persona.findUnique({
        where: { dni: dto.dni },
        include: { docente: true },
      });

      let personaId: string;

      if (existingPersona) {
        // Si la persona existe y ya tiene un registro de docente, lanzar conflicto
        if (existingPersona.docente) {
          throw new ConflictException('El docente con este DNI ya se encuentra registrado.');
        }

        // Si la persona existe pero no es docente, actualizar sus datos si cambiaron
        await tx.persona.update({
          where: { id: existingPersona.id },
          data: {
            nombres: dto.nombres,
            apellidos: dto.apellidos,
            correo: dto.correo !== undefined ? (dto.correo || null) : existingPersona.correo,
            telefono: dto.telefono !== undefined ? (dto.telefono || null) : existingPersona.telefono,
          },
        });
        personaId = existingPersona.id;
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
            correo: dto.correo || null,
            telefono: dto.telefono || null,
          },
        });
        personaId = newPersona.id;
      }

      // Crear el registro de docente enlazado a la persona
      const docente = await tx.docente.create({
        data: {
          personaId: personaId,
          institucionId: dto.institucionId,
          gradoAcademico: dto.gradoAcademico ?? null,
          nivelEducativo: dto.nivelEducativo,
          condicionLaboral: dto.condicionLaboral ?? null,
          escalaMagisterial: dto.escalaMagisterial ?? null,
          estado: EstadoRegistro.ACTIVO,
        },
      });

      // Registrar curso asignado si se proporciona
      if (dto.cursoAsignado) {
        const curso = await tx.curso.upsert({
          where: {
            nombre_nivelEducativo: {
              nombre: dto.cursoAsignado,
              nivelEducativo: dto.nivelEducativo,
            },
          },
          update: {},
          create: {
            nombre: dto.cursoAsignado,
            nivelEducativo: dto.nivelEducativo,
          },
        });

        await tx.docenteCurso.create({
          data: {
            docenteId: docente.id,
            cursoId: curso.id,
          },
        });
      }

      // Registrar el cargo inicial asignado al docente
      await tx.docenteCargo.create({
        data: {
          docenteId: docente.id,
          cargoId: dto.cargoId,
          fechaInicio: new Date(),
        },
      });

      // Registrar secciones asignadas si se proporcionan
      if (dto.secciones && dto.secciones.length > 0) {
        await tx.docenteSeccion.createMany({
          data: dto.secciones.map((s) => ({
            docenteId: docente.id,
            grado: s.grado,
            seccion: s.seccion,
          })),
        });
      }

      const isDirectorCargo = cargo?.nombre === 'Director';
      const roleCode = isDirectorCargo ? 'director_institucion' : 'docente';
      const role = await tx.role.findUnique({
        where: { codigo: roleCode },
      });
      if (!role) {
        throw new ConflictException(`El rol ${roleCode} no está configurado en el sistema.`);
      }

      // Crear el usuario si no existe
      const existingUser = await tx.usuario.findUnique({
        where: { personaId: personaId },
      });

      if (!existingUser) {
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(dto.dni, saltRounds);
        await tx.usuario.create({
          data: {
            personaId: personaId,
            rolId: role.id,
            passwordHash,
            isActive: true,
            isFirstLogin: true,
          },
        });
      }

      const fullDocente = await tx.docente.findUniqueOrThrow({
        where: { id: docente.id },
        include: {
          persona: true,
          docenteCargos: {
            include: { cargo: true },
            orderBy: { fechaInicio: 'desc' },
          },
          docenteCursos: {
            include: { curso: true },
          },
          docenteSecciones: true,
        },
      });

      return this.mapDocente(fullDocente);
    });
  }

  async updateDocenteWithTransaction(
    id: string,
    dto: UpdateDocenteDto,
    activeCargo: DocenteCargo | null,
    personaId: string,
  ): Promise<DocenteEntity> {
    return this.prisma.$transaction(async (tx) => {
      // Validar si el cargo a asignar es 'Director' y si la institución destino ya tiene uno activo
      const cargo = await tx.cargo.findUnique({
        where: { id: dto.cargoId },
      });

      if (cargo && cargo.nombre === 'Director') {
        const targetInstitucionId = dto.institucionId || (await tx.docente.findUnique({ where: { id } }))?.institucionId;
        if (targetInstitucionId) {
          const activeDirector = await tx.docenteCargo.findFirst({
            where: {
              docente: {
                institucionId: targetInstitucionId,
              },
              cargo: {
                nombre: 'Director',
              },
              fechaFin: null,
              docenteId: { not: id },
            },
            include: {
              docente: {
                include: {
                  persona: true,
                },
              },
            },
          });

          if (activeDirector) {
            const directorName = `${activeDirector.docente.persona.nombres} ${activeDirector.docente.persona.apellidos}`;
            throw new ConflictException(
              `La institución educativa ya cuenta con un director activo (${directorName}).`
            );
          }
        }
      }

      // A. Actualizar datos de Persona
      await tx.persona.update({
        where: { id: personaId },
        data: {
          nombres: dto.nombres,
          apellidos: dto.apellidos,
          correo: dto.correo !== undefined ? (dto.correo || null) : undefined,
          telefono: dto.telefono !== undefined ? (dto.telefono || null) : undefined,
        },
      });

      // B. Actualizar datos de Docente
      await tx.docente.update({
        where: { id },
        data: {
          gradoAcademico: dto.gradoAcademico ?? null,
          nivelEducativo: dto.nivelEducativo,
          condicionLaboral: dto.condicionLaboral ?? null,
          escalaMagisterial: dto.escalaMagisterial ?? null,
          ...(dto.institucionId && { institucionId: dto.institucionId }),
        },
      });

      // C. Actualizar curso asignado
      await tx.docenteCurso.deleteMany({
        where: { docenteId: id },
      });

      if (dto.cursoAsignado) {
        const curso = await tx.curso.upsert({
          where: {
            nombre_nivelEducativo: {
              nombre: dto.cursoAsignado,
              nivelEducativo: dto.nivelEducativo,
            },
          },
          update: {},
          create: {
            nombre: dto.cursoAsignado,
            nivelEducativo: dto.nivelEducativo,
          },
        });

        await tx.docenteCurso.create({
          data: {
            docenteId: id,
            cursoId: curso.id,
          },
        });
      }

      // Actualizar secciones asignadas
      await tx.docenteSeccion.deleteMany({
        where: { docenteId: id },
      });

      if (dto.secciones && dto.secciones.length > 0) {
        await tx.docenteSeccion.createMany({
          data: dto.secciones.map((s) => ({
            docenteId: id,
            grado: s.grado,
            seccion: s.seccion,
          })),
        });
      }

      // D. Manejo de cargo activo e histórico
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

      // Sincronizar rol de usuario si cambia el cargo
      if (!activeCargo || activeCargo.cargoId !== dto.cargoId) {
        const cargo = await tx.cargo.findUnique({
          where: { id: dto.cargoId },
        });
        if (cargo) {
          const isDirectorCargo = cargo.nombre === 'Director';
          const roleCode = isDirectorCargo ? 'director_institucion' : 'docente';
          const role = await tx.role.findUnique({
            where: { codigo: roleCode },
          });
          if (role) {
            await tx.usuario.updateMany({
              where: { personaId: personaId },
              data: { rolId: role.id },
            });
          }
        }
      }

      const fullDocente = await tx.docente.findUniqueOrThrow({
        where: { id },
        include: {
          persona: true,
          docenteCargos: {
            include: { cargo: true },
            orderBy: { fechaInicio: 'desc' },
          },
          docenteCursos: {
            include: { curso: true },
          },
          docenteSecciones: true,
        },
      });

      return this.mapDocente(fullDocente);
    });
  }
}
