import type {
  IJefeAreaResponse,
  ICreateJefeAreaRequest,
  IUpdateJefeAreaRequest,
  IQueryJefeAreaRequest,
} from '@sistema-monitoreo/shared-contracts';

export abstract class JefeAreaRepository {
  abstract findAll(filters?: IQueryJefeAreaRequest): Promise<IJefeAreaResponse[]>;
  abstract findById(id: string): Promise<IJefeAreaResponse | null>;
  abstract create(
    data: ICreateJefeAreaRequest,
    passwordHash: string,
    roleId: string,
  ): Promise<IJefeAreaResponse>;
  abstract update(
    id: string,
    data: IUpdateJefeAreaRequest,
    roleId?: string,
  ): Promise<IJefeAreaResponse>;
  abstract delete(id: string): Promise<IJefeAreaResponse>;
  abstract activate(id: string): Promise<IJefeAreaResponse>;
  abstract deactivate(id: string): Promise<IJefeAreaResponse>;
}
