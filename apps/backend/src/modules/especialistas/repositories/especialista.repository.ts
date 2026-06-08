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
  ): Promise<IEspecialistaResponse>;
  abstract update(id: string, data: IUpdateEspecialistaRequest): Promise<IEspecialistaResponse>;
  abstract delete(id: string): Promise<IEspecialistaResponse>;
}
