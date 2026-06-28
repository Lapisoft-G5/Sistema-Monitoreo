export interface JefeArea {
  id: string;
  personaId: string;
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  celular: string;
  cargaHoraria: number;
  nivelEducativo: 'Inicial' | 'Primaria' | 'Secundaria';
  activo: boolean;
  fechaCreacion: string;
  cargo: string;
  especialidades?: string[] | null;
  especialidad?: string | null;
  especialidadesExtras?: string[] | null;
}
