import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type {
  DestinatarioAlerta,
  ICrearAlertaInstitucionResponse,
  INotificacionesResponse,
  IResultadoNotificacion,
} from '@sistema-monitoreo/shared-contracts';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { MailerService } from '../../../shared/mailer/mailer.service.js';
import { CrearAlertaInstitucionDto } from '../dto/crear-alerta.dto.js';

const TIPO_ALERTA = 'ALERTA_INSTITUCION';

interface Emisor {
  id: string;
  nombre: string;
}

/** Destinatario resuelto a partir de la base de datos. */
interface Destinatario {
  rol: DestinatarioAlerta;
  usuarioId: string | null;
  nombre: string;
  correo: string | null;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

  async crearAlertaInstitucion(
    dto: CrearAlertaInstitucionDto,
    emisor: Emisor,
  ): Promise<ICrearAlertaInstitucionResponse> {
    const institucion = await this.prisma.institucionEducativa.findUnique({
      where: { id: dto.institucionId },
      select: { id: true, nombre: true, distrito: true },
    });
    if (!institucion) {
      throw new NotFoundException('Institución no encontrada.');
    }

    const contexto = await this.contextoInstitucion(dto.institucionId);
    const resultados: IResultadoNotificacion[] = [];

    for (const rol of new Set(dto.destinatarios)) {
      const destinatarios = await this.resolverDestinatarios(rol, dto.institucionId);
      if (destinatarios.length === 0) {
        resultados.push({
          rol,
          nombre: null,
          inApp: false,
          email: false,
          motivo:
            rol === 'director_ie'
              ? 'La IE no tiene Director registrado.'
              : 'No hay Jefe de Gestión activo.',
        });
        continue;
      }

      for (const d of destinatarios) {
        const titulo = dto.docenteNombre
          ? `Atención requerida: ${dto.docenteNombre}`
          : `Atención requerida: ${institucion.nombre}`;
        const cuerpo = this.componerMensaje(
          institucion.nombre,
          dto.docenteNombre ?? null,
          contexto,
          dto.mensaje,
          emisor.nombre,
        );

        let inApp = false;
        if (d.usuarioId) {
          await this.prisma.notificacion.create({
            data: {
              destinatarioId: d.usuarioId,
              emisorId: emisor.id,
              tipo: TIPO_ALERTA,
              titulo,
              mensaje: cuerpo,
              institucionId: dto.institucionId,
            },
          });
          inApp = true;
        }

        let email = false;
        if (d.correo) {
          email = await this.enviarCorreoBestEffort(d.correo, titulo, cuerpo);
        }

        resultados.push({
          rol,
          nombre: d.nombre,
          inApp,
          email,
          motivo:
            !inApp && !email ? 'El destinatario no tiene usuario ni correo registrado.' : undefined,
        });
      }
    }

    return { resultados };
  }

  /**
   * Crea notificaciones in-app para varios usuarios (+ correo best-effort).
   * Reutilizable por otros módulos (solicitudes de visita, cron de alertas).
   *
   * El in-app es el canal confiable: se persiste en un único INSERT (`createMany`)
   * y se espera. El correo es best-effort: se dispara en paralelo y en segundo
   * plano, de modo que su latencia o fallo no bloquee al llamador.
   */
  async crearNotificaciones(
    destinatarios: { usuarioId: string; correo?: string | null }[],
    meta: {
      tipo: string;
      titulo: string;
      mensaje: string;
      institucionId?: string | null;
      emisorId?: string | null;
    },
  ): Promise<void> {
    // Deduplica por usuario conservando el primer correo asociado.
    const unicos = [...new Map(destinatarios.map((d) => [d.usuarioId, d])).values()];
    if (unicos.length === 0) return;

    // 1. Canal confiable (in-app): un solo INSERT para todos los destinatarios.
    await this.prisma.notificacion.createMany({
      data: unicos.map((d) => ({
        destinatarioId: d.usuarioId,
        emisorId: meta.emisorId ?? null,
        tipo: meta.tipo,
        titulo: meta.titulo,
        mensaje: meta.mensaje,
        institucionId: meta.institucionId ?? null,
      })),
    });

    // 2. Correo best-effort: en paralelo y sin bloquear la respuesta.
    const conCorreo = unicos.filter((d) => d.correo);
    if (conCorreo.length > 0) {
      void Promise.allSettled(
        conCorreo.map((d) => this.enviarCorreoBestEffort(d.correo!, meta.titulo, meta.mensaje)),
      );
    }
  }

  async listar(usuarioId: string): Promise<INotificacionesResponse> {
    const [rows, noLeidas] = await Promise.all([
      this.prisma.notificacion.findMany({
        where: { destinatarioId: usuarioId },
        orderBy: { createdAt: 'desc' },
        take: 30,
        include: {
          emisor: { select: { persona: { select: { nombres: true, apellidos: true } } } },
        },
      }),
      this.prisma.notificacion.count({ where: { destinatarioId: usuarioId, leida: false } }),
    ]);

    return {
      noLeidas,
      items: rows.map((n) => ({
        id: n.id,
        tipo: n.tipo,
        titulo: n.titulo,
        mensaje: n.mensaje,
        institucionId: n.institucionId,
        leida: n.leida,
        createdAt: n.createdAt.toISOString(),
        emisorNombre: n.emisor
          ? `${n.emisor.persona.nombres} ${n.emisor.persona.apellidos}`.trim()
          : null,
      })),
    };
  }

  async marcarLeida(usuarioId: string, id: string): Promise<void> {
    await this.prisma.notificacion.updateMany({
      where: { id, destinatarioId: usuarioId, leida: false },
      data: { leida: true, leidaAt: new Date() },
    });
  }

  async marcarTodasLeidas(usuarioId: string): Promise<void> {
    await this.prisma.notificacion.updateMany({
      where: { destinatarioId: usuarioId, leida: false },
      data: { leida: true, leidaAt: new Date() },
    });
  }

  // ── Notificaciones de Reprogramación de Visitas ──────────────────────

  /**
   * Envía notificaciones cuando se registra una Solicitud de Reprogramación.
   */
  async notificarSolicitudReprogramacionCreada(solicitudId: string): Promise<void> {
    try {
      const s = await this.prisma.solicitudReprogramacion.findUnique({
        where: { id: solicitudId },
        include: {
          cronograma: {
            include: {
              institucion: true,
              monitor: { include: { persona: { include: { usuario: true } } } },
              evaluado: { include: { persona: { include: { usuario: true } } } },
            },
          },
          solicitante: { include: { persona: true } },
        },
      });
      if (!s || !s.cronograma) return;

      const c = s.cronograma;
      const ieNombre = c.institucion?.nombre ?? 'Institución Educativa';
      const fechaOrigStr = s.fechaOriginal
        ? new Date(s.fechaOriginal).toLocaleDateString('es-PE')
        : '';
      const fechaPropStr = s.fechaPropuesta
        ? new Date(s.fechaPropuesta).toLocaleDateString('es-PE')
        : '';
      const solicitanteNombre = s.solicitante?.persona
        ? `${s.solicitante.persona.nombres} ${s.solicitante.persona.apellidos}`.trim()
        : 'Un usuario';

      const titulo = `Solicitud de Reprogramación - ${ieNombre}`;
      const mensaje = `${solicitanteNombre} ha solicitado reprogramar la visita a la IE ${ieNombre} (${fechaOrigStr}). Nueva fecha propuesta: ${fechaPropStr} a las ${s.horaPropuesta}. Justificación: ${s.justificacion}`;

      const destinatarios: { usuarioId: string; correo?: string | null }[] = [];

      if (c.monitor?.persona?.usuario?.id) {
        destinatarios.push({
          usuarioId: c.monitor.persona.usuario.id,
          correo: c.monitor.persona.correo,
        });
      }
      if (c.evaluado?.persona?.usuario?.id) {
        destinatarios.push({
          usuarioId: c.evaluado.persona.usuario.id,
          correo: c.evaluado.persona.correo,
        });
      }

      // Jefes de Gestión
      const jefes = await this.prisma.usuario.findMany({
        where: { rol: { codigo: 'jefe_gestion' }, isActive: true },
        select: { id: true, persona: { select: { correo: true } } },
      });
      for (const j of jefes) {
        destinatarios.push({ usuarioId: j.id, correo: j.persona?.correo });
      }

      // Jefe de Área del nivel correspondiente
      const jefesArea = await this.prisma.especialista.findMany({
        where: { cargo: 'Jefe de Área', nivelEducativo: c.nivelEducativo, estado: 'Activo' },
        select: { persona: { select: { correo: true, usuario: { select: { id: true } } } } },
      });
      for (const ja of jefesArea) {
        if (ja.persona?.usuario?.id) {
          destinatarios.push({ usuarioId: ja.persona.usuario.id, correo: ja.persona.correo });
        }
      }

      // Director IE si la institución tiene director
      if (c.institucionId) {
        const dir = await this.prisma.docente.findFirst({
          where: {
            institucionId: c.institucionId,
            docenteCargos: { some: { cargo: { nombre: 'Director' }, fechaFin: null } },
          },
          select: { persona: { select: { correo: true, usuario: { select: { id: true } } } } },
        });
        if (dir?.persona?.usuario?.id) {
          destinatarios.push({ usuarioId: dir.persona.usuario.id, correo: dir.persona.correo });
        }
      }

      await this.crearNotificaciones(destinatarios, {
        tipo: 'SOLICITUD_REPROGRAMACION_CREADA',
        titulo,
        mensaje,
        institucionId: c.institucionId,
        emisorId: s.solicitanteId,
      });
    } catch (err) {
      this.logger.error(
        `Error al notificar solicitud reprogramacion creada (${solicitudId}):`,
        err,
      );
    }
  }

  /**
   * Envía notificaciones cuando se Aprueba o Rechaza una Solicitud de Reprogramación.
   */
  async notificarSolicitudReprogramacionResuelta(
    solicitudId: string,
    resolutorId: string,
    estado: 'APROBADO' | 'RECHAZADO',
    comentario?: string,
  ): Promise<void> {
    try {
      const s = await this.prisma.solicitudReprogramacion.findUnique({
        where: { id: solicitudId },
        include: {
          cronograma: {
            include: {
              institucion: true,
              monitor: { include: { persona: { include: { usuario: true } } } },
              evaluado: { include: { persona: { include: { usuario: true } } } },
            },
          },
        },
      });
      if (!s || !s.cronograma) return;

      const c = s.cronograma;
      const ieNombre = c.institucion?.nombre ?? 'Institución Educativa';
      const fechaOrigStr = s.fechaOriginal
        ? new Date(s.fechaOriginal).toLocaleDateString('es-PE')
        : '';
      const fechaPropStr = s.fechaPropuesta
        ? new Date(s.fechaPropuesta).toLocaleDateString('es-PE')
        : '';

      const esAprobado = estado === 'APROBADO';
      const titulo = esAprobado
        ? `Reprogramación APROBADA - ${ieNombre}`
        : `Reprogramación RECHAZADA - ${ieNombre}`;

      const mensaje = esAprobado
        ? `La solicitud de reprogramación para la visita a la IE ${ieNombre} (${fechaOrigStr}) ha sido APROBADA. La nueva fecha programada es el ${fechaPropStr} a las ${s.horaPropuesta}.`
        : `La solicitud de reprogramación para la visita a la IE ${ieNombre} (${fechaOrigStr}) ha sido RECHAZADA.${comentario ? ' Motivo: ' + comentario : ''}`;

      const destinatarios: { usuarioId: string; correo?: string | null }[] = [];

      // Solicitante
      if (s.solicitanteId) {
        const solUsuario = await this.prisma.usuario.findUnique({
          where: { id: s.solicitanteId },
          select: { id: true, persona: { select: { correo: true } } },
        });
        if (solUsuario) {
          destinatarios.push({ usuarioId: solUsuario.id, correo: solUsuario.persona?.correo });
        }
      }

      // Monitor
      if (c.monitor?.persona?.usuario?.id) {
        destinatarios.push({
          usuarioId: c.monitor.persona.usuario.id,
          correo: c.monitor.persona.correo,
        });
      }

      // Evaluado
      if (c.evaluado?.persona?.usuario?.id) {
        destinatarios.push({
          usuarioId: c.evaluado.persona.usuario.id,
          correo: c.evaluado.persona.correo,
        });
      }

      await this.crearNotificaciones(destinatarios, {
        tipo: esAprobado ? 'REPROGRAMACION_APROBADA' : 'REPROGRAMACION_RECHAZADA',
        titulo,
        mensaje,
        institucionId: c.institucionId,
        emisorId: resolutorId,
      });
    } catch (err) {
      this.logger.error(
        `Error al notificar solicitud reprogramacion resuelta (${solicitudId}):`,
        err,
      );
    }
  }

  /**
   * Envía notificaciones cuando un Cronograma es actualizado o reprogramado directamente.
   */
  async notificarCronogramaReprogramado(cronogramaId: string, emisorId?: string): Promise<void> {
    try {
      const c = await this.prisma.cronograma.findUnique({
        where: { id: cronogramaId },
        include: {
          institucion: true,
          monitor: { include: { persona: { include: { usuario: true } } } },
          evaluado: { include: { persona: { include: { usuario: true } } } },
        },
      });
      if (!c) return;

      const ieNombre = c.institucion?.nombre ?? 'Institución Educativa';
      const fechaStr = c.fechaProgramada
        ? new Date(c.fechaProgramada).toLocaleDateString('es-PE')
        : '';

      const titulo = `Visita Reprogramada - ${ieNombre}`;
      const mensaje = `El cronograma de visita a la IE ${ieNombre} ha sido reprogramado / actualizado. Nueva fecha: ${fechaStr} a las ${c.horaInicio}. Estado: ${c.estado}.`;

      const destinatarios: { usuarioId: string; correo?: string | null }[] = [];

      if (c.monitor?.persona?.usuario?.id) {
        destinatarios.push({
          usuarioId: c.monitor.persona.usuario.id,
          correo: c.monitor.persona.correo,
        });
      }
      if (c.evaluado?.persona?.usuario?.id) {
        destinatarios.push({
          usuarioId: c.evaluado.persona.usuario.id,
          correo: c.evaluado.persona.correo,
        });
      }

      await this.crearNotificaciones(destinatarios, {
        tipo: 'CRONOGRAMA_REPROGRAMADO',
        titulo,
        mensaje,
        institucionId: c.institucionId,
        emisorId: emisorId ?? null,
      });
    } catch (err) {
      this.logger.error(`Error al notificar cronograma reprogramado (${cronogramaId}):`, err);
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────

  private async resolverDestinatarios(
    rol: DestinatarioAlerta,
    institucionId: string,
  ): Promise<Destinatario[]> {
    if (rol === 'director_ie') {
      const docente = await this.prisma.docente.findFirst({
        where: {
          institucionId,
          docenteCargos: { some: { cargo: { nombre: 'Director' }, fechaFin: null } },
        },
        select: {
          persona: {
            select: {
              nombres: true,
              apellidos: true,
              correo: true,
              usuario: { select: { id: true } },
            },
          },
        },
      });
      if (!docente) return [];
      const p = docente.persona;
      return [
        {
          rol,
          usuarioId: p.usuario?.id ?? null,
          nombre: `${p.nombres} ${p.apellidos}`.trim(),
          correo: p.correo,
        },
      ];
    }

    // jefe_gestion
    const jefes = await this.prisma.usuario.findMany({
      where: { rol: { codigo: 'jefe_gestion' }, isActive: true },
      select: { id: true, persona: { select: { nombres: true, apellidos: true, correo: true } } },
    });
    return jefes.map((j) => ({
      rol,
      usuarioId: j.id,
      nombre: `${j.persona.nombres} ${j.persona.apellidos}`.trim(),
      correo: j.persona.correo,
    }));
  }

  private async contextoInstitucion(institucionId: string): Promise<string | null> {
    const agg = await this.prisma.fichaMonitoreo.aggregate({
      where: { estado: 'FINALIZADO', cronograma: { institucionId } },
      _avg: { promedio: true },
    });
    if (agg._avg.promedio === null) return null;
    const prom = Number(agg._avg.promedio);
    const nivel =
      prom <= 1.5
        ? 'INICIO'
        : prom <= 2.5
          ? 'EN_PROCESO'
          : prom <= 3.5
            ? 'LOGRO_ESPERADO'
            : 'LOGRO_DESTACADO';
    return `Promedio institucional actual: ${prom.toFixed(2)} (${nivel}).`;
  }

  private componerMensaje(
    ieNombre: string,
    docenteNombre: string | null,
    contexto: string | null,
    mensaje: string | undefined,
    emisorNombre: string,
  ): string {
    const lead = docenteNombre
      ? `La UGEL (${emisorNombre}) solicita atención sobre el docente ${docenteNombre} de la IE ${ieNombre}.`
      : `La UGEL (${emisorNombre}) solicita atención sobre la institución ${ieNombre}.`;
    const partes = [lead];
    if (contexto) partes.push(contexto);
    if (mensaje?.trim()) partes.push(`Mensaje: ${mensaje.trim()}`);
    return partes.join(' ');
  }

  private async enviarCorreoBestEffort(
    to: string,
    subject: string,
    texto: string,
  ): Promise<boolean> {
    try {
      const html = `<p>${texto.replace(/</g, '&lt;')}</p>`;
      await this.mailer.sendMail(to, subject, texto, html);
      return true;
    } catch (error) {
      // El correo es best-effort: su fallo no debe romper la notificación in-app.
      this.logger.warn(`No se pudo enviar el correo a ${to}: ${(error as Error).message}`);
      return false;
    }
  }
}
