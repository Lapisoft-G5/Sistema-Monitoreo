import { Request } from 'express';
import { JwtPayload } from '../../auth/services/auth-token.service.js';
import { EspecialistaService } from '../services/especialista.service.js';
import { CreateEspecialistaDto } from '../dto/create-especialista.dto.js';
import { UpdateEspecialistaDto } from '../dto/update-especialista.dto.js';
import { QueryEspecialistaDto } from '../dto/query-especialista.dto.js';
import type { IEspecialistaResponse } from '@sistema-monitoreo/shared-contracts';
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
export declare class EspecialistaController {
  private readonly service;
  constructor(service: EspecialistaService);
  findAll(query: QueryEspecialistaDto): Promise<IEspecialistaResponse[]>;
  findById(id: string): Promise<IEspecialistaResponse | null>;
  create(dto: CreateEspecialistaDto, req: AuthenticatedRequest): Promise<IEspecialistaResponse>;
  update(
    id: string,
    dto: UpdateEspecialistaDto,
    req: AuthenticatedRequest,
  ): Promise<IEspecialistaResponse>;
  delete(id: string): Promise<IEspecialistaResponse>;
  activate(id: string): Promise<IEspecialistaResponse>;
  deactivate(id: string): Promise<IEspecialistaResponse>;
}
