import type {
  IEspecialistaResponse,
  ICreateEspecialistaRequest,
  IUpdateEspecialistaRequest,
  IQueryEspecialistaRequest,
} from '@sistema-monitoreo/shared-contracts';

export abstract class EspecialistaRepository {
  abstract findAll(filters?: IQueryEspecialistaRequest): Promise<IEspecialistaResponse[]>;
  abstract findById(id: string): Promise<IEspecialistaResponse | null>;
  abstract create(
    data: ICreateEspecialistaRequest,
    passwordHash: string,
    roleId: string,
  ): Promise<IEspecialistaResponse>;
  abstract update(
    id: string,
    data: IUpdateEspecialistaRequest,
    roleId?: string,
  ): Promise<IEspecialistaResponse>;
  abstract delete(id: string): Promise<IEspecialistaResponse>;
  abstract activate(id: string): Promise<IEspecialistaResponse>;
  abstract deactivate(id: string): Promise<IEspecialistaResponse>;
}
