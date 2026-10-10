import {
  ModalidadEducativa,
  RoleCode,
  type TipoMonitoreo,
} from '@sistema-monitoreo/shared-contracts';
import { MODALIDAD_NIVEL_MAP } from '@entities/model-instituciones';
import { esDeEPT } from '@features/docentes/lib/asignacion-de-cargo';

/**
 * Cascada de asignación de un cronograma de monitoreo.
 *
 * Fase 5 de PLAN_REMEDIACION.md. Estas cuatro reglas vivían como `useMemo`
 * dentro de `CronogramaPage`, un componente de 1.446 líneas, entre la
 * maquetación del formulario. Deciden quién puede monitorear qué, y no tenían
 * cobertura: una asignación equivocada no falla, produce una visita que la
 * persona equivocada no puede levantar.
 *
 * El orden de la cascada es modalidad → nivel → especialista e institución.
 * Cambiar un eslabón invalida los siguientes.
 */

const TODAS_LAS_MODALIDADES = Object.values(ModalidadEducativa);

/** Texto normalizado: sin tildes, minúsculas y sin espacios a los bordes. */
export const normalizarTexto = (s?: string | null): string =>
  (s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

/** Cargos de la UGEL que salen a monitorear en sus formas normalizadas. */
const CARGOS_QUE_MONITOREAN_NORMALIZADOS = new Set([
  'especialista',
  'jefe de area',
  'jefe de gestion',
  'responsable de nivel',
]);

export function esCargoQueMonitorea(cargo?: string | null): boolean {
  if (!cargo) return false;
  return CARGOS_QUE_MONITOREAN_NORMALIZADOS.has(normalizarTexto(cargo));
}

export function esJefeDeGestion(cargo?: string | null): boolean {
  if (!cargo) return false;
  return normalizarTexto(cargo) === 'jefe de gestion';
}

/**
 * Qué ficha puede levantar el monitor elegido.
 *
 * El Jefe de Gestión monitorea sólo a los directores de las instituciones: su
 * ficha es la directiva. El especialista y el Responsable de Nivel monitorean
 * al personal de su nivel y también a su director, así que levantan las dos.
 *
 * El formulario elige primero al monitor y después el tipo de ficha, por eso
 * es el monitor quien acota el tipo y no al revés. Sin monitor elegido no hay
 * nada que restringir.
 */
export function tiposPermitidosDelMonitor(cargo: string | undefined): readonly TipoMonitoreo[] {
  return esJefeDeGestion(cargo) ? SOLO_DIRECTIVO : AMBOS_TIPOS;
}

// Constantes y no literales nuevos en cada llamada: quien las usa como
// dependencia de un `useMemo` no debe invalidarlo en cada render.
const SOLO_DIRECTIVO: readonly TipoMonitoreo[] = ['DIRECTIVO'];
const AMBOS_TIPOS: readonly TipoMonitoreo[] = ['DOCENTE', 'DIRECTIVO'];

/** Modalidad que se asume cuando el especialista no la declara. */
const MODALIDAD_POR_DEFECTO = 'EBR';

/** Modalidades a las que accede un jefe de área, según el nivel que atiende. */
const MODALIDADES_POR_NIVEL_DE_JEFE: Record<string, string[]> = {
  Inicial: ['EBR', 'EBE'],
  Primaria: ['EBR'],
  Secundaria: ['EBR', 'EBA', 'CEPTRO'],
};

export interface UsuarioAsignador {
  role: string;
  /** Nivel educativo que atiende, cuando el rol lo acota. */
  especialistaNivel?: string;
  /** Identificador del especialista vinculado, si lo tiene. */
  especialistaId?: string;
}

export interface EspecialistaAsignable {
  id: string;
  cargo: string;
  /** Rol del usuario. Distingue a quien conduce la UGEL de quien acompaña. */
  rolCode?: string;
  activo?: boolean;
  nivelEducativo: string;
  modalidad?: string;
  especialidades?: string[];
}

/**
 * Quien conduce la UGEL y por eso no sale a monitorear.
 *
 * El Director de UGEL se registra en el padrón con cargo «Especialista» —el
 * cargo describe su plaza y el rol su función— de modo que aparecía entre los
 * asignables de un cronograma. Ocupa un cargo de conducción, no una plaza de
 * acompañamiento en territorio.
 */
const ROLES_DE_CONDUCCION: readonly string[] = ['director_ugel'];

export interface InstitucionAsignable {
  id: string;
  modalidad: string;
  nivelEducativo: string;
  estado?: string;
  activo?: boolean;
}

/**
 * Modalidades que el usuario puede programar.
 *
 * Sólo el jefe de área queda acotado, y por el nivel que atiende. Sin nivel
 * asignado no se le restringe: sería dejarlo sin poder programar nada.
 */
export function modalidadesPermitidas(usuario: UsuarioAsignador | null | undefined): string[] {
  if (usuario?.role !== RoleCode.JEFE_AREA || !usuario.especialistaNivel) {
    return [...TODAS_LAS_MODALIDADES];
  }
  return MODALIDADES_POR_NIVEL_DE_JEFE[usuario.especialistaNivel] ?? [];
}

/**
 * Niveles que ofrece una modalidad.
 *
 * La restricción del jefe de área se aplica sólo dentro de EBR: las demás
 * modalidades tienen su propia estructura de niveles y no se corresponden una a
 * una con la de educación básica regular.
 */
export function nivelesPermitidos(
  modalidad: string,
  usuario: UsuarioAsignador | null | undefined,
): string[] {
  if (!modalidad) return [];

  const niveles = MODALIDAD_NIVEL_MAP[modalidad] ?? [];

  if (
    usuario?.role === RoleCode.JEFE_AREA &&
    usuario.especialistaNivel &&
    modalidad === MODALIDAD_POR_DEFECTO
  ) {
    return niveles.filter((nivel) => nivel === usuario.especialistaNivel);
  }

  return [...niveles];
}

/**
 * ¿El especialista cubre esta modalidad y nivel?
 *
 * Dos modalidades no se resuelven por correspondencia directa:
 * - **CEPTRO** es educación técnico-productiva: exige alguien de Secundaria con
 *   la especialidad EPT, venga de la modalidad que venga.
 * - **EBA y EBE** se cubren con especialistas de Inicial o Primaria, con
 *   independencia del nivel que pida el cronograma.
 */
const cubreModalidadYNivel = (
  especialista: EspecialistaAsignable,
  modalidad: string,
  nivel: string,
): boolean => {
  const modVisita = normalizarTexto(modalidad);
  const nivelVisita = normalizarTexto(nivel);
  const modEsp = normalizarTexto(especialista.modalidad) || 'ebr';
  const nivelEsp = normalizarTexto(especialista.nivelEducativo);

  if (modVisita === 'ceptro') {
    return (
      nivelEsp === 'secundaria' &&
      !!especialista.especialidades?.some((e) => esDeEPT(e))
    );
  }

  if (modVisita === 'eba' || modVisita === 'ebe') {
    return nivelEsp === 'primaria' || nivelEsp === 'inicial';
  }

  return modEsp === modVisita && nivelEsp === nivelVisita;
};

/**
 * Especialistas que pueden quedar asignados a una visita.
 *
 * Genérica en el tipo de especialista para devolver los mismos objetos que
 * recibe: la regla sólo lee los campos declarados acá, pero quien la llama
 * necesita el registro completo para renderizar el selector.
 *
 * El nivel/modalidad de la visita acota a especialistas y Responsables de Nivel,
 * sin excepción por quién arma el cronograma: un Responsable de Nivel de
 * Secundaria no cubre una visita de Primaria aunque sea el Jefe de Gestión
 * quien la programe. El Jefe de Gestión, que es de toda la UGEL, no se acota.
 */
export function especialistasAsignables<T extends EspecialistaAsignable>(
  especialistas: readonly T[],
  modalidad: string,
  nivel: string,
  /**
   * El monitor ya asignado, al editar una visita existente.
   *
   * Una regla de elegibilidad puede endurecerse después de creada la visita
   * —el cargo del monitor deja de poder monitorear, o cambia de nivel—, y sin
   * esto el selector se abría vacío en modo edición: la opción que ya estaba
   * elegida desaparecía de la lista en vez de seguir mostrándose.
   */
  monitorActualId?: string | null,
  /**
   * Quien está programando el cronograma.
   *
   * La jerarquía prohíbe la asignación hacia arriba: un Responsable de Nivel
   * (Jefe de Área) no puede asignarle visitas a su superior (Jefe de Gestión).
   */
  usuario?: UsuarioAsignador | null,
): T[] {
  if (!modalidad || !nivel) return [];

  const elegibles = especialistas.filter((especialista) => {
    if (especialista.activo !== true) return false;
    if (!esCargoQueMonitorea(especialista.cargo)) return false;
    if (ROLES_DE_CONDUCCION.includes(especialista.rolCode ?? '')) return false;

    // El Jefe de Gestión es de toda la UGEL: su registro trae un nivel y una
    // modalidad, pero no los cubre, y exigírselos lo dejaría fuera de casi
    // todas las visitas.
    // Salvo que quien programa sea Jefe de Área: por jerarquía, no puede
    // asignarle visitas a su superior.
    if (esJefeDeGestion(especialista.cargo)) {
      if (usuario?.role === RoleCode.JEFE_AREA) return false;
      return true;
    }

    return cubreModalidadYNivel(especialista, modalidad, nivel);
  });

  if (monitorActualId && !elegibles.some((e) => e.id === monitorActualId)) {
    const actual = especialistas.find((e) => e.id === monitorActualId);
    if (actual) return [...elegibles, actual];
  }

  return elegibles;
}

/**
 * Instituciones que pueden recibir la visita.
 *
 * Conviven dos formas de marcar vigencia —`estado` y `activo`—; basta con una.
 */
export function institucionesAsignables<T extends InstitucionAsignable>(
  instituciones: readonly T[],
  modalidad: string,
  nivel: string,
): T[] {
  if (!modalidad || !nivel) return [];

  const modVisita = normalizarTexto(modalidad);
  const nivelVisita = normalizarTexto(nivel);

  return instituciones.filter(
    (institucion) =>
      normalizarTexto(institucion.modalidad) === modVisita &&
      normalizarTexto(institucion.nivelEducativo) === nivelVisita &&
      (normalizarTexto(institucion.estado) === 'activa' || institucion.activo === true),
  );
}

/** Nombre de especialidad comparable: sin tildes, sin mayúsculas, sin bordes. */
const normalizarEspecialidad = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();

/** El campo de especialidad del docente puede traer una lista separada por comas. */
export function especialidadesDelDocente(especialidad: string | null | undefined): string[] {
  return (especialidad ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
}

/**
 * ¿El especialista puede evaluar a este docente?
 *
 * En Secundaria el monitoreo es por área: sólo si comparten al menos una
 * especialidad (principal o adicional). Fuera de Secundaria la regla no aplica y el docente pasa. La
 * misma decisión la reafirma el backend al programar; acá evita ofrecer en el
 * selector a quien luego sería rechazado.
 */
export function docenteEvaluablePorEspecialista(
  especialidadDocente: string | null | undefined,
  especialidadesEspecialista: readonly string[],
  esSecundaria: boolean,
  especialidadesExtras?: readonly string[],
): boolean {
  if (!esSecundaria) return true;
  const delEspecialista = new Set(especialidadesEspecialista.map(normalizarEspecialidad));
  const todasLasEspecialidades = [
    ...especialidadesDelDocente(especialidadDocente),
    ...(especialidadesExtras ?? []),
  ];
  return todasLasEspecialidades.some((e) =>
    delEspecialista.has(normalizarEspecialidad(e)),
  );
}

