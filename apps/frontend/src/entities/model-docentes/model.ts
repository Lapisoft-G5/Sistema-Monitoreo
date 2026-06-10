export type CondicionLaboral = 'Nombrado' | 'Contratado';

// Condición laboral específica del Director (EDU-0006): Asignado, Encargado o Por función.
export type CondicionDirectiva = 'Asignado' | 'Encargado' | 'Por función';

export type EscalaMagisterial = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII';

export interface SeccionDocente {
  id: string;
  grado: string; // Ej. "4to A", "3ro B"
}

export type NivelEducativo = 'INICIAL' | 'PRONOEI' | 'PRIMARIA' | 'SECUNDARIA';

export interface Docente {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  celular: string;
  nivelEducativo: NivelEducativo;
  condicion: CondicionLaboral | CondicionDirectiva; // directivas solo cuando cargo = 'Director'
  especialidad: string;
  cargaHoraria: number; // horas por semana
  secciones: SeccionDocente[];
  escala: EscalaMagisterial;
  institucionId: string; // Relación con I.E.
  activo: boolean;
  fechaCreacion: string;
  cargo: 'Director' | 'Coordinador Pedagógico' | 'Docente de Aula';
}
