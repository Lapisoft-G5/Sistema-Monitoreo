import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { EspecialistaRepository } from './especialista.repository.js';
import type {
  IEspecialistaResponse,
  ICreateEspecialistaRequest,
  IUpdateEspecialistaRequest,
  IQueryEspecialistaRequest,
} from '@sistema-monitoreo/shared-contracts';
export declare class PrismaEspecialistaRepository implements EspecialistaRepository {
  private readonly prisma;
  constructor(prisma: PrismaService);
  private mapEspecialista;
  findAll(filters?: IQueryEspecialistaRequest): Promise<IEspecialistaResponse[]>;
  findById(id: string): Promise<IEspecialistaResponse | null>;
  create(
    data: ICreateEspecialistaRequest,
    passwordHash: string,
    roleId: string,
  ): Promise<IEspecialistaResponse>;
  update(
    id: string,
    data: IUpdateEspecialistaRequest,
    roleId?: string,
  ): Promise<IEspecialistaResponse>;
  delete(id: string): Promise<IEspecialistaResponse>;
  activate(id: string): Promise<IEspecialistaResponse>;
  deactivate(id: string): Promise<IEspecialistaResponse>;
}
