import type { IUpdateEspecialistaRequest } from '@sistema-monitoreo/shared-contracts';
export declare class UpdateEspecialistaDto implements IUpdateEspecialistaRequest {
  nombres: string;
  apellidos: string;
  correo?: string;
  telefono?: string;
  cargo: string;
  modalidad: string;
  nivelEducativo: string;
  especialidad?: string;
  estado: string;
  rolCode: string;
  condicionLaboral?: string;
  cargaLaboral?: number;
  escalaMagisterial?: number | null;
}
