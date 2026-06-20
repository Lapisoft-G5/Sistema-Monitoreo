import { useState, useMemo } from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { PageHeader } from '@shared/ui/pageHeader';
import { useUser } from '@entities/model-user';
import { useCronogramas } from '@entities/model-cronogramas';
import { CalendarioGrid, CalendarioSidebar } from '@widgets/calendario';
import { BandejaReprogramaciones } from '@widgets/reprogramaciones';
import { MODALIDAD_NIVEL_MAP } from '@sistema-monitoreo/shared-contracts';

export const CalendarioPage = () => {
  const { user } = useUser();
  const isEspecialista = user?.role === 'especialista';
  const { cronogramas, reprogramaciones } = useCronogramas();

  // ── Estados de Navegación ──
  const [activeTab, setActiveTab] = useState<'CALENDARIO' | 'SOLICITUDES'>('CALENDARIO');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2023, 9, 15, 12, 0, 0));
  const [activeView, setActiveView] = useState<'MENSUAL' | 'SEMANAL' | 'DIARIO' | 'ANUAL' | 'LISTA'>('MENSUAL');

  // ── Selección activa de fecha y visita ──
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2023-10-12');
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>('13');
  const [showDetailsPanel, setShowDetailsPanel] = useState<boolean>(true);

  // ── Filtros del Calendario ──
  const [filterModalidad, setFilterModalidad] = useState('Todos');
  const [filterNivel, setFilterNivel] = useState('Todos');
  const [filterEspecialista, setFilterEspecialista] = useState('Todos');
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [filterNroVisita, setFilterNroVisita] = useState('Todos');
  const [filterEstado, setFilterEstado] = useState('Todos');

  const isDirector = user?.role === 'director_ie' || user?.role === 'director_institucion';

  // Cascading Nivel Options
  const nivelesDisponibles = useMemo(() => {
    if (filterModalidad === 'Todos') return [];
    return MODALIDAD_NIVEL_MAP[filterModalidad as keyof typeof MODALIDAD_NIVEL_MAP] || [];
  }, [filterModalidad]);

  const handleModalidadChange = (modalidad: string) => {
    setFilterModalidad(modalidad);
    setFilterNivel('Todos');
  };

  const isAnyFilterActive = isDirector
    ? filterTipo !== 'Todos' ||
      filterEspecialista !== 'Todos' ||
      filterNroVisita !== 'Todos' ||
      filterEstado !== 'Todos'
    : filterModalidad !== 'Todos' ||
      filterNivel !== 'Todos' ||
      filterEspecialista !== 'Todos' ||
      filterTipo !== 'Todos';

  const handleClearFilters = () => {
    setFilterModalidad('Todos');
    setFilterNivel('Todos');
    setFilterEspecialista('Todos');
    setFilterTipo('Todos');
    setFilterNroVisita('Todos');
    setFilterEstado('Todos');
  };

  // Nombre del especialista logueado para filtro
  const specialistFilterName = useMemo(() => {
    if (!isEspecialista || !user) return '';
    const firstName = user.nombres.split(' ')[0].toLowerCase();
    
    if (firstName.startsWith('juan')) return 'Juan Pérez';
    if (firstName.startsWith('maría') || firstName.startsWith('maria')) return 'María García';
    if (firstName.startsWith('ana')) return 'Ana Torres';
    if (firstName.startsWith('pedro')) return 'Pedro Alvarado';
    if (firstName.startsWith('rosa')) return 'Rosa Quispe';
    if (firstName.startsWith('luis')) return 'Luis Mamani';
    if (firstName.startsWith('sofía') || firstName.startsWith('sofia')) return 'Sofía Ramos';
    if (firstName.startsWith('klisman')) return 'Klisman Condori';
    if (firstName.startsWith('jean')) return 'Jean Carlos Choque';
    
    return 'Juan Pérez'; // fallback
  }, [isEspecialista, user]);

  // Obtener lista única de especialistas
  const listaEspecialistas = useMemo(() => {
    const list = new Set<string>();
    cronogramas.forEach((c) => {
      if (c.especialista) list.add(c.especialista);
    });
    return Array.from(list);
  }, [cronogramas]);

  // Conteo de solicitudes pendientes
  const pendingCount = useMemo(() => {
    return cronogramas.reduce((acc, visit) => {
      const req = reprogramaciones[visit.id];
      if (req && req.estado === 'PENDIENTE') {
        return acc + 1;
      }
      return acc;
    }, 0);
  }, [cronogramas, reprogramaciones]);

  // Filtrado de visitas
  const filteredVisits = useMemo(() => {
    return cronogramas.filter((visit) => {
      if (isEspecialista && specialistFilterName) {
        if (visit.especialista !== specialistFilterName) {
          return false;
        }
      }
      if (isDirector && user) {
        const isSameSchool =
          user.institucionNombre &&
          visit.institucion.toLowerCase() === user.institucionNombre.toLowerCase();

        const userFullName = `${user.nombres} ${user.apellidos}`.toLowerCase();
        const isDirectedToMe =
          visit.tipo === 'DIRECTIVO' &&
          (visit.docenteDirectivo.toLowerCase().includes(userFullName) ||
            userFullName.includes(visit.docenteDirectivo.toLowerCase()) ||
            visit.docenteDirectivo.toLowerCase().includes(user.nombres.toLowerCase()));

        if (!isSameSchool && !isDirectedToMe) {
          return false;
        }
      }

      // Filtros específicos de Director
      if (isDirector) {
        if (filterNroVisita !== 'Todos' && visit.nroVisita !== filterNroVisita) return false;
        if (filterEstado !== 'Todos' && visit.estado !== filterEstado) return false;
      } else {
        // Filtros de UGEL
        if (filterModalidad !== 'Todos' && visit.modalidad !== filterModalidad) return false;
        if (filterNivel !== 'Todos' && visit.nivel !== filterNivel) return false;
      }

      // Filtros compartidos
      if (filterEspecialista !== 'Todos' && visit.especialista !== filterEspecialista) return false;
      if (filterTipo !== 'Todos' && visit.tipo !== filterTipo) return false;

      return true;
    });
  }, [
    cronogramas,
    isEspecialista,
    specialistFilterName,
    isDirector,
    user,
    filterModalidad,
    filterNivel,
    filterEspecialista,
    filterTipo,
    filterNroVisita,
    filterEstado
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Encabezado de Página ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Calendario de Monitoreo"
          description="Planificación y seguimiento de visitas institucionales."
        />

        {/* Toggle de vistas principal */}
        {activeTab === 'CALENDARIO' && (
          <div className="inline-flex rounded-xl border border-border p-1 bg-surface shadow-sm">
            {(['MENSUAL', 'SEMANAL', 'DIARIO', 'ANUAL', 'LISTA'] as const).map((view) => (
              <button
                key={view}
                onClick={() => {
                  setActiveView(view);
                  if (view === 'DIARIO') {
                    const currStr = `${currentDate.getFullYear()}-${String(
                      currentDate.getMonth() + 1
                    ).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
                    setSelectedDateStr(currStr);
                    const dayVisits = filteredVisits.filter(
                      (v) => v.fechaHora.substring(0, 10) === currStr
                    );
                    if (dayVisits.length > 0) {
                      setSelectedVisitId(dayVisits[0].id);
                    }
                  }
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeView === view
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-muted hover:text-text hover:bg-slate-50'
                }`}
              >
                {view === 'MENSUAL'
                  ? 'Mensual'
                  : view === 'SEMANAL'
                    ? 'Semanal'
                    : view === 'DIARIO'
                      ? 'Diario'
                      : view === 'ANUAL'
                        ? 'Anual'
                        : 'Lista'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabs de Navegación Principal ── */}
      <div className="border-b border-border flex gap-6 pb-px">
        <button
          onClick={() => setActiveTab('CALENDARIO')}
          className={`pb-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 relative cursor-pointer ${
            activeTab === 'CALENDARIO'
              ? 'border-primary text-primary font-extrabold'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Calendario de Monitoreos</span>
        </button>
        <button
          onClick={() => setActiveTab('SOLICITUDES')}
          className={`pb-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 relative cursor-pointer ${
            activeTab === 'SOLICITUDES'
              ? 'border-primary text-primary font-extrabold'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Bandeja de Reprogramaciones</span>
          {pendingCount > 0 && (
            <span className="absolute -top-1.5 -right-3.5 bg-amber-500 text-white font-extrabold text-[9px] h-4.5 min-w-4.5 px-1.5 rounded-full flex items-center justify-center border border-surface shadow-sm animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'CALENDARIO' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda: Calendario */}
          <div className={showDetailsPanel ? 'lg:col-span-8' : 'lg:col-span-12'}>
            <CalendarioGrid
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              activeView={activeView}
              setActiveView={setActiveView}
              selectedDateStr={selectedDateStr}
              setSelectedDateStr={setSelectedDateStr}
              selectedVisitId={selectedVisitId}
              setSelectedVisitId={setSelectedVisitId}
              filteredVisits={filteredVisits}
              showDetailsPanel={showDetailsPanel}
              setShowDetailsPanel={setShowDetailsPanel}
              filterModalidad={filterModalidad}
              setFilterModalidad={handleModalidadChange}
              filterNivel={filterNivel}
              setFilterNivel={setFilterNivel}
              filterEspecialista={filterEspecialista}
              setFilterEspecialista={setFilterEspecialista}
              filterTipo={filterTipo}
              setFilterTipo={setFilterTipo}
              filterNroVisita={filterNroVisita}
              setFilterNroVisita={setFilterNroVisita}
              filterEstado={filterEstado}
              setFilterEstado={setFilterEstado}
              listaEspecialistas={listaEspecialistas}
              nivelesDisponibles={nivelesDisponibles}
              isAnyFilterActive={isAnyFilterActive}
              handleClearFilters={handleClearFilters}
            />
          </div>

          {/* Columna Derecha: Sidebar de detalles */}
          {showDetailsPanel && (
            <CalendarioSidebar
              selectedVisitId={selectedVisitId}
              setSelectedVisitId={setSelectedVisitId}
              selectedDateStr={selectedDateStr}
              onClose={() => setShowDetailsPanel(false)}
              filteredVisits={filteredVisits}
            />
          )}
        </div>
      ) : (
        <BandejaReprogramaciones />
      )}
    </div>
  );
};
