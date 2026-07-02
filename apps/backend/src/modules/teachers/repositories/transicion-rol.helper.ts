import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { CreateDocenteDto } from '../dto/create-docente.dto.js';
import { EstadoRegistro } from '../../../common/enums/estado.enum.js';
import { ConflictException } from '@nestjs/common';
import { mapDocente } from './docente-mapper.helper.js';

export async function transicionEspecialistaADocente(
  prisma: PrismaService,
  personaId: string,
  dto: CreateDocenteDto,
  rolDocenteId: string,
) {
  return prisma.$transaction(async (tx) => {
    // 1. Verificar Especialista activo
    const especialista = await tx.especialista.findUnique({
      where: { personaId },
      include: { cronogramas: { where: { estado: { notIn: ['COMPLETADO', 'CANCELADO'] } } } },
    });

    if (especialista && especialista.estado === (EstadoRegistro.ACTIVO as string)) {
      // 2. Verificar cronogramas pendientes
      if (especialista.cronogramas && especialista.cronogramas.length > 0) {
        throw new ConflictException(
          'El Especialista tiene visitas programadas pendientes. No se puede transferir a Docente hasta que finalice o cancele sus visitas.',
        );
      }

      // 3. Inactivar Especialista
      await tx.especialista.update({
        where: { id: especialista.id },
        data: { estado: EstadoRegistro.INACTIVO },
      });

      // 4. Cerrar Cargos de Especialista
      await tx.especialistaCargo.updateMany({
        where: { especialistaId: especialista.id, fechaFin: null },
        data: { fechaFin: new Date() },
      });
    }

    // 5. Crear o Reactivar Docente
    let docente = await tx.docente.findUnique({
      where: { personaId },
    });

    if (docente) {
      // Reactivar
      docente = await tx.docente.update({
        where: { id: docente.id },
        data: {
          estado: EstadoRegistro.ACTIVO,
          institucionId: dto.institucionId,
          nivelEducativo: dto.nivelEducativo,
          escalaMagisterial: dto.escalaMagisterial,
          condicionLaboral: dto.condicionLaboral,
          cursoAsignado: dto.cursoAsignado,
        },
      });

      // Actualizar cargo
      await tx.docenteCargo.updateMany({
        where: { docenteId: docente.id, fechaFin: null },
        data: { fechaFin: new Date() },
      });

      await tx.docenteCargo.create({
        data: {
          docenteId: docente.id,
          cargoId: dto.cargoId,
          fechaInicio: new Date(),
          esPrincipal: true,
        },
      });
    } else {
      // Crear
      docente = await tx.docente.create({
        data: {
          personaId,
          estado: EstadoRegistro.ACTIVO,
          institucionId: dto.institucionId,
          nivelEducativo: dto.nivelEducativo,
          escalaMagisterial: dto.escalaMagisterial,
          condicionLaboral: dto.condicionLaboral,
          cursoAsignado: dto.cursoAsignado,
          docenteCargos: {
            create: {
              cargoId: dto.cargoId,
              fechaInicio: new Date(),
              esPrincipal: true,
            },
          },
        },
      });
    }

    // Actualizar secciones
    if (dto.secciones) {
      await tx.docenteSeccion.deleteMany({
        where: { docenteId: docente.id },
      });
      if (dto.secciones.length > 0) {
        await tx.docenteSeccion.createMany({
          data: dto.secciones.map((s) => ({
            docenteId: docente.id,
            grado: s.grado,
            seccion: s.seccion,
          })),
        });
      }
    }

    // Actualizar Datos de Persona
    await tx.persona.update({
      where: { id: personaId },
      data: {
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        correo: dto.correo,
        telefono: dto.telefono,
      },
    });

    // 6. Cambiar Rol
    await tx.usuario.updateMany({
      where: { personaId },
      data: { rolId: rolDocenteId, isActive: true },
    });

    const fullDocente = await tx.docente.findUniqueOrThrow({
      where: { id: docente.id },
      include: {
        persona: true,
        docenteCargos: { include: { cargo: true } },
        docenteCursos: { include: { curso: true } },
        docenteEspecialidades: { include: { especialidad: true } },
        docenteSecciones: true,
      },
    });

    return mapDocente(fullDocente);
  });
}
