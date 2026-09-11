import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter?: nodemailer.Transporter;
  private readonly emailFrom: string;

  constructor(private readonly configService: ConfigService) {
    const rawEmailFrom =
      this.configService.get<string>('EMAIL_FROM') ?? 'no-reply@ugel-lampa.gob.pe';
    this.emailFrom = rawEmailFrom.includes('<')
      ? rawEmailFrom
      : `"UGEL Lampa - Sistema de Monitoreo" <${rawEmailFrom}>`;
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT') ?? 1025;
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host) {
      this.logger.log(`Inicializando transportador SMTP: ${host}:${port}`);

      const auth = user && pass ? { user, pass } : undefined;

      /**
       * Se validan los certificados TLS por defecto.
       *
       * Estaba fijo en `rejectUnauthorized: false` «para certificados
       * autofirmados en local», pero regía también en producción: aceptaba
       * cualquier certificado, y con eso un intermediario en la red entre el
       * servidor y el SMTP podía interceptar los correos.
       *
       * Aflojarlo queda detrás de una variable explícita —`SMTP_TLS_INSECURE`—
       * para el servidor de correo local, que suele traer un certificado
       * autofirmado. En producción no se declara y la validación sigue activa.
       */
      const tlsInseguro = this.configService.get<string>('SMTP_TLS_INSECURE') === 'true';
      if (tlsInseguro) {
        this.logger.warn(
          'SMTP_TLS_INSECURE=true: no se validan los certificados TLS. Sólo para desarrollo.',
        );
      }

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // True for 465, false for others
        auth,
        tls: {
          rejectUnauthorized: !tlsInseguro,
        },
      });
    } else {
      this.logger.warn(
        'SMTP_HOST no configurado. Los correos se imprimirán únicamente en la consola de desarrollo.',
      );
    }
  }

  private wrapHtmlTemplate(title: string, preheader: string, contentHtml: string): string {
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <span style="display: none !important; visibility: hidden; mso-hide: all; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader}
  </span>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <!-- Encabezado Institucional -->
          <tr>
            <td style="background-color: #990537; padding: 24px; text-align: center; border-bottom: 3px solid #80042e;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">UGEL LAMPA</h1>
              <p style="color: #fce7ec; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">Sistema de Monitoreo Pedagógico</p>
            </td>
          </tr>
          <!-- Cuerpo del Mensaje -->
          <tr>
            <td style="padding: 28px 24px; color: #334155; font-size: 14px; line-height: 1.6;">
              ${contentHtml}
            </td>
          </tr>
          <!-- Pie Institucional -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center;">
              <p style="color: #475569; font-size: 12px; margin: 0; font-weight: 600;">Unidad de Gestión Educativa Local de Lampa</p>
              <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0 0;">Este mensaje fue generado automáticamente. Por favor no responda a este remitente.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  async sendMail(
    to: string,
    subject: string,
    text: string,
    html: string,
    attachments?: nodemailer.SendMailOptions['attachments'],
  ): Promise<void> {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.emailFrom,
          to,
          subject,
          text,
          html,
          attachments,
          headers: {
            'X-Auto-Response-Suppress': 'All',
            'Auto-Submitted': 'auto-generated',
          },
        });
        this.logger.log(`Correo enviado exitosamente a: ${to}`);
      } catch (error) {
        this.logger.error(`Fallo al enviar correo a ${to}:`, error);
        throw error;
      }
    } else {
      this.logger.log(`
┌────────────────────────────────────────────────────────┐
│ [DEV ONLY MAIL OUTPUT]
├────────────────────────────────────────────────────────┤
│ De: ${this.emailFrom}
│ Para: ${to}
│ Asunto: ${subject}
├────────────────────────────────────────────────────────┤
│ Contenido de Texto:
│ ${text}
└────────────────────────────────────────────────────────┘
      `);
    }
  }

  async sendPasswordResetEmail(
    to: string,
    nombre: string,
    dni: string,
    token: string,
    expirationMinutes = 15,
  ): Promise<void> {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/restablecer-password?token=${token}`;

    const subject = 'Recuperación de Contraseña - UGEL Lampa';
    const text =
      `SISTEMA DE MONITOREO - UGEL LAMPA\n` +
      `Recuperación de Contraseña\n` +
      `============================================================\n\n` +
      `Estimado(a) ${nombre}:\n\n` +
      `Hemos recibido una solicitud para restablecer la contraseña de su cuenta vinculada al DNI ${dni}.\n\n` +
      `Para ingresar una nueva contraseña, acceda al siguiente enlace en su navegador web:\n` +
      `${resetUrl}\n\n` +
      `DETALLES DE LA SOLICITUD:\n` +
      `- DNI / Usuario: ${dni}\n` +
      `- Correo electrónico: ${to}\n` +
      `- Tiempo de validez: ${expirationMinutes} minutos (un solo uso)\n\n` +
      `AVISO DE SEGURIDAD:\n` +
      `Si usted no solicitó este restablecimiento de contraseña, desestime este mensaje con total tranquilidad. Su contraseña actual no ha sido modificada y su cuenta permanece protegida.\n\n` +
      `------------------------------------------------------------\n` +
      `UGEL Lampa - Sistema de Monitoreo\n` +
      `Este mensaje fue generado automáticamente. Por favor no responder a este remitente.`;

    const contentHtml = `
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #1e293b;">
        Estimado(a) <strong>${nombre}</strong>:
      </p>
      <p style="margin: 0 0 20px 0; color: #334155; font-size: 14px; line-height: 1.6;">
        Hemos recibido una solicitud para restablecer la contraseña de acceso asociada a su cuenta en el <strong>Sistema de Monitoreo Pedagógico</strong>.
      </p>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fdf2f5; border: 1px solid #fce7ec; border-left: 4px solid #990537; border-radius: 6px; margin: 0 0 24px 0;">
        <tr>
          <td style="padding: 16px;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569;">
              <strong>DNI / Usuario:</strong> <span style="color: #0f172a; font-weight: 600;">${dni}</span>
            </p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569;">
              <strong>Correo registrado:</strong> <span style="color: #0f172a;">${to}</span>
            </p>
            <p style="margin: 0; font-size: 13px; color: #475569;">
              <strong>Tiempo de validez:</strong> <span style="color: #990537; font-weight: 600;">${expirationMinutes} minutos</span>
            </p>
          </td>
        </tr>
      </table>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
        <tr>
          <td align="center">
            <a href="${resetUrl}" style="background-color: #990537; color: #ffffff; padding: 14px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; display: inline-block;">
              Restablecer Mi Contraseña
            </a>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; line-height: 1.5;">
        Si el botón no funciona, copie y pegue el siguiente enlace directamente en su navegador web:
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 6px; word-break: break-all; font-size: 12px; color: #990537; margin: 0 0 24px 0;">
        <a href="${resetUrl}" style="color: #990537; text-decoration: underline;">${resetUrl}</a>
      </div>

      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 6px;">
        <p style="color: #92400e; font-size: 13px; font-weight: 600; margin: 0 0 6px 0;">
          Información de Seguridad
        </p>
        <p style="color: #92400e; font-size: 12px; margin: 0; line-height: 1.6;">
          • Este enlace es de <strong>un solo uso</strong> y caducará en <strong>${expirationMinutes} minutos</strong>.<br />
          • Si usted <strong>no solicitó</strong> este restablecimiento, puede ignorar este mensaje con total tranquilidad. Su contraseña actual no ha sido modificada y su cuenta continúa protegida.
        </p>
      </div>
    `;

    const html = this.wrapHtmlTemplate(
      subject,
      'Instrucciones para restablecer su contraseña de acceso al Sistema de Monitoreo UGEL Lampa.',
      contentHtml,
    );

    await this.sendMail(to, subject, text, html);
  }

  async sendCronogramaVencidoEmail(
    to: string,
    fecha: string,
    institucion: string,
    docente: string,
    monitorNombre?: string,
  ): Promise<void> {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const loginUrl = `${frontendUrl}/login`;

    const saludo = monitorNombre
      ? `Estimado(a) <strong>${monitorNombre}</strong>:`
      : 'Estimado(a) Monitor(a):';
    const saludoTexto = monitorNombre ? `Estimado(a) ${monitorNombre}:` : 'Estimado(a) Monitor(a):';

    const subject = 'Aviso de Visita Pendiente de Ejecución - UGEL Lampa';
    const text =
      `SISTEMA DE MONITOREO - UGEL LAMPA\n` +
      `Aviso de Visita Pendiente de Ejecución\n` +
      `============================================================\n\n` +
      `${saludoTexto}\n\n` +
      `Le informamos que de acuerdo al cronograma registrado en el Sistema de Monitoreo, se encuentra pendiente de ejecución o reprogramación la siguiente visita pedagógica:\n\n` +
      `DETALLES DE LA VISITA:\n` +
      `- Fecha Programada: ${fecha}\n` +
      `- Institución Educativa: ${institucion}\n` +
      `- Docente Asignado: ${docente}\n\n` +
      `Por favor, ingrese al sistema para registrar la ficha de monitoreo o tramitar la reprogramación de la visita:\n` +
      `${loginUrl}\n\n` +
      `------------------------------------------------------------\n` +
      `UGEL Lampa - Sistema de Monitoreo\n` +
      `Este mensaje fue generado automáticamente. Por favor no responder a este remitente.`;

    const contentHtml = `
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #1e293b;">${saludo}</p>
      <p style="margin: 0 0 20px 0; color: #334155; font-size: 14px; line-height: 1.6;">
        Le recordamos que, de acuerdo a la programación registrada en el <strong>Sistema de Monitoreo Pedagógico</strong>, tiene una visita que se encuentra pendiente de ejecución o reprogramación:
      </p>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fdf2f5; border: 1px solid #fce7ec; border-left: 4px solid #990537; border-radius: 6px; margin: 0 0 24px 0;">
        <tr>
          <td style="padding: 16px;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569;">
              <strong>Fecha Programada:</strong> <span style="color: #0f172a; font-weight: 600;">${fecha}</span>
            </p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569;">
              <strong>Institución Educativa:</strong> <span style="color: #0f172a;">${institucion}</span>
            </p>
            <p style="margin: 0; font-size: 13px; color: #475569;">
              <strong>Docente Asignado:</strong> <span style="color: #0f172a;">${docente}</span>
            </p>
          </td>
        </tr>
      </table>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
        <tr>
          <td align="center">
            <a href="${loginUrl}" style="background-color: #990537; color: #ffffff; padding: 14px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; display: inline-block;">
              Gestionar en el Sistema
            </a>
          </td>
        </tr>
      </table>

      <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.5;">
        Por favor, ingrese al sistema para registrar la ficha de monitoreo correspondiente o gestionar la reprogramación si la visita fue postergada.
      </p>
    `;

    const html = this.wrapHtmlTemplate(
      subject,
      'Aviso de visita de monitoreo pedagógico pendiente - UGEL Lampa',
      contentHtml,
    );

    await this.sendMail(to, subject, text, html);
  }

  async sendResumenFichaEmail(
    to: string,
    docenteNombre: string,
    pdfBuffer: Buffer,
    pdfFileName: string,
  ): Promise<void> {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const loginUrl = `${frontendUrl}/login`;

    const subject = 'Resultado de Ficha de Monitoreo - UGEL Lampa';
    const text =
      `SISTEMA DE MONITOREO - UGEL LAMPA\n` +
      `Resultado de Ficha de Monitoreo Pedagógico\n` +
      `============================================================\n\n` +
      `Estimado(a) ${docenteNombre}:\n\n` +
      `Su visita de monitoreo pedagógico ha concluido exitosamente y los resultados oficiales han sido registrados en la plataforma.\n\n` +
      `DOCUMENTO ADJUNTO:\n` +
      `- Archivo: ${pdfFileName}\n` +
      `- Detalle: Informe oficial con niveles de logro, observaciones pedagógicas, sugerencias y compromisos de mejora.\n\n` +
      `Para consultar su historial o revisar más información, puede acceder al sistema:\n${loginUrl}\n\n` +
      `------------------------------------------------------------\n` +
      `UGEL Lampa - Sistema de Monitoreo\n` +
      `Este mensaje fue generado automáticamente. Por favor no responder a este remitente.`;

    const contentHtml = `
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #1e293b;">Estimado(a) <strong>${docenteNombre}</strong>:</p>
      <p style="margin: 0 0 20px 0; color: #334155; font-size: 14px; line-height: 1.6;">
        Su visita de monitoreo pedagógico ha concluido exitosamente y los resultados oficiales han sido registrados en el <strong>Sistema de Monitoreo</strong>.
      </p>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fdf2f5; border: 1px solid #fce7ec; border-left: 4px solid #990537; border-radius: 6px; margin: 0 0 24px 0;">
        <tr>
          <td style="padding: 16px;">
            <p style="margin: 0 0 6px 0; font-size: 13px; color: #80042e; font-weight: 700;">
              Documento Oficial Adjunto
            </p>
            <p style="margin: 0 0 6px 0; font-size: 13px; color: #475569;">
              <strong>Archivo:</strong> <span style="color: #0f172a; font-weight: 600;">${pdfFileName}</span>
            </p>
            <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
              Adjunto a este mensaje encontrará el informe oficial en formato PDF con el detalle de los niveles de logro alcanzados, sugerencias pedagógicas y compromisos de mejora concertados.
            </p>
          </td>
        </tr>
      </table>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
        <tr>
          <td align="center">
            <a href="${loginUrl}" style="background-color: #990537; color: #ffffff; padding: 14px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; display: inline-block;">
              Acceder al Sistema
            </a>
          </td>
        </tr>
      </table>

      <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.5;">
        Podrá descargar y revisar este informe en cualquier momento iniciando sesión en su panel personal.
      </p>
    `;

    const html = this.wrapHtmlTemplate(
      subject,
      'Resultado de Ficha de Monitoreo Pedagógico - UGEL Lampa',
      contentHtml,
    );

    const attachments = [
      {
        filename: pdfFileName,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ];

    await this.sendMail(to, subject, text, html, attachments);
  }

  async sendNotificacionEmail(
    to: string,
    titulo: string,
    mensaje: string,
    destinatarioNombre?: string,
  ): Promise<void> {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const loginUrl = `${frontendUrl}/login`;

    const saludo = destinatarioNombre
      ? `Estimado(a) <strong>${destinatarioNombre}</strong>:`
      : 'Estimado(a) Usuario(a):';
    const saludoTexto = destinatarioNombre
      ? `Estimado(a) ${destinatarioNombre}:`
      : 'Estimado(a) Usuario(a):';

    const subject = `${titulo} - UGEL Lampa`;
    const text =
      `SISTEMA DE MONITOREO - UGEL LAMPA\n` +
      `Aviso Institucional\n` +
      `============================================================\n\n` +
      `${saludoTexto}\n\n` +
      `Se ha registrado una nueva notificación en el Sistema de Monitoreo:\n\n` +
      `ASUNTO: ${titulo}\n` +
      `MENSAJE: ${mensaje}\n\n` +
      `Para más detalles, acceda a la plataforma:\n${loginUrl}\n\n` +
      `------------------------------------------------------------\n` +
      `UGEL Lampa - Sistema de Monitoreo\n` +
      `Este mensaje fue generado automáticamente. Por favor no responder a este remitente.`;

    const contentHtml = `
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #1e293b;">${saludo}</p>
      <p style="margin: 0 0 20px 0; color: #334155; font-size: 14px; line-height: 1.6;">
        Le informamos que se ha registrado una nueva notificación en el <strong>Sistema de Monitoreo Pedagógico</strong>:
      </p>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fdf2f5; border: 1px solid #fce7ec; border-left: 4px solid #990537; border-radius: 6px; margin: 0 0 24px 0;">
        <tr>
          <td style="padding: 16px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #80042e; font-weight: 700;">
              ${titulo}
            </p>
            <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.6;">
              ${mensaje.replace(/</g, '&lt;')}
            </p>
          </td>
        </tr>
      </table>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
        <tr>
          <td align="center">
            <a href="${loginUrl}" style="background-color: #990537; color: #ffffff; padding: 14px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; display: inline-block;">
              Acceder al Sistema
            </a>
          </td>
        </tr>
      </table>
    `;

    const html = this.wrapHtmlTemplate(
      subject,
      `Notificación institucional del Sistema de Monitoreo - UGEL Lampa`,
      contentHtml,
    );

    await this.sendMail(to, subject, text, html);
  }
}
