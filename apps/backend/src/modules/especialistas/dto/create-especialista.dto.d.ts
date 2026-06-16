import type { ICreateEspecialistaRequest } from '@sistema-monitoreo/shared-contracts';
export declare class CreateEspecialistaDto implements ICreateEspecialistaRequest {
  dni: string;
  nombres: string;
  apellidos: string;
  correo?: string;
  telefono?: string;
  cargo: string;
  modalidad: string;
  nivelEducativo: string;
  especialidad?: string;
  rolCode: string;
  condicionLaboral?: string;
  cargaLaboral?: number;
  escalaMagisterial?: number | null;
}
