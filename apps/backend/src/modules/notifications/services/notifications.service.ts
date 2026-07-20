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
        const titulo = `Atención requerida: ${institucion.nombre}`;
        const cuerpo = this.componerMensaje(institucion.nombre, contexto, dto.mensaje, emisor.nombre);

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
            !inApp && !email
              ? 'El destinatario no tiene usuario ni correo registrado.'
              : undefined,
        });
      }
    }

    return { resultados };
  }

  /**
   * Crea notificaciones in-app para varios usuarios (+ correo best-effort).
   * Reutilizable por otros módulos (solicitudes de visita, cron de alertas).
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
    const vistos = new Set<string>();
    for (const d of destinatarios) {
      if (vistos.has(d.usuarioId)) continue;
      vistos.add(d.usuarioId);
      await this.prisma.notificacion.create({
        data: {
          destinatarioId: d.usuarioId,
          emisorId: meta.emisorId ?? null,
          tipo: meta.tipo,
          titulo: meta.titulo,
          mensaje: meta.mensaje,
          institucionId: meta.institucionId ?? null,
        },
      });
      if (d.correo) await this.enviarCorreoBestEffort(d.correo, meta.titulo, meta.mensaje);
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
            select: { nombres: true, apellidos: true, correo: true, usuario: { select: { id: true } } },
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
    const nivel = prom <= 1.5 ? 'INICIO' : prom <= 2.5 ? 'EN_PROCESO' : prom <= 3.5 ? 'LOGRO_ESPERADO' : 'LOGRO_DESTACADO';
    return `Promedio institucional actual: ${prom.toFixed(2)} (${nivel}).`;
  }

  private componerMensaje(
    ieNombre: string,
    contexto: string | null,
    mensaje: string | undefined,
    emisorNombre: string,
  ): string {
    const partes = [
      `La UGEL (${emisorNombre}) solicita atención sobre la institución ${ieNombre}.`,
    ];
    if (contexto) partes.push(contexto);
    if (mensaje?.trim()) partes.push(`Mensaje: ${mensaje.trim()}`);
    return partes.join(' ');
  }

  private async enviarCorreoBestEffort(to: string, subject: string, texto: string): Promise<boolean> {
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
