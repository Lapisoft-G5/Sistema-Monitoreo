/* ============================================================
 * Tipos y constantes de dominio del módulo de Instituciones.
 * Compartidos entre el listado (InstitutionsPage) y el
 * formulario de registro (InstitutionForm).
 * NOTA: datos mock por ahora; se reemplazarán por el backend.
 * ============================================================ */

export type Nivel = 'INICIAL' | 'PRONOEI' | 'PRIMARIA' | 'SECUNDARIA';
export type EstadoMonitoreo = 'Satisfactorio' | 'En Proceso' | 'Crítico';

export interface Institucion {
  id: string;
  codigoModular: string;
  nombre: string;
  direccion: string;
  nivel: Nivel;
  distrito: string;
  director: string | null; // null = sin asignar
  estado: EstadoMonitoreo;
  provincia?: string;
  zona?: string;
  directorTelefono?: string;
  directorCorreo?: string;
}

export const NIVELES: Nivel[] = ['INICIAL', 'PRONOEI', 'PRIMARIA', 'SECUNDARIA'];

export const NIVEL_LABEL: Record<Nivel, string> = {
  INICIAL: 'Inicial',
  PRONOEI: 'PRONOEI',
  PRIMARIA: 'Primaria',
  SECUNDARIA: 'Secundaria',
};

export const ESTADOS: EstadoMonitoreo[] = ['Satisfactorio', 'En Proceso', 'Crítico'];

export const ZONAS = ['Urbana', 'Rural'];

export const PROVINCIAS = [
  'Puno',
  'Azángaro',
  'Carabaya',
  'Chucuito',
  'El Collao',
  'Huancané',
  'Lampa',
  'Melgar',
  'Moho',
  'San Antonio de Putina',
  'San Román',
  'Sandia',
  'Yunguyo',
];

export const DISTRITOS_LAMPA = [
  'Cabanilla',
  'Calapuja',
  'Lampa',
  'Nicasio',
  'Ocuviri',
  'Palca',
  'Paratía',
  'Pucará',
  'Santa Lucía',
  'Vilavila',
];

export const NIVEL_STYLE: Record<Nivel, { bg: string; color: string }> = {
  INICIAL: { bg: '#fae8ff', color: '#a21caf' },
  PRONOEI: { bg: '#fef9c3', color: '#a16207' },
  PRIMARIA: { bg: '#dbeafe', color: '#1d4ed8' },
  SECUNDARIA: { bg: '#dcfce7', color: '#15803d' },
};

export const ESTADO_COLOR: Record<EstadoMonitoreo, string> = {
  Satisfactorio: '#22c55e',
  'En Proceso': '#f97316',
  Crítico: '#ef4444',
};

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
};

export const MOCK_INSTITUCIONES: Institucion[] = [
  { id: '1', codigoModular: '0521482', nombre: 'I.E. 71007 Mariscal Castilla', direccion: 'Urb. Centro s/n', nivel: 'PRIMARIA', distrito: 'Lampa', director: 'Rosa Cáceres M.', estado: 'Satisfactorio' },
  { id: '2', codigoModular: '1245890', nombre: 'I.E.S. Politécnico Regional', direccion: 'Av. Panamericana km 32', nivel: 'SECUNDARIA', distrito: 'Santa Lucía', director: null, estado: 'En Proceso' },
  { id: '3', codigoModular: '0344561', nombre: 'I.E.I. Mis Primeros Pasos', direccion: 'Jr. Libertad 420', nivel: 'INICIAL', distrito: 'Pucará', director: 'Alberto Merino J.', estado: 'Crítico' },
  { id: '4', codigoModular: '0512347', nombre: 'I.E. 70015 José Carlos Mariátegui', direccion: 'Jr. Puno 234', nivel: 'PRIMARIA', distrito: 'Lampa', director: 'Hilda Quispe T.', estado: 'Satisfactorio' },
  { id: '5', codigoModular: '0623451', nombre: 'I.E.S. Túpac Amaru', direccion: 'Av. Progreso s/n', nivel: 'SECUNDARIA', distrito: 'Cabanilla', director: 'Marco Aquino R.', estado: 'Satisfactorio' },
  { id: '6', codigoModular: '0734512', nombre: 'I.E.I. Los Angelitos', direccion: 'Jr. Grau 102', nivel: 'INICIAL', distrito: 'Lampa', director: null, estado: 'En Proceso' },
  { id: '7', codigoModular: '0845123', nombre: 'I.E. 70023 Andrés A. Cáceres', direccion: 'Comunidad Palca', nivel: 'PRIMARIA', distrito: 'Palca', director: 'Néstor Mamani C.', estado: 'Crítico' },
  { id: '8', codigoModular: '0956234', nombre: 'I.E.S. Agropecuario Paratía', direccion: 'Plaza Principal', nivel: 'SECUNDARIA', distrito: 'Paratía', director: 'Lucía Apaza V.', estado: 'En Proceso' },
  { id: '9', codigoModular: '0167345', nombre: 'I.E.I. Semillitas del Saber', direccion: 'Jr. Bolívar 56', nivel: 'INICIAL', distrito: 'Santa Lucía', director: 'Carmen Flores Q.', estado: 'Satisfactorio' },
  { id: '10', codigoModular: '0278456', nombre: 'I.E. 70034 Micaela Bastidas', direccion: 'Av. Lampa 789', nivel: 'PRIMARIA', distrito: 'Nicasio', director: null, estado: 'En Proceso' },
  { id: '11', codigoModular: '0389567', nombre: 'I.E.S. Ciencias Vilavila', direccion: 'Jr. Lima 321', nivel: 'SECUNDARIA', distrito: 'Vilavila', director: 'Julio Condori H.', estado: 'Satisfactorio' },
  { id: '12', codigoModular: '0490678', nombre: 'I.E.I. Mi Pequeño Mundo', direccion: 'Comunidad Ocuviri', nivel: 'INICIAL', distrito: 'Ocuviri', director: 'Rosa Huanca P.', estado: 'Crítico' },
  { id: '13', codigoModular: '0501789', nombre: 'I.E. 70045 Daniel A. Carrión', direccion: 'Jr. Arequipa 45', nivel: 'PRIMARIA', distrito: 'Cabanilla', director: 'Pedro Ccama L.', estado: 'Satisfactorio' },
  { id: '14', codigoModular: '0612890', nombre: 'I.E.S. José A. Encinas', direccion: 'Av. Educación s/n', nivel: 'SECUNDARIA', distrito: 'Lampa', director: 'Ana Ticona M.', estado: 'En Proceso' },
];
