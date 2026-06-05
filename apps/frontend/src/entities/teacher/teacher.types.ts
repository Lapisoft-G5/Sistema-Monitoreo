import type { NivelInstitucion } from '../specialist/specialist.types';

export type CondicionLaboral = 'Nombrado' | 'Contratado';

export type EscalaMagisterial =
  | 'I'   | 'II'  | 'III' | 'IV'
  | 'V'   | 'VI'  | 'VII' | 'VIII';

export interface SeccionDocente {
  id:      string;
  grado:   string;   // texto libre: "4to A", "3ro B", etc.
}

export interface Docente {
  id:              string;
  // Información Personal
  nombres:         string;
  dni:             string;
  correo:          string;
  celular:         string;
  // Detalles Laborales
  nivelEducativo:  NivelInstitucion;
  condicion:       CondicionLaboral;
  especialidad:    string;
  cargaHoraria:    number;           // horas/semana
  secciones:       SeccionDocente[];
  escala:          EscalaMagisterial;
  // Meta
  institucionId:   string;
  activo:          boolean;
  fechaCreacion:   string;
}

export const CONDICION_LABORAL: CondicionLaboral[] = ['Nombrado', 'Contratado'];

export const ESCALAS_MAGISTERIALES: { value: EscalaMagisterial; label: string }[] = [
  { value: 'I',    label: 'I   — Primera Escala'  },
  { value: 'II',   label: 'II  — Segunda Escala'  },
  { value: 'III',  label: 'III — Tercera Escala'  },
  { value: 'IV',   label: 'IV  — Cuarta Escala'   },
  { value: 'V',    label: 'V   — Quinta Escala'   },
  { value: 'VI',   label: 'VI  — Sexta Escala'    },
  { value: 'VII',  label: 'VII — Séptima Escala'  },
  { value: 'VIII', label: 'VIII — Octava Escala'  },
];