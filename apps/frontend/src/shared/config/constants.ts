export const STALE_TIMES = {
  DEFAULT: 30_000,
  REPORTES: 60_000,
  PLANTILLAS: 5_000,
  PLANTILLAS_COUNT: 10_000,
} as const;

export const PAGINATION = {
  PAGE_SIZE: 10,
  MAX_LIMIT: 1000,
} as const;

export const VALIDATION = {
  DNI_LENGTH: 8,
  PHONE_PREFIX: '9',
  PHONE_LENGTH: 9,
  PASSWORD_MIN_LENGTH: 8,
} as const;

export const CARGA_HORARIA = {
  DOCENTE: 30,
  ESPECIALISTA: 40,
  JEFE_AREA: 40,
} as const;
