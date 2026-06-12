export type NivelInstitucion =
  | 'Inicial'
  | 'Primaria'
  | 'Secundaria';

export type CondicionLaboral = 'Contratado' | 'Nombrado';

export interface Especialista {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  celular: string;
  especialidad?: string;
  niveles: NivelInstitucion[];
  activo: boolean;
  fechaCreacion: string;
  condicionLaboral: CondicionLaboral;
  cargaLaboral: number;
  escalaMagisterial?: number;
  cargo?: string;
  rolCode?: string;
}
