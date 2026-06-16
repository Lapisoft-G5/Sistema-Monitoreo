import { EspecialistaRepository } from '../repositories/especialista.repository.js';
import { CreateEspecialistaDto } from '../dto/create-especialista.dto.js';
import { UpdateEspecialistaDto } from '../dto/update-especialista.dto.js';
import { QueryEspecialistaDto } from '../dto/query-especialista.dto.js';
import type { IEspecialistaResponse } from '@sistema-monitoreo/shared-contracts';
import { CargoEspecialista } from '@sistema-monitoreo/shared-contracts';
import { CatalogsRepository } from '../../catalogs/repositories/catalogs.repository.js';
import type { JwtPayload } from '../../auth/services/auth-token.service.js';
export declare class EspecialistaService {
  private readonly repository;
  private readonly catalogsRepository;
  constructor(repository: EspecialistaRepository, catalogsRepository: CatalogsRepository);
  findAll(filters?: QueryEspecialistaDto): Promise<IEspecialistaResponse[]>;
  findById(id: string): Promise<IEspecialistaResponse | null>;
  create(dto: CreateEspecialistaDto, currentUser: JwtPayload): Promise<IEspecialistaResponse>;
  update(
    id: string,
    dto: UpdateEspecialistaDto,
    currentUser: JwtPayload,
  ): Promise<IEspecialistaResponse>;
  delete(id: string): Promise<IEspecialistaResponse>;
  activate(id: string): Promise<IEspecialistaResponse>;
  deactivate(id: string): Promise<IEspecialistaResponse>;
}
export { CargoEspecialista };
