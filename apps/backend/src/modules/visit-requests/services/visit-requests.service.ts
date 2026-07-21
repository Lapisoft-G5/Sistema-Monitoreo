import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  ISolicitudesVisitaResponse,
  ISolicitudVisita,
} from '@sistema-monitoreo/shared-contracts';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { NotificationsService } from '../../notifications/services/notifications.service.js';
import {
  CrearSolicitudVisitaDto,
  ResolverSolicitudVisitaDto,
} from '../dto/crear-solicitud-visita.dto.js';

type SolicitudRow = {
  id: string;
  institucionId: string;
  docenteId: string | null;
  motivo: string | null;
  prioridad: string;
  estado: string;
  createdAt: Date;
  resueltaAt: Date | null;
  institucion: { nombre: string; distrito: string };
  docente: { persona: { nombres: string; apellidos: string } } | null;
  solicitante: { persona: { nombres: string; apellidos: string } };
};

interface Solicitante {
  id: string;
  nombre: string;
}

@Injectable()
export class VisitRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async crear(dto: CrearSolicitudVisitaDto, solicitante: Solicitante): Promise<ISolicitudVisita> {
    const institucion = await this.prisma.institucionEducativa.findUnique({
      where: { id: dto.institucionId },
      select: { id: true, nombre: true, distrito: true },
    });
    if (!institucion) throw new NotFoundException('Institución no encontrada.');

    let docenteNombre: string | null = null;
    if (dto.docenteId) {
      const doc = await this.prisma.docente.findFirst({
        where: { id: dto.docenteId, institucionId: dto.institucionId },
        select: { persona: { select: { nombres: true, apellidos: true } } },
      });
      if (!doc) throw new NotFoundException('Docente no encontrado en la IE.');
      docenteNombre = `${doc.persona.nombres} ${doc.persona.apellidos}`.trim();
    }

    const pendiente = await this.prisma.solicitudVisita.findFirst({
      where: {
        estado: 'PENDIENTE',
        institucionId: dto.institucionId,
        docenteId: dto.docenteId ?? null,
      },
    });
    if (pendiente) {
      throw new ConflictException(
        docenteNombre
          ? `Ya existe una solicitud pendiente para ${docenteNombre}.`
          : 'Ya existe una solicitud de visita pendiente para esta IE.',
      );
    }

    const creada = await this.prisma.solicitudVisita.create({
      data: {
        institucionId: dto.institucionId,
        docenteId: dto.docenteId ?? null,
        solicitanteId: solicitante.id,
        motivo: dto.motivo ?? null,
        prioridad: dto.prioridad ?? 'ALTA',
      },
      include: {
        institucion: { select: { nombre: true, distrito: true } },
        docente: { select: { persona: { select: { nombres: true, apellidos: true } } } },
        solicitante: { select: { persona: { select: { nombres: true, apellidos: true } } } },
      },
    });

    // Notificar al Jefe de Gestión (in-app + correo best-effort).
    const jefes = await this.usuariosDeRol('jefe_gestion');
    if (jefes.length > 0) {
      const prioridadTxt = creada.prioridad === 'ALTA' ? 'PRIORITARIA' : 'normal';
      const objetivo = docenteNombre
        ? `al docente ${docenteNombre} de ${institucion.nombre}`
        : `a ${institucion.nombre}`;
      const mensaje =
        `${solicitante.nombre} solicita una visita de monitoreo (${prioridadTxt}) ${objetivo} (${institucion.distrito}).` +
        (dto.motivo ? ` Motivo: ${dto.motivo}` : '');
      await this.notifications.crearNotificaciones(jefes, {
        tipo: 'SOLICITUD_VISITA',
        titulo: docenteNombre
          ? `Solicitud de visita: ${docenteNombre}`
          : `Solicitud de visita: ${institucion.nombre}`,
        mensaje,
        institucionId: institucion.id,
        emisorId: solicitante.id,
      });
    }

    return this.mapSolicitud(creada);
  }

  async listar(estado?: string): Promise<ISolicitudesVisitaResponse> {
    const where = estado ? { estado } : {};
    const [rows, pendientes] = await Promise.all([
      this.prisma.solicitudVisita.findMany({
        where,
        orderBy: [{ estado: 'asc' }, { createdAt: 'desc' }],
        include: {
          institucion: { select: { nombre: true, distrito: true } },
          docente: { select: { persona: { select: { nombres: true, apellidos: true } } } },
          solicitante: { select: { persona: { select: { nombres: true, apellidos: true } } } },
        },
      }),
      this.prisma.solicitudVisita.count({ where: { estado: 'PENDIENTE' } }),
    ]);
    return { items: rows.map((r) => this.mapSolicitud(r)), pendientes };
  }

  async atender(id: string, resolutorId: string, dto: ResolverSolicitudVisitaDto): Promise<void> {
    await this.resolver(id, resolutorId, 'ATENDIDA', dto);
  }

  async rechazar(id: string, resolutorId: string, dto: ResolverSolicitudVisitaDto): Promise<void> {
    await this.resolver(id, resolutorId, 'RECHAZADA', dto);
  }

  // ── Helpers ──────────────────────────────────────────────────────────

  private async resolver(
    id: string,
    resolutorId: string,
    estado: 'ATENDIDA' | 'RECHAZADA',
    dto: ResolverSolicitudVisitaDto,
  ): Promise<void> {
    const solicitud = await this.prisma.solicitudVisita.findUnique({
      where: { id },
      include: { institucion: { select: { id: true, nombre: true } } },
    });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada.');
    if (solicitud.estado !== 'PENDIENTE') {
      throw new ConflictException('La solicitud ya fue resuelta.');
    }

    await this.prisma.solicitudVisita.update({
      where: { id },
      data: {
        estado,
        atendidaPorId: resolutorId,
        cronogramaId: dto.cronogramaId ?? null,
        comentario: dto.comentario ?? null,
        resueltaAt: new Date(),
      },
    });

    // Avisar al solicitante (Director UGEL) el resultado.
    const solicitanteCorreo = await this.correoUsuario(solicitud.solicitanteId);
    const verbo = estado === 'ATENDIDA' ? 'atendida (visita agendada)' : 'rechazada';
    await this.notifications.crearNotificaciones(
      [{ usuarioId: solicitud.solicitanteId, correo: solicitanteCorreo }],
      {
        tipo: 'SOLICITUD_RESUELTA',
        titulo: `Solicitud ${verbo}: ${solicitud.institucion.nombre}`,
        mensaje:
          `Tu solicitud de visita a ${solicitud.institucion.nombre} fue ${verbo}.` +
          (dto.comentario ? ` Comentario: ${dto.comentario}` : ''),
        institucionId: solicitud.institucion.id,
        emisorId: resolutorId,
      },
    );
  }

  private async usuariosDeRol(
    codigo: string,
  ): Promise<{ usuarioId: string; correo: string | null }[]> {
    const usuarios = await this.prisma.usuario.findMany({
      where: { rol: { codigo }, isActive: true },
      select: { id: true, persona: { select: { correo: true } } },
    });
    return usuarios.map((u) => ({ usuarioId: u.id, correo: u.persona.correo }));
  }

  private async correoUsuario(usuarioId: string): Promise<string | null> {
    const u = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { persona: { select: { correo: true } } },
    });
    return u?.persona.correo ?? null;
  }

  private mapSolicitud(r: SolicitudRow): ISolicitudVisita {
    return {
      id: r.id,
      institucionId: r.institucionId,
      institucionNombre: r.institucion.nombre,
      distrito: r.institucion.distrito,
      docenteId: r.docenteId,
      docenteNombre: r.docente
        ? `${r.docente.persona.nombres} ${r.docente.persona.apellidos}`.trim()
        : null,
      motivo: r.motivo,
      prioridad: r.prioridad,
      estado: r.estado,
      solicitanteNombre:
        `${r.solicitante.persona.nombres} ${r.solicitante.persona.apellidos}`.trim(),
      createdAt: r.createdAt.toISOString(),
      resueltaAt: r.resueltaAt ? r.resueltaAt.toISOString() : null,
    };
  }
}
