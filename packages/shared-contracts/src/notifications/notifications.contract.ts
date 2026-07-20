/**
 * Contrato de notificaciones.
 *
 * Canal confiable: in-app (tabla `notificaciones`). El correo es best-effort:
 * se intenta con el MailerService, pero su fallo no rompe la notificación in-app.
 */

export type NotificacionTipo = 'ALERTA_INSTITUCION';

/** Destinatarios posibles de una alerta de institución. */
export type DestinatarioAlerta = 'director_ie' | 'jefe_gestion';

export interface INotificacion {
  id: string;
  tipo: NotificacionTipo | string;
  titulo: string;
  mensaje: string;
  institucionId: string | null;
  leida: boolean;
  /** ISO 8601. */
  createdAt: string;
  emisorNombre: string | null;
}

export interface INotificacionesResponse {
  items: INotificacion[];
  noLeidas: number;
}

export interface ICrearAlertaInstitucionRequest {
  institucionId: string;
  destinatarios: DestinatarioAlerta[];
  mensaje?: string;
}

/** Resultado de un destinatario notificado (o por qué se omitió). */
export interface IResultadoNotificacion {
  rol: DestinatarioAlerta;
  nombre: string | null;
  /** true si se creó la notificación in-app. */
  inApp: boolean;
  /** true si se intentó/envió el correo. */
  email: boolean;
  /** Motivo si no se pudo notificar por algún canal. */
  motivo?: string;
}

export interface ICrearAlertaInstitucionResponse {
  resultados: IResultadoNotificacion[];
}
