import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../services/notifications.service.js';

/**
 * Payloads de los eventos de reprogramación de visitas.
 *
 * SchedulingService los emite dentro del camino de la petición (retorno inmediato);
 * este listener los procesa de forma asíncrona (`{ async: true }`), fuera de la
 * respuesta HTTP, replicando el patrón de `ficha.finalizada`.
 */
export interface ReprogramacionSolicitadaEvent {
  solicitudId: string;
}

export interface ReprogramacionResueltaEvent {
  solicitudId: string;
  resolutorId: string;
  estado: 'APROBADO' | 'RECHAZADO';
  comentario?: string;
}

export interface CronogramaReprogramadoEvent {
  cronogramaId: string;
  emisorId?: string;
}

@Injectable()
export class ReprogramacionEventsListener {
  constructor(private readonly notifications: NotificationsService) {}

  @OnEvent('reprogramacion.solicitada', { async: true })
  async onSolicitada(event: ReprogramacionSolicitadaEvent) {
    await this.notifications.notificarSolicitudReprogramacionCreada(event.solicitudId);
  }

  @OnEvent('reprogramacion.resuelta', { async: true })
  async onResuelta(event: ReprogramacionResueltaEvent) {
    await this.notifications.notificarSolicitudReprogramacionResuelta(
      event.solicitudId,
      event.resolutorId,
      event.estado,
      event.comentario,
    );
  }

  @OnEvent('cronograma.reprogramado', { async: true })
  async onCronogramaReprogramado(event: CronogramaReprogramadoEvent) {
    await this.notifications.notificarCronogramaReprogramado(event.cronogramaId, event.emisorId);
  }
}
