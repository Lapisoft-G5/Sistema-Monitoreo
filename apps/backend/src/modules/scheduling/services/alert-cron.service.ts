import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { MailerService } from '../../../shared/mailer/mailer.service.js';

@Injectable()
export class AlertCronService {
  private readonly logger = new Logger(AlertCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

  // Se ejecuta todos los días a las 00:00 (medianoche)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredCronogramas() {
    this.logger.log('Iniciando tarea de revisión de cronogramas vencidos...');

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Inicio del día actual

    try {
      const vencidos = await this.prisma.cronograma.findMany({
        where: {
          estado: 'PROGRAMADO',
          alertaVencimientoEnviada: false,
          fechaProgramada: {
            lt: hoy, // Estrictamente menor a hoy = vencido
          },
        },
        include: {
          monitor: {
            include: {
              persona: true,
            },
          },
          evaluado: {
            include: {
              persona: true,
            },
          },
          institucion: true,
        },
      });

      if (vencidos.length === 0) {
        this.logger.log('No se encontraron cronogramas vencidos pendientes de notificación.');
        return;
      }

      this.logger.log(`Se encontraron ${vencidos.length} cronograma(s) vencido(s). Procesando alertas...`);

      for (const cronograma of vencidos) {
        try {
          const emailMonitor = cronograma.monitor.persona.correo;
          if (emailMonitor) {
            const fechaStr = cronograma.fechaProgramada.toLocaleDateString('es-PE');
            const institucionStr = `${cronograma.institucion.codigoModular} - ${cronograma.institucion.nombre}`;
            const docenteStr = `${cronograma.evaluado.persona.nombres} ${cronograma.evaluado.persona.apellidos}`;

            await this.mailer.sendCronogramaVencidoEmail(
              emailMonitor,
              fechaStr,
              institucionStr,
              docenteStr,
            );

            // Marcar como enviada para no repetir
            await this.prisma.cronograma.update({
              where: { id: cronograma.id },
              data: { alertaVencimientoEnviada: true },
            });

            this.logger.log(`Alerta enviada para el cronograma ${cronograma.id} a ${emailMonitor}`);
          } else {
            this.logger.warn(`El monitor del cronograma ${cronograma.id} no tiene un correo registrado.`);
          }
        } catch (err) {
          this.logger.error(`Fallo al procesar la alerta para el cronograma ${cronograma.id}`, err);
        }
      }

      this.logger.log('Tarea de revisión de cronogramas finalizada.');
    } catch (error) {
      this.logger.error('Error al ejecutar la revisión de cronogramas vencidos', error);
    }
  }
}
