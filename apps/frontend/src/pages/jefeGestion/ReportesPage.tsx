import { useState, useMemo } from 'react';
import { Grid, List } from 'lucide-react';
import { useCronogramas } from '@entities/model-cronogramas';
import { usePlantillas } from '@entities/model-plantillas';
import { useFichasCompletadas } from '@entities/model-reportes';
import { PageHeader } from '@shared/ui/pageHeader';
import { ReportesStats, ReportesGrid } from '@widgets/reportes';
import { MODALIDAD_NIVEL_MAP } from '@sistema-monitoreo/shared-contracts';

const getFichaState = (visitId: string) => {
  const saved = localStorage.getItem(`sistema-monitoreo:ficha-state:${visitId}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (err) {
      console.warn('Invalid JSON in localStorage', err);
    }
  }
  
  // Mock pre-filled state for completed mock visits
  const defaultComments = 'Se evidencia un óptimo desempeño de las actividades. El plan de trabajo institucional está alineado con las directrices de la UGEL. Se recomienda reforzar el acompañamiento en aula para asegurar la continuidad pedagógica e incrementar el monitoreo formativo.';
  const defaultAspects: Record<string, boolean> = {
    'd1_a1': true, 'd1_a2': true, 'd1_a3': true,
    'd2_a1': true, 'd2_a2': true, 'd2_a3': false,
    'd3_a1': true, 'd3_a2': true, 'd3_a3': true,
    'a1_1': true, 'a1_2': true, 'a1_3': true,
    'a2_1': true, 'a2_2': true, 'a2_3': true,
    'a3_1': true, 'a3_2': true, 'a3_3': false,
    'dd1_a1': true, 'dd1_a2': true, 'dd1_a3': true,
    'dd2_a1': true, 'dd2_a2': true, 'dd2_a3': true,
    'dd3_a1': true, 'dd3_a2': true, 'dd3_a3': true,
    'ad1_1': true, 'ad1_2': true, 'ad1_3': true,
    'ad2_1': true, 'ad2_2': true, 'ad2_3': true,
    'ad3_1': true, 'ad3_2': true, 'ad3_3': true,
  };
  
  const defaultLevels: Record<string, string> = {
    'd1': 'III', 'd2': 'III', 'd3': 'IV',
    'a1': 'III', 'a2': 'III', 'a3': 'IV',
    'dd1': 'III', 'dd2': 'III', 'dd3': 'IV',
    'ad1': 'III', 'ad2': 'III', 'ad3': 'IV',
  };
  
  return {
    checkedAspects: defaultAspects,
    selectedLevels: defaultLevels,
    generalComments: defaultComments
  };
};

export const ReportesPage = () => {
  const { cronogramas } = useCronogramas();
  const { plantillas } = usePlantillas();
  // Carga paralela desde el backend. Si falla, el componente sigue mostrando
  // los datos locales (localStorage) - el query solo agrega data del server.
  const { data: _fichasCompletadasData } = useFichasCompletadas({ page: 1, limit: 50 });
  void _fichasCompletadasData; // disponible para futura UI - sprint 4

  // ── Estados de Vista e Interacción ──
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // ── Filtros ──
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalidad, setFilterModalidad] = useState('Todos');
  const [filterNivel, setFilterNivel] = useState('Todos');
  const [filterTipo, setFilterTipo] = useState('Todos');

  // Cascading Nivel
  const nivelesDisponibles = useMemo(() => {
    if (filterModalidad === 'Todos') return [];
    return MODALIDAD_NIVEL_MAP[filterModalidad as keyof typeof MODALIDAD_NIVEL_MAP] || [];
  }, [filterModalidad]);

  const handleModalidadChange = (modalidad: string) => {
    setFilterModalidad(modalidad);
    setFilterNivel('Todos');
  };

  // ── Filtrado de Fichas Completadas ──
  const completedVisits = useMemo(() => {
    return cronogramas.filter((c) => c.estado === 'COMPLETADO');
  }, [cronogramas]);

  const filteredVisits = useMemo(() => {
    return completedVisits.filter((visit) => {
      // Búsqueda por texto
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchIE = visit.institucion.toLowerCase().includes(query);
        const matchDocente = visit.docenteDirectivo.toLowerCase().includes(query);
        const matchEspecialista = visit.especialista.toLowerCase().includes(query);
        if (!matchIE && !matchDocente && !matchEspecialista) return false;
      }

      if (filterModalidad !== 'Todos' && visit.modalidad !== filterModalidad) return false;
      if (filterNivel !== 'Todos' && visit.nivel !== filterNivel) return false;
      if (filterTipo !== 'Todos' && visit.tipo !== filterTipo) return false;

      return true;
    });
  }, [completedVisits, searchQuery, filterModalidad, filterNivel, filterTipo]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterModalidad('Todos');
    setFilterNivel('Todos');
    setFilterTipo('Todos');
  };

  const isAnyFilterActive =
    searchQuery !== '' || filterModalidad !== 'Todos' || filterNivel !== 'Todos' || filterTipo !== 'Todos';

  // ── Métricas Estadísticas (KPIs) ──
  const stats = useMemo(() => {
    const total = completedVisits.length;
    const docentes = completedVisits.filter((v) => v.tipo === 'DOCENTE').length;
    const directivos = completedVisits.filter((v) => v.tipo === 'DIRECTIVO').length;

    // Calcular promedios de calificación simulados / cargados
    let totalLevelsCount = 0;
    let highLevelsCount = 0; // Niveles III y IV

    completedVisits.forEach((v) => {
      const fichaState = getFichaState(v.id);
      Object.values(fichaState.selectedLevels).forEach((level) => {
        totalLevelsCount++;
        if (level === 'III' || level === 'IV') {
          highLevelsCount++;
        }
      });
    });

    const satisfactionPercent =
      totalLevelsCount > 0 ? Math.round((highLevelsCount / totalLevelsCount) * 100) : 85;

    // Contar IEs únicas
    const uniqueIEs = new Set(completedVisits.map((v) => v.institucion.split(' - ')[0])).size;

    return {
      total,
      docentes,
      directivos,
      satisfactionPercent,
      uniqueIEs,
    };
  }, [completedVisits]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Encabezado de Página ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <PageHeader
            title="Fichas Completadas en Cuadrícula"
            description="Bandeja consolidada para auditar y descargar las fichas técnicas de monitoreo completadas por los especialistas."
          />
        </div>

        {/* Toggle Grid vs Table */}
        <div className="inline-flex rounded-xl border border-border p-1 bg-surface shadow-sm self-start md:self-auto">
          <button
            onClick={() => setViewMode('GRID')}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              viewMode === 'GRID'
                ? 'bg-primary text-white shadow-md'
                : 'text-text-muted hover:text-text hover:bg-slate-50'
            }`}
            title="Vista de Cuadrícula"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('TABLE')}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              viewMode === 'TABLE'
                ? 'bg-primary text-white shadow-md'
                : 'text-text-muted hover:text-text hover:bg-slate-50'
            }`}
            title="Vista de Tabla"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Módulos de KPIs ── */}
      <ReportesStats stats={stats} />

      {/* ── Listado Principal con Filtros ── */}
      <ReportesGrid
        filteredVisits={filteredVisits}
        viewMode={viewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterModalidad={filterModalidad}
        setFilterModalidad={handleModalidadChange}
        filterNivel={filterNivel}
        setFilterNivel={setFilterNivel}
        filterTipo={filterTipo}
        setFilterTipo={setFilterTipo}
        nivelesDisponibles={nivelesDisponibles}
        isAnyFilterActive={isAnyFilterActive}
        handleClearFilters={handleClearFilters}
        plantillas={plantillas}
      />
    </div>
  );
};
