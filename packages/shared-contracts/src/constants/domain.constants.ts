export const ModalidadEducativa = {
  EBR: 'EBR',
  EBA: 'EBA',
  EBE: 'EBE',
  CEPTRO: 'CEPTROs',
} as const;

export const NivelEducativoEBR = {
  INICIAL: 'Inicial',
  PRIMARIA: 'Primaria',
  SECUNDARIA: 'Secundaria',
} as const;

export const NivelEducativoEBA = {
  INICIAL_INTERMEDIO: 'Inicial-Intermedio',
  AVANZADO: 'Avanzado',
} as const;

export const NivelEducativoEBE = {
  CEBE: 'CEBE',
  PRITE: 'PRITE',
} as const;

export const EspecialidadPrimaria = {
  PIP: 'PIP',
  EDUCACION_FISICA: 'Educación Física',
} as const;

export const DocenteCargosRestrictivos = {
  COORDINADOR_PEDAGOGICO: 'Coordinador Pedagógico',
  JEFE_DE_TALLER: 'Jefe de Taller',
} as const;

/** Condición laboral válida para cargos de responsabilidad (Coordinador Pedagógico y Jefe de Taller) */
export const CondicionLaboralCargosRestrictivos = ['Nombrado', 'Destacado'] as const;

/** @deprecated Usar CondicionLaboralCargosRestrictivos */
export const CondicionLaboralPermitidaCoordinador = CondicionLaboralCargosRestrictivos;


/** Los tres cargos válidos para la tabla Especialista */
export const CargoEspecialista = {
  ESPECIALISTA: 'Especialista',
  JEFE_AREA: 'Jefe de Área',
  JEFE_GESTION: 'Jefe de Gestión',
} as const;

export const CondicionLaboralEspecialista = [
  'Encargado',
  'Destacado',
  'Designado',
] as const;

export const MODALIDAD_NIVEL_MAP: Record<string, string[]> = {
  [ModalidadEducativa.EBR]: Object.values(NivelEducativoEBR),
  [ModalidadEducativa.EBA]: Object.values(NivelEducativoEBA),
  [ModalidadEducativa.EBE]: Object.values(NivelEducativoEBE),
};
