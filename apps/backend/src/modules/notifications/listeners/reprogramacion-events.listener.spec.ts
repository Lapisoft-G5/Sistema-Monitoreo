import { jest } from '@jest/globals';
import { ReprogramacionEventsListener } from './reprogramacion-events.listener.js';
import type { NotificationsService } from '../services/notifications.service.js';

describe('ReprogramacionEventsListener', () => {
  let listener: ReprogramacionEventsListener;
  let notifications: {
    notificarSolicitudReprogramacionCreada: jest.Mock;
    notificarSolicitudReprogramacionResuelta: jest.Mock;
    notificarCronogramaReprogramado: jest.Mock;
  };

  beforeEach(() => {
    notifications = {
      notificarSolicitudReprogramacionCreada: jest.fn<any>(),
      notificarSolicitudReprogramacionResuelta: jest.fn<any>(),
      notificarCronogramaReprogramado: jest.fn<any>(),
    };
    listener = new ReprogramacionEventsListener(notifications as unknown as NotificationsService);
  });

  it('reprogramacion.solicitada -> notifica solicitud creada', async () => {
    await listener.onSolicitada({ solicitudId: 'sol-1' });
    expect(notifications.notificarSolicitudReprogramacionCreada).toHaveBeenCalledWith('sol-1');
  });

  it('reprogramacion.resuelta -> notifica resuelta con estado y comentario', async () => {
    await listener.onResuelta({
      solicitudId: 'sol-2',
      resolutorId: 'jefe-1',
      estado: 'APROBADO',
      comentario: 'ok',
    });
    expect(notifications.notificarSolicitudReprogramacionResuelta).toHaveBeenCalledWith(
      'sol-2',
      'jefe-1',
      'APROBADO',
      'ok',
    );
  });

  it('cronograma.reprogramado -> notifica cronograma reprogramado', async () => {
    await listener.onCronogramaReprogramado({ cronogramaId: 'cron-1', emisorId: 'esp-1' });
    expect(notifications.notificarCronogramaReprogramado).toHaveBeenCalledWith('cron-1', 'esp-1');
  });
});
