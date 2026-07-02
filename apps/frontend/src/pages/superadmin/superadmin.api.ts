import { request } from '@shared/config/api';

export interface Candidato {
  id: string;
  dni: string;
  nombres: string;
  apellidos: string;
  correo: string | null;
  rolActual: string;
  rolCodigo: string;
  activo: boolean;
}

export const superadminApi = {
  getCandidatos: () => request<Candidato[]>('/superadmin/candidatos'),
  asignarRol: (usuarioId: string, roleCode: string) => 
    request<{ success: boolean; message: string; usuario: any }>(`/superadmin/asignar-rol/${usuarioId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role: roleCode }),
    }),
};
