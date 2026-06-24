/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { randomUUID } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { EspecialistaRepository, CargoRecord } from './especialista.repository.js';
import type {
  IEspecialistaResponse,
  ICreateEspecialistaRequest,
  IUpdateEspecialistaRequest,
  IQueryEspecialistaRequest,
} from '@sistema-monitoreo/shared-contracts';
import { CargoNombre } from '../../../common/enums/cargo.enum.js';
import { CondicionLaboral } from '../../../common/enums/condicion-laboral.enum.js';
import { EstadoRegistro } from '../../../common/enums/estado.enum.js';

type EspecialistaWithRelations = Prisma.EspecialistaGetPayload<{
  include: {
    persona: {
      include: {
        usuario: {
          include: {
            rol: true;
          };
        };
      };
    };
    especialidades: {
      include: { especialidad: true };
    };
    cargos: true;
  };
}>;

@Injectable()
export class PrismaEspecialistaRepository implements EspecialistaRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapEspecialista(esp: EspecialistaWithRelations): IEspecialistaResponse {
    const especialidadesList = esp.especialidades || [];
    const mainRelation = especialidadesList.find((e: any) => e.esPrincipal);
    const extraRelations = especialidadesList.filter((e: any) => !e.esPrincipal);

    // Cargo efectivo: el EspecialistaCargo activo (fechaFin IS NULL). Si
    // no hay cargo activo, cae a 'Especialista' (cargo por defecto).
    // El deactivate ya no inactiva al Especialista, sólo le quita el
    // cargo, por lo que no se necesita un caso especial para estado=Inactivo.
    const cargoActivo = (esp.cargos || []).find((c) => c.fechaFin === null);
    const cargoEfectivo = cargoActivo?.cargo ?? 'Especialista';

    return {
      id: esp.id,
      personaId: esp.personaId,
      especialidades: especialidadesList.map((e: any) => e.especialidad?.nombre).filter(Boolean),
      especialidad: mainRelation?.especialidad?.nombre || null,
      especialidadesExtras: extraRelations.map((e: any) => e.especialidad?.nombre).filter(Boolean),
      nivelEducativo: esp.nivelEducativo,
      modalidad: esp.modalidad ?? null,
      estado: esp.estado,
      cargaLaboral: esp.cargaLaboral,
      cargo: cargoEfectivo,
      condicionLaboral: esp.condicionLaboral ?? null,
      escalaMagisterial: esp.escalaMagisterial,
      createdAt: esp.createdAt,
      updatedAt: esp.updatedAt,
      persona: {
        id: esp.persona.id,
        dni: esp.persona.dni,
        nombres: esp.persona.nombres,
        apellidos: esp.persona.apellidos,
        correo: esp.persona.correo,
        telefono: esp.persona.telefono,
      },
      user: esp.persona.usuario
        ? {
            id: esp.persona.usuario.id,
            role: {
              code: esp.persona.usuario.rol.codigo,
              name: esp.persona.usuario.rol.nombre,
            },
          }
        : undefined,
    };
  }

  async findAll(filters?: IQueryEspecialistaRequest): Promise<IEspecialistaResponse[]> {
    const list = await this.prisma.especialista.findMany({
      where: {
        ...(filters?.estado && { estado: filters.estado }),
        ...(filters?.nivelEducativo && { nivelEducativo: filters.nivelEducativo }),
      },
      include: {
        persona: {
          include: {
            usuario: {
              include: {
                rol: true,
              },
            },
          },
        },
        especialidades: {
          include: { especialidad: true },
        },
        cargos: true,
      },
    });

    const mapped = list.map((esp) => this.mapEspecialista(esp));
    if (filters?.cargo) {
      return mapped.filter((esp) => esp.cargo === filters.cargo);
    }
    return mapped;
  }

  async findById(id: string): Promise<IEspecialistaResponse | null> {
    const esp = await this.prisma.especialista.findUnique({
      where: { id },
      include: {
        persona: {
          include: {
            usuario: {
              include: {
                rol: true,
              },
            },
          },
        },
        especialidades: {
          include: { especialidad: true },
        },
        cargos: true,
      },
    });
    if (!esp) return null;

    return this.mapEspecialista(esp);
  }

  async create(
    data: ICreateEspecialistaRequest,
    passwordHash: string,
    roleId: string,
  ): Promise<IEspecialistaResponse> {
    return await this.prisma.$transaction(async (tx) => {
      // A. Reutilizar Persona si ya existe por DNI, si no, crearla.
      const existingPersona = await tx.persona.findUnique({
        where: { dni: data.dni },
        include: { especialista: true, usuario: true },
      });

      let persona: { id: string };
      if (existingPersona) {
        if (existingPersona.especialista) {
          throw new ConflictException(
            `La persona con DNI ${data.dni} ya está registrada como Especialista/Jefe. No se puede crear un nuevo registro.`,
          );
        }
        persona = await tx.persona.update({
          where: { id: existingPersona.id },
          data: {
            nombres: data.nombres,
            apellidos: data.apellidos,
            correo: data.correo || null,
            telefono: data.telefono || null,
          },
        });

        if (!existingPersona.usuario) {
          await tx.usuario.create({
            data: {
              personaId: persona.id,
              rolId: roleId,
              passwordHash,
              isActive: true,
              isFirstLogin: true,
            },
          });
        }
      } else {
        persona = await tx.persona.create({
          data: {
            dni: data.dni,
            nombres: data.nombres,
            apellidos: data.apellidos,
            correo: data.correo || null,
            telefono: data.telefono || null,
          },
        });

        await tx.usuario.create({
          data: {
            personaId: persona.id,
            rolId: roleId,
            passwordHash,
            isActive: true,
            isFirstLogin: true,
          },
        });
      }

      // D. Crear Especialista
      const especialista = await tx.especialista.create({
        data: {
          personaId: persona.id,
          nivelEducativo: data.nivelEducativo,
          estado: EstadoRegistro.ACTIVO,
          cargo: data.cargo || CargoNombre.ESPECIALISTA,
          condicionLaboral: data.condicionLaboral || CondicionLaboral.NOMBRADO,
          cargaLaboral: data.cargaLaboral ?? 40,
          escalaMagisterial: data.escalaMagisterial ?? null,
        },
      });

      // E. Crear EspecialistaCargo activo cuando el cargo inicial NO es
      // 'Especialista'. El mapper (`mapEspecialista`) calcula el cargo
      // efectivo desde la fila EspecialistaCargo con fechaFin IS NULL; sin
      // esa fila, el cargo efectivo cae a 'Especialista' y la persona
      // desaparece de la tabla de Jefes de Área / Jefes de Gestión aunque
      // el campo legacy `Especialista.cargo` diga lo contrario.
      const cargoInicial = data.cargo || CargoNombre.ESPECIALISTA;
      if (cargoInicial !== CargoNombre.ESPECIALISTA) {
        await tx.especialistaCargo.create({
          data: {
            id: randomUUID(),
            especialistaId: especialista.id,
            cargo: cargoInicial,
            fechaInicio: new Date(),
            fechaFin: null,
            esPrincipal: true,
          },
        });
      }

      const specialtiesToCreate: { nombre: string; esPrincipal: boolean }[] = [];

      if (data.especialidad) {
        specialtiesToCreate.push({ nombre: data.especialidad.trim(), esPrincipal: true });
      }

      if (data.especialidadesExtras && data.especialidadesExtras.length > 0) {
        for (const extra of data.especialidadesExtras) {
          const trimmed = extra.trim();
          if (
            trimmed &&
            !specialtiesToCreate.some((s) => s.nombre.toLowerCase() === trimmed.toLowerCase())
          ) {
            specialtiesToCreate.push({ nombre: trimmed, esPrincipal: false });
          }
        }
      }

      // Legacy fallback
      if (
        specialtiesToCreate.length === 0 &&
        data.especialidades &&
        data.especialidades.length > 0
      ) {
        data.especialidades.forEach((espNombre, idx) => {
          const trimmed = espNombre.trim();
          if (
            trimmed &&
            !specialtiesToCreate.some((s) => s.nombre.toLowerCase() === trimmed.toLowerCase())
          ) {
            specialtiesToCreate.push({ nombre: trimmed, esPrincipal: idx === 0 });
          }
        });
      }

      if (specialtiesToCreate.length > 0) {
        const nivel = await tx.nivelEducativo.findFirst({
          where: { nombre: data.nivelEducativo },
        });

        if (nivel) {
          for (const item of specialtiesToCreate) {
            const especialidadEntity = await tx.especialidad.upsert({
              where: {
                nombre_nivelEducativoId: {
                  nombre: item.nombre,
                  nivelEducativoId: nivel.id,
                },
              },
              update: {},
              create: {
                nombre: item.nombre,
                nivelEducativoId: nivel.id,
                isActive: true,
              },
            });

            await tx.especialistaEspecialidad.create({
              data: {
                especialistaId: especialista.id,
                especialidadId: especialidadEntity.id,
                esPrincipal: item.esPrincipal,
              },
            });
          }
        }
      }

      const fullEsp = await tx.especialista.findUniqueOrThrow({
        where: { id: especialista.id },
        include: {
          persona: {
            include: {
              usuario: {
                include: {
                  rol: true,
                },
              },
            },
          },
          especialidades: {
            include: { especialidad: true },
          },
          cargos: true,
        },
      });

      return this.mapEspecialista(fullEsp);
    });
  }

  async update(
    id: string,
    data: IUpdateEspecialistaRequest,
    roleId?: string,
  ): Promise<IEspecialistaResponse> {
    const esp = await this.prisma.especialista.findUnique({
      where: { id },
      include: {
        especialidades: {
          include: { especialidad: true },
        },
        cargos: { where: { fechaFin: null } },
      },
    });
    if (!esp) {
      throw new NotFoundException(`Especialista con ID ${id} no encontrado.`);
    }

    // Cargo efectivo actual = el EspecialistaCargo activo, o 'Especialista'
    // si no hay ninguno. Se usa para decidir si el update cambia el cargo
    // y, por ende, requiere sincronizar la tabla EspecialistaCargo.
    const cargoActivoActual = esp.cargos[0]?.cargo ?? CargoNombre.ESPECIALISTA;
    const cargoCambio = data.cargo && data.cargo !== cargoActivoActual;

    return await this.prisma.$transaction(async (tx) => {
      // A. Actualizar Persona (dni bloqueado)
      await tx.persona.update({
        where: { id: esp.personaId },
        data: {
          nombres: data.nombres,
          apellidos: data.apellidos,
          correo: data.correo !== undefined ? data.correo || null : undefined,
          telefono: data.telefono !== undefined ? data.telefono || null : undefined,
        },
      });

      // B. Actualizar Rol en tabla Usuario si corresponde
      if (roleId) {
        await tx.usuario.update({
          where: { personaId: esp.personaId },
          data: {
            rolId: roleId,
          },
        });
      }

      // C. Actualizar Especialista (nivel, estado)
      await tx.especialista.update({
        where: { id },
        data: {
          nivelEducativo: data.nivelEducativo,
          estado: data.estado,
          ...(data.cargo && { cargo: data.cargo }),
          ...(data.condicionLaboral && { condicionLaboral: data.condicionLaboral }),
          cargaLaboral: data.cargaLaboral !== undefined ? data.cargaLaboral : undefined,
          escalaMagisterial:
            data.escalaMagisterial !== undefined ? data.escalaMagisterial : undefined,
        },
      });

      // C.2 Sincronizar EspecialistaCargo cuando el cargo cambió. El mapper
      // (`mapEspecialista`) calcula el cargo efectivo desde la fila
      // EspecialistaCargo con fechaFin IS NULL; actualizar sólo el campo
      // legacy `Especialista.cargo` no basta para que la persona aparezca
      // en la tabla de Jefes de Área / Jefes de Gestión. Por eso, al cambiar
      // el cargo: (1) finalizar el cargo activo actual (si lo hay) y
      // (2) crear un nuevo EspecialistaCargo activo cuando el cargo destino
      // no sea 'Especialista' (demisión: sólo se finaliza, sin crear nuevo).
      if (cargoCambio) {
        await tx.especialistaCargo.updateMany({
          where: { especialistaId: id, fechaFin: null },
          data: { fechaFin: new Date() },
        });
        if (data.cargo !== CargoNombre.ESPECIALISTA) {
          await tx.especialistaCargo.create({
            data: {
              id: randomUUID(),
              especialistaId: id,
              cargo: data.cargo,
              fechaInicio: new Date(),
              fechaFin: null,
              esPrincipal: true,
            },
          });
        }
      }

      if (
        data.especialidad !== undefined ||
        data.especialidadesExtras !== undefined ||
        data.especialidades !== undefined
      ) {
        await tx.especialistaEspecialidad.deleteMany({
          where: { especialistaId: id },
        });

        const specialtiesToCreate: { nombre: string; esPrincipal: boolean }[] = [];

        let mainSpecialty = data.especialidad;
        if (mainSpecialty === undefined) {
          // If not provided in update, check if there was a previous main specialty in esp
          const prevMain = esp.especialidades.find((e: any) => e.esPrincipal);
          mainSpecialty = prevMain?.especialidad?.nombre;
        }

        if (mainSpecialty) {
          specialtiesToCreate.push({ nombre: mainSpecialty.trim(), esPrincipal: true });
        }

        let extraSpecialties = data.especialidadesExtras;
        if (extraSpecialties === undefined) {
          if (data.especialidades) {
            extraSpecialties = data.especialidades.filter(
              (e: string) => e.trim() && e.trim() !== mainSpecialty,
            );
          } else {
            const prevExtras = esp.especialidades.filter((e: any) => !e.esPrincipal);
            extraSpecialties = prevExtras.map((e: any) => e.especialidad.nombre);
          }
        }

        if (extraSpecialties && extraSpecialties.length > 0) {
          for (const extra of extraSpecialties) {
            const trimmed = extra.trim();
            if (
              trimmed &&
              !specialtiesToCreate.some((s) => s.nombre.toLowerCase() === trimmed.toLowerCase())
            ) {
              specialtiesToCreate.push({ nombre: trimmed, esPrincipal: false });
            }
          }
        }

        // Legacy fallback
        if (
          specialtiesToCreate.length === 0 &&
          data.especialidades &&
          data.especialidades.length > 0
        ) {
          data.especialidades.forEach((espNombre, idx) => {
            const trimmed = espNombre.trim();
            if (
              trimmed &&
              !specialtiesToCreate.some((s) => s.nombre.toLowerCase() === trimmed.toLowerCase())
            ) {
              specialtiesToCreate.push({ nombre: trimmed, esPrincipal: idx === 0 });
            }
          });
        }

        if (specialtiesToCreate.length > 0) {
          const currentNivel = data.nivelEducativo || esp.nivelEducativo;
          const nivel = await tx.nivelEducativo.findFirst({
            where: { nombre: currentNivel },
          });

          if (nivel) {
            for (const item of specialtiesToCreate) {
              const especialidadEntity = await tx.especialidad.upsert({
                where: {
                  nombre_nivelEducativoId: {
                    nombre: item.nombre,
                    nivelEducativoId: nivel.id,
                  },
                },
                update: {},
                create: {
                  nombre: item.nombre,
                  nivelEducativoId: nivel.id,
                  isActive: true,
                },
              });

              await tx.especialistaEspecialidad.create({
                data: {
                  especialistaId: id,
                  especialidadId: especialidadEntity.id,
                  esPrincipal: item.esPrincipal,
                },
              });
            }
          }
        }
      }

      const fullEsp = await tx.especialista.findUniqueOrThrow({
        where: { id },
        include: {
          persona: {
            include: {
              usuario: {
                include: {
                  rol: true,
                },
              },
            },
          },
          especialidades: {
            include: { especialidad: true },
          },
          cargos: true,
        },
      });

      return this.mapEspecialista(fullEsp);
    });
  }

  async delete(id: string): Promise<IEspecialistaResponse> {
    const esp = await this.prisma.especialista.findUnique({
      where: { id },
      include: {
        cargos: { where: { fechaFin: null } },
        persona: { include: { usuario: { include: { rol: true } } } },
      },
    });
    if (!esp) {
      throw new NotFoundException(`Especialista con ID ${id} no encontrado.`);
    }

    let count = 0n;
    try {
      const result = await this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM visitas_monitoreo WHERE especialista_id = ${id}::uuid
      `;
      count = result[0]?.count ?? 0n;
    } catch (err: unknown) {
      // Si la tabla "visitas_monitoreo" no existe en la base de datos (PostgreSQL 42P01 / Prisma P2010),
      // asumimos que el especialista tiene 0 visitas registradas.
      const error = err as { message?: string; meta?: { message?: string } };
      const isTableMissing =
        error.message?.includes('42P01') ||
        error.meta?.message?.includes('42P01') ||
        String(err).includes('42P01');
      if (isTableMissing) {
        count = 0n;
      } else {
        throw err;
      }
    }

    if (count > 0n) {
      throw new UnprocessableEntityException(
        `No se puede inactivar: el especialista tiene ${count} visita(s) de monitoreo registrada(s).`,
      );
    }

    // El "deactivate" de un Especialista es semánticamente "quitar el cargo
    // activo" (NO inactivar al Especialista entero). El Especialista sigue
    // activo y útil como Especialista regular; sólo se le retira el cargo
    // específico (Jefe de Área / Jefe de Gestión). Por eso:
    //   - Especialista.estado se mantiene en 'Activo'
    //   - Usuario.isActive se mantiene en true
    //   - El EspecialistaCargo activo se finaliza (fechaFin=NOW)
    //   - Especialista.cargo (legacy) se sincroniza a 'Especialista'
    //   - Si el Usuario tenía rol 'jefe_area' (porque tenía un cargo de Jefe
    //     de Área activo o legacy), se le baja a 'especialista' para que
    //     pierda las capabilities de jefe_area. La decisión se basa en el
    //     ROL del Usuario (no en el cargo activo) porque el rol es la
    //     fuente de capabilities: aunque ya no haya cargo activo, mantener
    //     'jefe_area' le daría acceso a las rutas de Jefes de Área.

    const rolCodigo = esp.persona?.usuario?.rol?.codigo;

    return await this.prisma.$transaction(async (tx) => {
      // Finalizar el EspecialistaCargo activo (si lo hay).
      const fin = new Date();
      await tx.especialistaCargo.updateMany({
        where: { especialistaId: id, fechaFin: null },
        data: { fechaFin: fin },
      });

      // Sincronizar el campo espejo.
      await tx.especialista.update({
        where: { id },
        data: { cargo: 'Especialista' },
      });

      // Si el Usuario tenía rol 'jefe_area', bajarlo a 'especialista'.
      // (No se baja de 'jefe_gestion' porque el usuario mantiene ese rol
      // jerárquico independientemente del cargo de Especialista.)
      if (rolCodigo === 'jefe_area') {
        const rolJefeArea = await tx.role.findUnique({
          where: { codigo: 'jefe_area' },
        });
        const rolEspecialista = await tx.role.findUnique({
          where: { codigo: 'especialista' },
        });
        if (rolJefeArea && rolEspecialista) {
          await tx.usuario.updateMany({
            where: { personaId: esp.personaId, rolId: rolJefeArea.id },
            data: { rolId: rolEspecialista.id },
          });
        }
      }

      const fullEsp = await tx.especialista.findUniqueOrThrow({
        where: { id },
        include: {
          persona: {
            include: {
              usuario: {
                include: {
                  rol: true,
                },
              },
            },
          },
          especialidades: {
            include: { especialidad: true },
          },
          cargos: true,
        },
      });

      return this.mapEspecialista(fullEsp);
    });
  }

  async activate(id: string): Promise<IEspecialistaResponse> {
    const esp = await this.prisma.especialista.findUnique({
      where: { id },
    });
    if (!esp) {
      throw new NotFoundException(`Especialista con ID ${id} no encontrado.`);
    }

    return await this.prisma.$transaction(async (tx) => {
      // Activar usuario asociado
      await tx.usuario.updateMany({
        where: { personaId: esp.personaId },
        data: { isActive: true },
      });

      // Activar especialista. No se restaura automáticamente un cargo
      // anterior (EspecialistaCargo): el Especialista queda como
      // Especialista regular. El admin debe agregar un nuevo cargo via
      // POST /especialistas/:id/cargos si quiere devolverlo a Jefe de
      // Área u otro rol.
      await tx.especialista.update({
        where: { id },
        data: { estado: EstadoRegistro.ACTIVO },
      });

      const fullEsp = await tx.especialista.findUniqueOrThrow({
        where: { id },
        include: {
          persona: {
            include: {
              usuario: {
                include: {
                  rol: true,
                },
              },
            },
          },
          especialidades: {
            include: { especialidad: true },
          },
          cargos: true,
        },
      });

      return this.mapEspecialista(fullEsp);
    });
  }

  async deactivate(id: string): Promise<IEspecialistaResponse> {
    return this.delete(id);
  }

  async findUserIdByEspecialistaId(especialistaId: string): Promise<string | null> {
    const esp = await this.prisma.especialista.findUnique({
      where: { id: especialistaId },
      select: { persona: { select: { usuario: { select: { id: true } } } } },
    });
    return esp?.persona?.usuario?.id ?? null;
  }

  async findCargosByEspecialistaId(especialistaId: string): Promise<CargoRecord[]> {
    return this.prisma.especialistaCargo.findMany({
      where: { especialistaId },
      orderBy: [{ fechaFin: 'asc' }, { fechaInicio: 'desc' }],
    });
  }

  async findCargoById(id: string): Promise<CargoRecord | null> {
    return this.prisma.especialistaCargo.findUnique({
      where: { id },
    });
  }

  async countActiveCargos(especialistaId: string): Promise<number> {
    return this.prisma.especialistaCargo.count({
      where: { especialistaId, fechaFin: null },
    });
  }

  async createCargo(especialistaId: string, cargo: string, fechaInicio: Date): Promise<CargoRecord> {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.especialistaCargo.create({
        data: {
          id: randomUUID(),
          especialistaId,
          cargo,
          fechaInicio,
          fechaFin: null,
          esPrincipal: true,
        },
      });
      await tx.especialista.update({
        where: { id: especialistaId },
        data: { cargo },
      });
      return created;
    });
  }

  async finalizeCargo(especialistaId: string, cargoId: string, fechaFin: Date, cargoValue: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.especialistaCargo.update({
        where: { id: cargoId },
        data: { fechaFin },
      });
      await tx.especialista.update({
        where: { id: especialistaId },
        data: { cargo: cargoValue },
      });
    });
  }
}
