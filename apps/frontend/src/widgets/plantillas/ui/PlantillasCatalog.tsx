import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Eye,
  Trash2,
  Calendar,
  List,
  BarChart3,
  FileText,
  RefreshCw,
  Copy,
  Edit
} from 'lucide-react';
import { Button } from '@shared/ui/button';
import { ConfirmModal } from '@shared/ui/ConfirmModal';
import { Card } from '@shared/ui/card';
import { Badge } from '@shared/ui/badge';
import { SelectField } from '@shared/ui/form-controls';
import { usePlantillas, type Plantilla } from '@entities/model-plantillas';
import { useUser } from '@entities/model-user';
import { PlantillaPreviewModal } from './PlantillaPreviewModal';

const createCopiedPlantilla = (plantilla: Plantilla, userId: string, userInstitucion: string): Plantilla => {
  return {
    ...plantilla,
    id: 'pl-copia-' + Date.now(),
    creadoPorRole: 'director_institucion',
    creadoPorId: userId,
    ieId: userInstitucion,
    estado: 'Borrador',
    fechaCreacion: new Date().toISOString().split('T')[0],
    descripcion: `Copia personalizada para mi I.E. basada en la ficha general de ${plantilla.tipoMonitoreo}.`,
  };
};

export const PlantillasCatalog = () => {
  const { plantillas, addPlantilla, deletePlantilla, togglePlantillaEstado } = usePlantillas();
  const navigate = useNavigate();
  const { user } = useUser();

  const isDirector = user?.role === 'director_institucion';

  // Filtrado inicial de plantillas basado en visibilidad según el rol
  const visiblePlantillas = useMemo(() => {
    if (isDirector) {
      // El director ve las plantillas generales de la UGEL y las propias de su institución
      return plantillas.filter(
        (p) =>
          !p.creadoPorRole ||
          p.creadoPorRole === 'jefe_gestion' ||
          (p.creadoPorRole === 'director_institucion' && p.ieId === user?.institucion)
      );
    }
    // El jefe de gestión y otros ven solo las generales (UGEL)
    return plantillas.filter((p) => !p.creadoPorRole || p.creadoPorRole === 'jefe_gestion');
  }, [plantillas, isDirector, user]);

  // ── Estados de Filtro ──
  const [searchText, setSearchText] = useState('');
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterAnio, setFilterAnio] = useState('Todos');

  // ── Estados de Modales ──
  const [previewTemplate, setPreviewTemplate] = useState<Plantilla | null>(null);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);

  // Años disponibles en el catálogo
  const aniosDisponibles = useMemo(() => {
    const years = new Set(visiblePlantillas.map((p) => p.anioAcademico));
    return Array.from(years).sort((a, b) => b - a);
  }, [visiblePlantillas]);

  // ── Filtrado de Plantillas ──
  const filteredPlantillas = useMemo(() => {
    return visiblePlantillas.filter((p) => {
      // Texto (Título o descripción)
      if (
        searchText &&
        !p.tipoMonitoreo.toLowerCase().includes(searchText.toLowerCase()) &&
        !p.descripcion.toLowerCase().includes(searchText.toLowerCase())
      ) {
        return false;
      }
      // Tipo Monitoreo
      if (filterTipo !== 'Todos' && p.tipoMonitoreo !== filterTipo) {
        return false;
      }
      // Estado
      if (filterEstado !== 'Todos' && p.estado !== filterEstado) {
        return false;
      }
      // Año
      if (filterAnio !== 'Todos' && p.anioAcademico !== Number(filterAnio)) {
        return false;
      }
      return true;
    });
  }, [visiblePlantillas, searchText, filterTipo, filterEstado, filterAnio]);

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearchText('');
    setFilterTipo('Todos');
    setFilterEstado('Todos');
    setFilterAnio('Todos');
  };

  const isAnyFilterActive = searchText !== '' || filterTipo !== 'Todos' || filterEstado !== 'Todos' || filterAnio !== 'Todos';

  // ── Acciones de Plantilla ──
  const handleDeleteConfirm = () => {
    if (!deleteTemplateId) return;
    deletePlantilla(deleteTemplateId);
    setDeleteTemplateId(null);
  };

  const handleDuplicate = (plantilla: Plantilla) => {
    if (!isDirector || !user) return;
    const copied = createCopiedPlantilla(plantilla, user.id, user.institucion || '');
    addPlantilla(copied);
  };

  // Helper para formatear fecha corta en español
  const formatShortDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-');
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 animate-in fade-in duration-300">
      {/* ── Barra de Filtros ── */}
      <Card className="p-4 border border-border bg-surface shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          {/* Buscador de Texto */}
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Buscar Plantilla
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por tipo, descripción..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Tipo de Monitoreo (Directores sólo pueden crear/filtrar docente, pero ven generales directivo) */}
          <div className="w-full md:w-60">
            <SelectField
              label="Tipo de Ficha"
              value={filterTipo}
              onChange={(val) => setFilterTipo(val)}
              placeholder="Todos los tipos"
              options={[
                { value: 'Todos', label: 'Todos los tipos' },
                { value: 'Monitoreo Docente', label: 'Monitoreo Docente' },
                { value: 'Monitoreo Directivo', label: 'Monitoreo Directivo' },
              ]}
            />
          </div>

          {/* Estado */}
          <div className="w-full md:w-44">
            <SelectField
              label="Estado"
              value={filterEstado}
              onChange={(val) => setFilterEstado(val)}
              placeholder="Todos los estados"
              options={[
                { value: 'Todos', label: 'Todos los estados' },
                { value: 'Vigente', label: 'Vigente' },
                { value: 'Borrador', label: 'Borrador' },
                { value: 'Histórico', label: 'Histórico' },
              ]}
            />
          </div>

          {/* Año Académico */}
          <div className="w-full md:w-36">
            <SelectField
              label="Año Académico"
              value={filterAnio}
              onChange={(val) => setFilterAnio(val)}
              placeholder="Todos los años"
              options={[
                { value: 'Todos', label: 'Todos los años' },
                ...aniosDisponibles.map((y) => ({ value: String(y), label: String(y) })),
              ]}
            />
          </div>

          {/* Botón de limpiar */}
          {isAnyFilterActive && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="text-xs font-semibold text-primary border-slate-200 hover:bg-slate-50 h-10 w-full md:w-auto cursor-pointer"
            >
              Limpiar
            </Button>
          )}
        </div>
      </Card>

      {/* ── Cuadrícula de Plantillas ── */}
      {filteredPlantillas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlantillas.map((plantilla) => {
            const isDocente = plantilla.tipoMonitoreo === 'Monitoreo Docente';
            const isGeneral = !plantilla.creadoPorRole || plantilla.creadoPorRole === 'jefe_gestion';

            return (
              <Card
                key={plantilla.id}
                className="bg-surface border border-border rounded-2xl p-5 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-5 group relative"
              >
                {/* Cabecera de la Tarjeta */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 border-slate-200 text-slate-600 bg-slate-50">
                        Año {plantilla.anioAcademico}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-bold px-2 py-0.5 border shadow-sm ${
                          isGeneral
                            ? 'bg-slate-50 text-slate-600 border-slate-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {isGeneral ? 'UGEL' : 'Mi I.E.'}
                      </Badge>
                    </div>
                    <Badge
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border shadow-sm ${
                        plantilla.estado === 'Vigente'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : plantilla.estado === 'Borrador'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {plantilla.estado}
                    </Badge>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-800 tracking-tight leading-snug group-hover:text-primary transition-colors">
                    {plantilla.tipoMonitoreo} {plantilla.anioAcademico}
                  </h3>

                  <div className="inline-flex">
                    <span className="text-[9px] font-black tracking-wide uppercase px-2 py-0.5 rounded border bg-primary-light border-primary/10 text-primary">
                      {isDocente ? 'Ficha Docente' : 'Ficha Directiva'}
                    </span>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed line-clamp-3 pt-1">
                    {plantilla.descripcion}
                  </p>
                </div>

                {/* Metadata Técnica */}
                <div className="border-t border-slate-100 pt-3.5 space-y-2 text-[11px] text-slate-500 font-semibold">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>Registrada:</span>
                    </span>
                    <span className="text-slate-800">{formatShortDate(plantilla.fechaCreacion)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <List className="h-3.5 w-3.5 text-primary" />
                      <span>Desempeños / Criterios:</span>
                    </span>
                    <span className="text-slate-800 font-bold">{plantilla.desempenos.length} evaluados</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="h-3.5 w-3.5 text-primary" />
                      <span>Calificación:</span>
                    </span>
                    <span className="text-slate-800">
                      Baremo {plantilla.baremo} ({plantilla.baremo === 'Vigente' ? '0-20' : '%'})
                    </span>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="space-y-2 pt-2">
                  <Button
                    onClick={() => setPreviewTemplate(plantilla)}
                    className="w-full justify-center bg-primary hover:bg-primary-hover text-white font-bold text-xs py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Ver Estructura (Mockup)</span>
                  </Button>

                  {isDirector && isGeneral ? (
                    /* Director de IE ve plantillas UGEL en sólo lectura, pero puede duplicarlas */
                    <button
                      onClick={() => handleDuplicate(plantilla)}
                      className="w-full justify-center border border-dashed border-primary text-primary hover:bg-primary-light text-[10px] font-extrabold uppercase py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Copiar y personalizar para mi I.E."
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copiar para mi I.E.</span>
                    </button>
                  ) : (
                    /* Creador de la plantilla puede cambiar su estado o eliminarla */
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => navigate(`/plantillas/${plantilla.id}/editar`)}
                        className="w-full justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-extrabold uppercase py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Modificar contenido"
                      >
                        <Edit className="h-3.5 w-3.5 text-primary" />
                        <span>Modificar Plantilla</span>
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePlantillaEstado(plantilla.id)}
                          className="flex-1 justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-extrabold uppercase py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          title="Cambiar Estado"
                        >
                          <RefreshCw className="h-3 w-3 text-primary animate-hover" />
                          <span>Cambiar Estado</span>
                        </button>
                        
                        <button
                          onClick={() => setDeleteTemplateId(plantilla.id)}
                          className="p-2 border border-rose-100 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar Plantilla"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <FileText className="h-14 w-14 text-slate-300 mx-auto stroke-1 mb-4" />
          <h3 className="text-slate-700 font-bold text-base">No se encontraron plantillas</h3>
          <p className="text-text-muted text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
            No existen plantillas de monitoreo que coincidan con los filtros seleccionados en este momento. Intente modificando los parámetros.
          </p>
        </div>
      )}

      {/* ── Modal Vista Previa de Estructura de Plantilla (Mockup) ── */}
      {previewTemplate && (
        <PlantillaPreviewModal
          plantilla={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}

      {/* ── Modal de Confirmación para Eliminado ── */}
      {deleteTemplateId && (
        <ConfirmModal
          title="¿Desea eliminar esta plantilla?"
          message={
            <span className="text-xs text-slate-600 leading-relaxed block">
              Esta acción eliminará de forma lógica la plantilla seleccionada del catálogo. No se podrán programar nuevos monitoreos asociados a esta ficha, aunque las visitas históricas completadas conservarán su información.
            </span>
          }
          confirmLabel="Eliminar Plantilla"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTemplateId(null)}
          danger
        />
      )}
    </div>
  );
};
