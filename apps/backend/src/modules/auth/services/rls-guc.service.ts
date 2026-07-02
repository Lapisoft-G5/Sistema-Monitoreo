import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';

@Injectable()
export class RlsGucService {
  private readonly logger = new Logger(RlsGucService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Setea los GUCs de sesion para RLS inmediatamente despues de verificar la sesion.
   * Los GUCs quedan en la conexion del pool hasta que se devuelva.
   * Si la conexion no es superuser (caso monitoreo_app), las RLS policies
   * se aplican a las queries del handler. Si es superuser, las policies son
   * BYPASSEADAS y esto es no-op.
   */
  async setSessionGucs(userId: string, role: string, institucionId: string): Promise<void> {
    try {
      await this.prisma.$executeRawUnsafe(
        `SELECT
          set_config('app.user_id', $1, true),
          set_config('app.user_rol', $2, true),
          set_config('app.user_institucion_id', $3, true)`,
        userId,
        role,
        institucionId ?? '',
      );
    } catch (err) {
      this.logger.warn(`No se pudieron setear GUCs RLS: ${(err as Error).message}`);
    }
  }
}
