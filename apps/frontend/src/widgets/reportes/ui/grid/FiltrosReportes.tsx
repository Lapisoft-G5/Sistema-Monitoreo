import { Search, Filter, Calendar, Users } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { SelectField } from '@/shared/ui/form-controls';
import {
  FILTROS_PERIODO,
  type FiltroPeriodoTipo,
} from '@/features/reportes/lib/filtro-temporal';
import type { FiltroDeInstrumento } from '@/features/reportes/lib/instrumento';

const MODALIDADES = ['EBR', 'EBA', 'EBE', 'CEPTRO'];

const TODOS = 'Todos';

const FILTROS_TIPO = [
  { id: 'Todos', label: 'Todos' },
  { id: 'DOCENTE', label: 'Docente (Regular)' },
  { id: 'DOCENTE_EIB', label: 'Docente EIB' },
  { id: 'DIRECTIVO', label: 'Directivo' },
] as const;

interface BuscadorProps {
  etiqueta: string;
  marcador: string;
  valor: string;
  onCambiar: (valor: string) => void;
}

const Buscador = ({ etiqueta, marcador, valor, onCambiar }: BuscadorProps) => (
  <div className="space-y-1">
    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block pb-0.5">
      {etiqueta}
    </label>
    <div className="relative">
      <input
        type="text"
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        placeholder={marcador}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 text-xs leading-none h-9 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
      />
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
    </div>
  </div>
);

interface FiltrosReportesProps {
  /** Búsqueda por texto (opcional). Si no se pasa `setSearchQuery`, no se muestra. */
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  filterModalidad: string;
  setFilterModalidad: (m: string) => void;
  filterNivel: string;
  setFilterNivel: (n: string) => void;
  filterAnio: string;
  setFilterAnio: (a: string) => void;
  filterTipo?: FiltroDeInstrumento;
  setFilterTipo?: (tipo: FiltroDeInstrumento) => void;
  conteosTipo?: Record<string, number>;
  filtroPeriodo: FiltroPeriodoTipo;
  setFiltroPeriodo: (p: FiltroPeriodoTipo) => void;
  conteosPeriodo?: Record<FiltroPeriodoTipo, number>;
  nivelesDisponibles: string[];
  /**
   * Instituciones para filtrar (opcional). Cuando se pasan, se muestra el
   * selector de Institución, que cascadea con modalidad/nivel: cada nivel y cada
   * institución tienen sus propios docentes.
   */
  filterInstitucion?: string;
  setFilterInstitucion?: (id: string) => void;
  institucionesDisponibles?: { id: string; nombre: string }[];
  /**
   * Plantilla concreta (opcional). El análisis por criterio sólo es coherente
   * dentro de una misma rúbrica, así que cuando conviven varias (la oficial UGEL
   * y los clones de IE) se elige una y nunca se mezclan. Sin «Todas», a propósito.
   */
  filterPlantilla?: string;
  setFilterPlantilla?: (id: string) => void;
  plantillasDisponibles?: { id: string; nombre: string }[];
  /** Docentes para filtrar (opcional). Cascadea con institución/nivel/modalidad. */
  filterDocente?: string;
  setFilterDocente?: (id: string) => void;
  docentesDisponibles?: { id: string; nombre: string }[];
  /** Nº de monitoreo (1er, 2do, …) opcional. Se muestra si se pasa el setter. */
  filterNumeroVisita?: string;
  setFilterNumeroVisita?: (n: string) => void;
  numerosDeVisitaDisponibles?: number[];
  añosDisponibles: string[];
  isAnyFilterActive: boolean;
  handleClearFilters: () => void;
  /**
   * Si el filtro de año admite «Todos los años».
   *
   * El Análisis de Desempeño exige elegir uno: sus criterios cambian de un año
   * a otro, de modo que agregarlos pone criterios distintos en el mismo eje.
   */
  permitirTodosLosAnios?: boolean;
  /**
   * Si el filtro de Tipo admite «Todos». El Análisis de Desempeño no lo permite:
   * mezclar instrumentos pone rúbricas con distinta cantidad de criterios en el
   * mismo eje. Los reportes que son listas sí lo permiten (default).
   */
  permitirTipoTodos?: boolean;
  /**
   * Fija el ámbito Modalidad/Nivel/Institución. El director de institución mira
   * siempre su propio colegio: esos tres no varían para él, así que llegan
   * precargados y bloqueados y sólo mueve el docente (y período/tipo/año).
   */
  bloquearAmbito?: boolean;
  /** El docente evaluado ve una versión reducida: sólo búsqueda y año. */
  isEvaluatedView: boolean;
}

export const FiltrosReportes = ({
  searchQuery,
  setSearchQuery,
  filterModalidad,
  setFilterModalidad,
  filterNivel,
  setFilterNivel,
  filterAnio,
  setFilterAnio,
  filterTipo,
  setFilterTipo,
  conteosTipo,
  filtroPeriodo,
  setFiltroPeriodo,
  conteosPeriodo,
  nivelesDisponibles,
  filterInstitucion,
  setFilterInstitucion,
  institucionesDisponibles = [],
  filterPlantilla,
  setFilterPlantilla,
  plantillasDisponibles = [],
  filterDocente,
  setFilterDocente,
  docentesDisponibles = [],
  filterNumeroVisita,
  setFilterNumeroVisita,
  numerosDeVisitaDisponibles = [],
  añosDisponibles,
  isAnyFilterActive,
  handleClearFilters,
  isEvaluatedView,
  permitirTodosLosAnios = true,
  permitirTipoTodos = true,
  bloquearAmbito = false,
}: FiltrosReportesProps) => {
  const opcionesDeTipo = permitirTipoTodos
    ? FILTROS_TIPO
    : FILTROS_TIPO.filter((t) => t.id !== 'Todos');

  const selectorDeAnio = (
    <SelectField
      label="Año"
      value={filterAnio}
      onChange={setFilterAnio}
      placeholder={permitirTodosLosAnios ? 'Todos los años' : 'Seleccione un año'}
      options={[
        ...(permitirTodosLosAnios ? [{ value: TODOS, label: 'Todos los años' }] : []),
        ...añosDisponibles.map((a) => ({ value: a, label: a })),
      ]}
    />
  );

  return (
    <Card className="p-5 border border-border bg-surface shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
          <Filter className="h-4 w-4 text-primary" />
          <span>Filtros de Reporte</span>
        </div>
        {isAnyFilterActive && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs text-primary hover:text-primary-hover h-8 px-3 rounded-lg cursor-pointer"
          >
            Limpiar Filtros
          </Button>
        )}
      </div>

      {/* Fila de Filtros Rápidos (Período y Tipo de Monitoreo) */}
      <div className="flex flex-wrap items-center gap-y-3 gap-x-6 pt-0.5">
        {/* Píldoras por Período */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Calendar className="w-3.5 h-3.5 text-primary" /> Período:
          </span>
          {FILTROS_PERIODO.map((item) => {
            const activo = filtroPeriodo === item.id;
            const conteo = conteosPeriodo ? conteosPeriodo[item.id] : undefined;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFiltroPeriodo(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                  activo
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{item.label}</span>
                {conteo !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activo
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {conteo}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Píldoras por Tipo de Monitoreo (Docente vs Directivo) */}
        {!isEvaluatedView && setFilterTipo && (
          <div className="flex flex-wrap items-center gap-2 border-l border-slate-200 pl-4 sm:pl-6">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Users className="w-3.5 h-3.5 text-primary" /> Tipo:
            </span>
            {opcionesDeTipo.map((item) => {
              const activo = (filterTipo || 'Todos') === item.id;
              const conteo = conteosTipo ? conteosTipo[item.id] : undefined;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilterTipo(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                    activo
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{item.label}</span>
                  {conteo !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        activo
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {conteo}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {isEvaluatedView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Buscador
            etiqueta="Buscar por IE o Especialista"
            marcador="Nombre de la IE o del especialista..."
            valor={searchQuery ?? ''}
            onCambiar={setSearchQuery ?? (() => {})}
          />
          {selectorDeAnio}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {setSearchQuery && (
            <Buscador
              etiqueta="Búsqueda Rápida"
              marcador="IE, especialista o docente..."
              valor={searchQuery ?? ''}
              onCambiar={setSearchQuery}
            />
          )}

          <SelectField
            label="Modalidad"
            value={filterModalidad}
            onChange={setFilterModalidad}
            disabled={bloquearAmbito}
            placeholder="Todas las modalidades"
            options={[
              { value: TODOS, label: 'Todas las modalidades' },
              ...MODALIDADES.map((m) => ({ value: m, label: m })),
            ]}
          />

          <SelectField
            label="Nivel Educativo"
            value={filterNivel}
            onChange={setFilterNivel}
            disabled={bloquearAmbito || filterModalidad === TODOS}
            placeholder="Todos los niveles"
            options={[
              { value: TODOS, label: 'Todos los niveles' },
              ...nivelesDisponibles.map((n) => ({ value: n, label: n })),
            ]}
          />

          {setFilterInstitucion && (
            <SelectField
              label="Institución Educativa"
              value={filterInstitucion ?? TODOS}
              onChange={setFilterInstitucion}
              disabled={bloquearAmbito || institucionesDisponibles.length === 0}
              placeholder="Todas las instituciones"
              options={[
                { value: TODOS, label: 'Todas las instituciones' },
                ...institucionesDisponibles.map((i) => ({ value: i.id, label: i.nombre })),
              ]}
            />
          )}

          {setFilterPlantilla && (
            <SelectField
              label="Plantilla"
              value={filterPlantilla ?? ''}
              onChange={setFilterPlantilla}
              disabled={plantillasDisponibles.length <= 1}
              placeholder="Seleccione una plantilla"
              options={plantillasDisponibles.map((p) => ({ value: p.id, label: p.nombre }))}
            />
          )}

          {setFilterDocente && (
            <SelectField
              label="Docente"
              value={filterDocente ?? TODOS}
              onChange={setFilterDocente}
              disabled={docentesDisponibles.length === 0}
              placeholder="Todos los docentes"
              options={[
                { value: TODOS, label: 'Todos los docentes' },
                ...docentesDisponibles.map((d) => ({ value: d.id, label: d.nombre })),
              ]}
            />
          )}

          {setFilterNumeroVisita && (
            <SelectField
              label="Nº de Monitoreo"
              value={filterNumeroVisita ?? TODOS}
              onChange={setFilterNumeroVisita}
              disabled={numerosDeVisitaDisponibles.length === 0}
              placeholder="Todos"
              options={[
                { value: TODOS, label: 'Todos' },
                ...numerosDeVisitaDisponibles.map((n) => ({
                  value: String(n),
                  label: `${n}° monitoreo`,
                })),
              ]}
            />
          )}

          {selectorDeAnio}
        </div>
      )}
    </Card>
  );
};
