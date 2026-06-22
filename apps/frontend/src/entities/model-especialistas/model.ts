export type NivelInstitucion = 'Inicial' | 'Primaria' | 'Secundaria';

export interface Especialista {
  id: string;
  personaId: string;
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  celular: string; // matches persona.telefono
  cargo: string; // 'Especialista' | 'Jefe de Área' | 'Jefe de Gestión'
  nivelEducativo: string; // 'Inicial' | 'Primaria' | 'Secundaria' etc.
  modalidad?: string | null; // 'EBR' | 'EBA' | 'EBE' | 'CEPTRO'
  condicionLaboral: string; // 'Encargado' | 'Destacado' | 'Designado' | 'Nombrado'
  cargaLaboral: number;
  estado: string; // 'Activo' | 'Inactivo'
  activo: boolean; // UI-friendly mapped flag (true if estado === 'Activo')
  especialidades?: string[] | null;
  escalaMagisterial?: number | null;
  fechaCreacion: string;
  rolCode?: string;
}
