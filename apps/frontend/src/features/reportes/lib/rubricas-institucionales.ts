import { nombreDePlantilla } from '@entities/model-plantillas';
import { etiquetaDeAutor } from '@features/plantillas/lib/autor-de-plantilla';
import type { RolAutorPlantilla, TipoPlantilla } from '@sistema-monitoreo/shared-contracts';

/**
 * Qué rúbricas propias de la institución se pueden analizar.
 *
 * ── Por qué esto dejó de poder agruparse por cargo ──
 * Antes había una píldora por cargo —Dirección, Coordinador P., Jefe de Taller—
 * y se daba por hecho que cada cargo tenía a lo sumo una ficha. Desde que el
 * cupo se aprueba a nombre de una PERSONA, una I.E. puede tener dos
 * coordinadores pedagógicos con una ficha cada uno, distintas entre sí: distintos
 * criterios, distinta escala, distinta área.
 *
 * Agrupadas por cargo, las dos caían en la misma píldora con el mismo rótulo. Y
 * ése es el peor error que puede cometer esta pantalla: elegir la rúbrica
 * equivocada no da ningún aviso, sólo un gráfico con números que parecen buenos
 * y describen otra cosa.
 *
 * Acá cada rúbrica es UNA plantilla concreta, rotulada con el nombre que le puso
 * quien la creó.
 *
 * ── Por qué ya no hay píldoras en cero ──
 * Se mostraban los tres cargos siempre, aunque no existiera ninguna ficha, «para
 * que el cliente vea el juego completo». Eso tenía sentido cuando los tres
 * cargos eran una taxonomía fija; hoy una institución puede no tener ninguna
 * ficha propia en todo el año, y tres píldoras en cero prometen una estructura
 * que no existe. En su lugar se dice, en una línea, qué falta y dónde se
 * resuelve.
 */

/** Los campos de la plantilla que la decisión necesita. */
export interface PlantillaAnalizable {
  id: string;
  instrumento: TipoPlantilla;
  descripcion?: string;
  tipoMonitoreo: string;
  anioAcademico: number;
  /** Institución dueña. Ausente en las de la UGEL. */
  ieId?: string;
  creadoPorRole?: RolAutorPlantilla;
  autorNombre?: string;
}

/** Una rúbrica que se puede elegir en el filtro. */
export interface RubricaElegible {
  id: string;
  /** Rótulo de la píldora. Único dentro del grupo. */
  label: string;
  /** Detalle completo, para el tooltip y la línea de selección. */
  titulo: string;
  /** Nombre de quien la creó, o el cargo si la plantilla no lo trae. */
  autor: string;
  conteo: number;
}

/** Por qué el grupo institucional está vacío, si lo está. */
export type MotivoSinRubricas =
  /** La institución no tiene ninguna ficha propia autorizada. */
  | 'SIN_PLANTILLAS'
  /** Tiene fichas propias, pero todavía nadie monitoreó con ellas. */
  | 'SIN_FICHAS';

export interface RubricasInstitucionales {
  rubricas: RubricaElegible[];
  /** `null` cuando hay al menos una rúbrica analizable. */
  motivoVacio: MotivoSinRubricas | null;
}

/**
 * Nombre corto de quien creó la ficha.
 *
 * Los nombres del padrón vienen completos —«ROSMINDA MAMANI HILASACA»— y no
 * entran en una píldora. Se toman el nombre y el primer apellido, que es como se
 * la nombra en la institución.
 */
const nombreCorto = (completo: string): string =>
  completo.trim().split(/\s+/).slice(0, 2).join(' ');

const ROTULO_INSTRUMENTO: Record<string, string> = {
  DOCENTE: 'Docente',
  DOCENTE_EIB: 'Docente EIB',
  DIRECTIVO: 'Directivo',
};

/**
 * Las rúbricas propias de la institución que tienen fichas para analizar.
 *
 * @param plantillas catálogo visible para esta persona.
 * @param conteoPorPlantilla fichas por plantilla, YA acotadas por los filtros de
 *   ámbito. Una rúbrica sin fichas en el ámbito elegido no se ofrece: se
 *   seleccionaría y el gráfico saldría vacío, sin decir por qué.
 */
export function rubricasInstitucionales(
  plantillas: readonly PlantillaAnalizable[],
  conteoPorPlantilla: ReadonlyMap<string, number>,
): RubricasInstitucionales {
  const propias = plantillas.filter((p) => p.ieId !== undefined);
  if (propias.length === 0) {
    return { rubricas: [], motivoVacio: 'SIN_PLANTILLAS' };
  }

  const conFichas = propias.filter((p) => (conteoPorPlantilla.get(p.id) ?? 0) > 0);
  if (conFichas.length === 0) {
    return { rubricas: [], motivoVacio: 'SIN_FICHAS' };
  }

  const nombres = conFichas.map((p) => nombreDePlantilla(p));
  // Cuántas veces se repite cada nombre: sólo se desambigua lo que hace falta.
  const repetido = new Map<string, number>();
  nombres.forEach((n) => repetido.set(n, (repetido.get(n) ?? 0) + 1));

  const rubricas = conFichas.map((p, i) => {
    const nombre = nombres[i]!;
    const cargo = etiquetaDeAutor(p.creadoPorRole);
    const autor = p.autorNombre ? nombreCorto(p.autorNombre) : cargo;
    const instrumento = ROTULO_INSTRUMENTO[p.instrumento] ?? p.instrumento;

    return {
      id: p.id,
      /**
       * El autor sólo entra en el rótulo cuando dos fichas se llaman igual.
       * Agregarlo siempre alargaría la píldora sin necesidad; no agregarlo nunca
       * deja dos botones idénticos que analizan cosas distintas.
       */
      label: (repetido.get(nombre) ?? 0) > 1 ? `${nombre} · ${autor}` : nombre,
      titulo: `${nombre} — ${autor} · ${cargo} · Ficha ${instrumento}`,
      autor,
      conteo: conteoPorPlantilla.get(p.id) ?? 0,
    };
  });

  // Las más usadas primero: es el orden en que se las va a buscar. A igual
  // cantidad, alfabético, para que la lista no baile entre recargas.
  return {
    rubricas: rubricas.sort(
      (a, b) => b.conteo - a.conteo || a.label.localeCompare(b.label, 'es'),
    ),
    motivoVacio: null,
  };
}
