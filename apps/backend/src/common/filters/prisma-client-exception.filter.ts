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
      case 'P2002':
        // Violación de restricción de unicidad (Unique constraint failed)
        status = HttpStatus.CONFLICT;
        const fields = exception.meta?.target as string[];
        message = `Ya existe un registro con ese valor: ${fields?.join(', ') || 'duplicado'}`;
        break;
      case 'P2025':
        // Registro no encontrado (Record not found)
        status = HttpStatus.NOT_FOUND;
        message = 'El registro solicitado no fue encontrado en la base de datos.';
        break;
      case 'P2003':
        // Fallo de restricción de clave foránea (Foreign key constraint failed)
        status = HttpStatus.BAD_REQUEST;
        message = 'No se puede procesar debido a una relación faltante o incorrecta en la base de datos.';
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
