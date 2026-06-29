import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '../../generated/prisma/client.js';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor en la base de datos';

    switch (exception.code) {
      case 'P2002': {
        // Violación de restricción de unicidad (Unique constraint failed)
        status = HttpStatus.CONFLICT;
        let targetStr = 'duplicado';
        const target = exception.meta?.target;

        if (Array.isArray(target) && target.length > 0) {
          targetStr = target[0];
        } else if (typeof target === 'string') {
          targetStr = target;
        } else {
          // Extraer del mensaje si meta no está disponible o no es útil
          const match =
            exception.message.match(
              /Unique constraint failed on the (?:fields|constraint): ["'`]?([^"'`\)]+)["'`]?/i,
            ) || exception.message.match(/Unique constraint failed on the fields: \(([^)]+)\)/i);
          if (match && match[1]) {
            targetStr = match[1];
          }
        }

        targetStr = targetStr.replace(/_key$/, '').split('_').pop() || targetStr;

        // Remove backticks, quotes, and whitespace that might be captured by regex or Prisma 5 output
        targetStr = targetStr.replace(/["'`\s]/g, '');

        if (targetStr === 'telefono' || targetStr === 'celular') targetStr = 'celular/teléfono';
        if (targetStr === 'correo' || targetStr === 'email') targetStr = 'correo electrónico';
        if (targetStr === 'dni') targetStr = 'DNI';

        if (targetStr === 'duplicado' && exception.meta) {
          targetStr = JSON.stringify(exception.meta.target || exception.meta);
        }

        message = `El valor ingresado ya está en uso: ${targetStr}`;
        break;
      }
      case 'P2025':
        // Registro no encontrado (Record not found)
        status = HttpStatus.NOT_FOUND;
        message = 'El registro solicitado no fue encontrado en la base de datos.';
        break;
      case 'P2003':
        // Fallo de restricción de clave foránea (Foreign key constraint failed)
        status = HttpStatus.BAD_REQUEST;
        message =
          'No se puede procesar debido a una relación faltante o incorrecta en la base de datos.';
        break;
      default:
        // Manejo por defecto (se registrará internamente)
        break;
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`[Prisma Error ${exception.code}]: ${exception.message}`, exception.stack);
    } else {
      this.logger.warn(`[Prisma Warning ${exception.code}]: ${message}`);
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.code,
    });
  }
}
