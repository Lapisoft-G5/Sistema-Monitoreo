import { useState, useMemo, useEffect } from 'react';
import { Compass, PlusCircle, Search, Trash2, Eye, Pencil, X, AlertCircle, Calendar, User, BookOpen, Layers } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { PageHeader } from '@shared/ui/pageHeader';
import { ConfirmModal } from '@shared/ui/ConfirmModal';
import { TextField, SelectField } from '@shared/ui/form-controls';
import { Card } from '@shared/ui/card';
import { Badge } from '@shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { TablePagination } from '@shared/ui/table-pagination';

interface Cronograma {
  id: string;
  fecha: string;
  especialista: string;
  especialistaInitials: string;
  institucion: string;
  docenteDirectivo: string;
  tipo: 'PEDAGÓGICO' | 'DIRECTIVO';
  nroVisita: string;
  estado: 'PROGRAMADO' | 'EN PROCESO' | 'COMPLETADO' | 'REPROGRAMADO' | 'CANCELADO';
}

const MOCK_CRONOGRAMAS: Cronograma[] = [
  {
    id: '1',
    fecha: '2023-10-15',
    especialista: 'Juan Pérez',
    especialistaInitials: 'JP',
    institucion: 'IE 1023 Santa Rosa',
    docenteDirectivo: 'Ana Miranda Ortiz',
    tipo: 'PEDAGÓGICO',
    nroVisita: '02',
    estado: 'PROGRAMADO',
  },
  {
    id: '2',
    fecha: '2023-10-18',
    especialista: 'María García',
    especialistaInitials: 'MG',
    institucion: 'IE 4055 Libertador',
    docenteDirectivo: 'Roberto Sánchez',
    tipo: 'DIRECTIVO',
    nroVisita: '01',
    estado: 'EN PROCESO',
  },
  {
    id: '3',
    fecha: '2023-10-20',
    especialista: 'Carlos Mendoza',
    especialistaInitials: 'CM',
    institucion: 'IE 3022 Sagrado Corazón',
    docenteDirectivo: 'Luis Alberto Arce',
    tipo: 'PEDAGÓGICO',
    nroVisita: '03',
    estado: 'COMPLETADO',
  },
  {
    id: '4',
    fecha: '2023-10-22',
    especialista: 'Ana Torres',
    especialistaInitials: 'AT',
    institucion: 'IE 5011 Fe y Alegría',
    docenteDirectivo: 'Carmen Rosa Díaz',
    tipo: 'PEDAGÓGICO',
    nroVisita: '01',
    estado: 'REPROGRAMADO',
  },
  {
    id: '5',
    fecha: '2023-10-25',
    especialista: 'Juan Pérez',
    especialistaInitials: 'JP',
    institucion: 'IE 4055 Libertador',
    docenteDirectivo: 'Sofía Ramos',
    tipo: 'DIRECTIVO',
    nroVisita: '02',
    estado: 'CANCELADO',
  },
  {
    id: '6',
    fecha: '2023-10-28',
    especialista: 'María García',
    especialistaInitials: 'MG',
    institucion: 'IE 1023 Santa Rosa',
    docenteDirectivo: 'Pedro Infante',
    tipo: 'PEDAGÓGICO',
    nroVisita: '01',
    estado: 'PROGRAMADO',
  },
  {
    id: '7',
    fecha: '2023-11-02',
    especialista: 'Carlos Mendoza',
    especialistaInitials: 'CM',
    institucion: 'IE 5011 Fe y Alegría',
    docenteDirectivo: 'Juana de Arco',
    tipo: 'DIRECTIVO',
    nroVisita: '04',
    estado: 'PROGRAMADO',
  },
  {
    id: '8',
    fecha: '2023-11-05',
    especialista: 'Ana Torres',
    especialistaInitials: 'AT',
    institucion: 'IE 3022 Sagrado Corazón',
    docenteDirectivo: 'Julio César',
    tipo: 'PEDAGÓGICO',
    nroVisita: '02',
    estado: 'EN PROCESO',
  },
  {
    id: '9',
    fecha: '2023-11-10',
    especialista: 'Juan Pérez',
    especialistaInitials: 'JP',
    institucion: 'IE 3022 Sagrado Corazón',
    docenteDirectivo: 'Marco Aurelio',
    tipo: 'PEDAGÓGICO',
    nroVisita: '01',
    estado: 'COMPLETADO',
  },
  {
    id: '10',
    fecha: '2023-11-12',
    especialista: 'María García',
    especialistaInitials: 'MG',
    institucion: 'IE 5011 Fe y Alegría',
    docenteDirectivo: 'Cleopatra',
    tipo: 'DIRECTIVO',
    nroVisita: '03',
    estado: 'PROGRAMADO',
  },
  {
    id: '11',
    fecha: '2023-11-15',
    especialista: 'Carlos Mendoza',
    especialistaInitials: 'CM',
    institucion: 'IE 1023 Santa Rosa',
    docenteDirectivo: 'Simón Bolívar',
    tipo: 'PEDAGÓGICO',
    nroVisita: '02',
    estado: 'REPROGRAMADO',
  },
  {
    id: '12',
    fecha: '2023-11-18',
    especialista: 'Ana Torres',
    especialistaInitials: 'AT',
    institucion: 'IE 4055 Libertador',
    docenteDirectivo: 'José de San Martín',
    tipo: 'DIRECTIVO',
    nroVisita: '01',
    estado: 'COMPLETADO',
  },
];

const ESPECIALISTAS_LIST = ['Juan Pérez', 'María García', 'Carlos Mendoza', 'Ana Torres'];
const INSTITUCIONES_LIST = [
  'IE 1023 Santa Rosa',
  'IE 4055 Libertador',
  'IE 3022 Sagrado Corazón',
  'IE 5011 Fe y Alegría',
];

export const CronogramaPage = () => {
  // --- Estados de Datos ---
  const [cronogramas, setCronogramas] = useState<Cronograma[]>(MOCK_CRONOGRAMAS);

  // --- Estados de Filtro ---
  const [searchEsp, setSearchEsp] = useState('');
  const [filterInst, setFilterInst] = useState('Todos');
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);

  // --- Estados de Registro / Edición ---
  const [showFormModal, setShowFormModal] = useState(false);
  const [editCronogramaId, setEditCronogramaId] = useState<string | null>(null);

  // --- Valores del Formulario ---
  const [formFecha, setFormFecha] = useState(new Date().toISOString().split('T')[0]);
  const [formEspecialista, setFormEspecialista] = useState('');
  const [formInstitucion, setFormInstitucion] = useState('');
  const [formDocente, setFormDocente] = useState('');
  const [formTipo, setFormTipo] = useState<'PEDAGÓGICO' | 'DIRECTIVO'>('PEDAGÓGICO');
  const [formVisita, setFormVisita] = useState('01');
  const [formEstado, setFormEstado] = useState<Cronograma['estado']>('PROGRAMADO');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // --- Estados de Detalles / Ver ---
  const [viewCronograma, setViewCronograma] = useState<Cronograma | null>(null);

  // --- Estado de Eliminado / Desactivación ---
  const [deleteCronogramaId, setDeleteCronogramaId] = useState<string | null>(null);

  // --- Resetear Paginación ante cambios en Filtros ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchEsp, filterInst, filterTipo, filterEstado]);

  // --- Procesamiento de Iniciales ---
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getInitialsColor = (initials: string) => {
    switch (initials) {
      case 'JP':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400';
      case 'MG':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400';
      case 'CM':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400';
      case 'AT':
        return 'bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  // --- Formateador de Fecha de Tabla ---
  const formatTableDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split('-');
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // --- Lógica de Filtro ---
  const filteredCronogramas = useMemo(() => {
    return cronogramas.filter((item) => {
      const matchSearch =
        searchEsp.trim() === '' ||
        item.especialista.toLowerCase().includes(searchEsp.toLowerCase());

      const matchInst = filterInst === 'Todos' || item.institucion === filterInst;
      const matchTipo = filterTipo === 'Todos' || item.tipo === filterTipo;
      const matchEstado = filterEstado === 'Todos' || item.estado === filterEstado;

      return matchSearch && matchInst && matchTipo && matchEstado;
    });
  }, [cronogramas, searchEsp, filterInst, filterTipo, filterEstado]);

  // --- Paginación local ---
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredCronogramas.length / itemsPerPage) || 1;
  const fromIndex = (currentPage - 1) * itemsPerPage;
  const toIndex = Math.min(currentPage * itemsPerPage, filteredCronogramas.length);

  const paginatedCronogramas = useMemo(() => {
    return filteredCronogramas.slice(fromIndex, toIndex);
  }, [filteredCronogramas, fromIndex, toIndex]);

  // --- Abrir Modal de Registro ---
  const handleOpenCreate = () => {
    setEditCronogramaId(null);
    setFormFecha(new Date().toISOString().split('T')[0]);
    setFormEspecialista(ESPECIALISTAS_LIST[0]);
    setFormInstitucion(INSTITUCIONES_LIST[0]);
    setFormDocente('');
    setFormTipo('PEDAGÓGICO');
    setFormVisita('01');
    setFormEstado('PROGRAMADO');
    setFormError(null);
    setFormSubmitted(false);
    setShowFormModal(true);
  };

  // --- Abrir Modal de Edición ---
  const handleOpenEdit = (item: Cronograma) => {
    setEditCronogramaId(item.id);
    setFormFecha(item.fecha);
    setFormEspecialista(item.especialista);
    setFormInstitucion(item.institucion);
    setFormDocente(item.docenteDirectivo);
    setFormTipo(item.tipo);
    setFormVisita(item.nroVisita);
    setFormEstado(item.estado);
    setFormError(null);
    setFormSubmitted(false);
    setShowFormModal(true);
  };

  // --- Guardar Formulario ---
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setFormError(null);

    if (!formDocente.trim() || !formVisita.trim()) {
      setFormError('Todos los campos con asterisco (*) son obligatorios.');
      return;
    }

    if (editCronogramaId) {
      // Edición
      setCronogramas((prev) =>
        prev.map((c) =>
          c.id === editCronogramaId
            ? {
                ...c,
                fecha: formFecha,
                especialista: formEspecialista,
                especialistaInitials: getInitials(formEspecialista),
                institucion: formInstitucion,
                docenteDirectivo: formDocente.trim(),
                tipo: formTipo,
                nroVisita: formVisita.trim(),
                estado: formEstado,
              }
            : c,
        ),
      );
    } else {
      // Creación
      const newCronograma: Cronograma = {
        id: Date.now().toString(),
        fecha: formFecha,
        especialista: formEspecialista,
        especialistaInitials: getInitials(formEspecialista),
        institucion: formInstitucion,
        docenteDirectivo: formDocente.trim(),
        tipo: formTipo,
        nroVisita: formVisita.trim(),
        estado: formEstado,
      };
      setCronogramas((prev) => [newCronograma, ...prev]);
    }

    setShowFormModal(false);
  };

  // --- Confirmar Eliminado ---
  const handleDeleteConfirm = () => {
    if (!deleteCronogramaId) return;
    setCronogramas((prev) => prev.filter((c) => c.id !== deleteCronogramaId));
    setDeleteCronogramaId(null);
  };

  // --- Estilos de Badge para Monitoreo y Estado ---
  const getTipoStyle = (tipo: Cronograma['tipo']) => {
    if (tipo === 'PEDAGÓGICO') {
      return 'bg-rose-50 text-rose-600 border border-rose-200/50 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
    }
    return 'bg-blue-50 text-blue-600 border border-blue-200/50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
  };

  const getEstadoStyle = (estado: Cronograma['estado']) => {
    switch (estado) {
      case 'PROGRAMADO':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'EN PROCESO':
        return 'bg-amber-50 text-amber-600 border border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'COMPLETADO':
        return 'bg-purple-50 text-purple-600 border border-purple-200/50 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30';
      case 'REPROGRAMADO':
        return 'bg-indigo-50 text-indigo-600 border border-indigo-200/50 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30';
      case 'CANCELADO':
        return 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50';
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 animate-in fade-in-0 duration-300">
      {/* ── Cabecera ── */}
      <PageHeader
        title="Cronogramas de Monitoreo"
        description="Programación de visitas de monitoreo pedagógico y administrativo."
        action={
          <Button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 font-bold cursor-pointer bg-primary hover:bg-primary/90 text-white transition-colors"
          >
            <PlusCircle className="w-[18px] h-[18px]" strokeWidth={2} />
            Registrar cronograma
          </Button>
        }
      />

      {/* ── Barra de Filtros ── */}
      <Card className="border border-border bg-surface shadow-sm rounded-2xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <TextField
            label="Especialista"
            value={searchEsp}
            onChange={setSearchEsp}
            placeholder="Buscar especialista..."
            adornment={<Search className="w-[18px] h-[18px] text-text-muted" />}
          />
          <SelectField
            label="Institución"
            value={filterInst}
            onChange={setFilterInst}
            placeholder="Seleccionar institución..."
            options={[
              { value: 'Todos', label: 'Todas las instituciones' },
              ...INSTITUCIONES_LIST.map((inst) => ({ value: inst, label: inst })),
            ]}
          />
          <SelectField
            label="Tipo de Monitoreo"
            value={filterTipo}
            onChange={setFilterTipo}
            placeholder="Seleccionar tipo..."
            options={[
              { value: 'Todos', label: 'Todos los tipos' },
              { value: 'PEDAGÓGICO', label: 'PEDAGÓGICO' },
              { value: 'DIRECTIVO', label: 'DIRECTIVO' },
            ]}
          />
          <SelectField
            label="Estado"
            value={filterEstado}
            onChange={setFilterEstado}
            placeholder="Seleccionar estado..."
            options={[
              { value: 'Todos', label: 'Todos los estados' },
              { value: 'PROGRAMADO', label: 'PROGRAMADO' },
              { value: 'EN PROCESO', label: 'EN PROCESO' },
              { value: 'COMPLETADO', label: 'COMPLETADO' },
              { value: 'REPROGRAMADO', label: 'REPROGRAMADO' },
              { value: 'CANCELADO', label: 'CANCELADO' },
            ]}
          />
        </div>
      </Card>

      {/* ── Tabla de Cronogramas ── */}
      <Card className="p-0 border border-border shadow-xs overflow-hidden rounded-2xl">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border/80">
              <TableRow>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider pl-5 py-3">
                  Fecha
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider py-3">
                  Especialista
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider py-3">
                  Institución
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider py-3">
                  Docente/Directivo
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider py-3">
                  Tipo
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider text-center py-3">
                  Número de Visita
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider py-3">
                  Estado
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider text-right pr-5 py-3">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCronogramas.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors border-b border-border/50">
                  {/* Fecha */}
                  <TableCell className="pl-5 text-xs text-text font-bold leading-normal">
                    {formatTableDate(item.fecha)}
                  </TableCell>

                  {/* Especialista */}
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${getInitialsColor(
                          item.especialistaInitials
                        )}`}
                      >
                        {item.especialistaInitials}
                      </div>
                      <span className="text-xs font-bold text-text truncate max-w-[120px]">
                        {item.especialista}
                      </span>
                    </div>
                  </TableCell>

                  {/* Institución */}
                  <TableCell className="text-xs font-medium text-text truncate max-w-[140px]">
                    {item.institucion}
                  </TableCell>

                  {/* Docente / Directivo */}
                  <TableCell className="text-xs text-text truncate max-w-[150px]">
                    {item.docenteDirectivo}
                  </TableCell>

                  {/* Tipo */}
                  <TableCell>
                    <Badge className={`text-[9px] font-bold px-2 py-0.5 rounded ${getTipoStyle(item.tipo)}`}>
                      {item.tipo}
                    </Badge>
                  </TableCell>

                  {/* Número de visita */}
                  <TableCell className="text-center font-bold text-xs text-text">
                    {item.nroVisita}
                  </TableCell>

                  {/* Estado */}
                  <TableCell>
                    <Badge className={`text-[9px] font-bold px-2 py-0.5 rounded ${getEstadoStyle(item.estado)}`}>
                      {item.estado}
                    </Badge>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-right pr-5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewCronograma(item)}
                        className="h-8 w-8 text-text-muted hover:text-primary hover:bg-primary/10 transition-colors rounded-lg cursor-pointer"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(item)}
                        className="h-8 w-8 text-text-muted hover:text-primary hover:bg-primary/10 transition-colors rounded-lg cursor-pointer"
                        title="Editar cronograma"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteCronogramaId(item.id)}
                        className="h-8 w-8 text-text-muted hover:text-destructive hover:bg-destructive/15 transition-colors rounded-lg cursor-pointer"
                        title="Eliminar cronograma"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {paginatedCronogramas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-text-muted py-16">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Compass className="w-9 h-9 text-text-muted/55" strokeWidth={1.5} />
                      <span className="text-xs font-medium">
                        No se encontraron cronogramas con los criterios seleccionados.
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        <TablePagination
          from={filteredCronogramas.length > 0 ? fromIndex + 1 : 0}
          to={toIndex}
          totalItems={filteredCronogramas.length}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemName="cronogramas"
        />
      </Card>

      {/* ── Modal de Formulario: Registro o Edición ── */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200">
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-base font-bold text-text">
                {editCronogramaId ? 'Editar Cronograma' : 'Registrar Cronograma'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1 hover:bg-muted text-text-muted hover:text-text rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 flex flex-col gap-4">
              {formError && (
                <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-xl p-3.5 text-destructive text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{formError}</div>
                </div>
              )}

              {/* Fecha */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-muted">Fecha de Monitoreo *</label>
                <input
                  type="date"
                  value={formFecha}
                  onChange={(e) => setFormFecha(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-input bg-surface px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium text-text placeholder:text-text-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>

              {/* Especialista */}
              <SelectField
                label="Especialista *"
                value={formEspecialista}
                onChange={setFormEspecialista}
                placeholder="Seleccionar especialista..."
                options={ESPECIALISTAS_LIST.map((esp) => ({ value: esp, label: esp }))}
              />

              {/* Institución */}
              <SelectField
                label="Institución Educativa *"
                value={formInstitucion}
                onChange={setFormInstitucion}
                placeholder="Seleccionar institución..."
                options={INSTITUCIONES_LIST.map((inst) => ({ value: inst, label: inst }))}
              />

              {/* Docente / Directivo */}
              <TextField
                label="Docente / Directivo Monitoreado *"
                value={formDocente}
                onChange={setFormDocente}
                placeholder="Ej. Ana Miranda Ortiz"
                error={formSubmitted && !formDocente.trim() ? 'El docente es obligatorio' : ''}
              />

              {/* Tipo y Nro de Visita */}
              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Tipo de Monitoreo *"
                  value={formTipo}
                  onChange={(val) => setFormTipo(val as any)}
                  placeholder="Tipo..."
                  options={[
                    { value: 'PEDAGÓGICO', label: 'PEDAGÓGICO' },
                    { value: 'DIRECTIVO', label: 'DIRECTIVO' },
                  ]}
                />
                <TextField
                  label="Nº de Visita *"
                  value={formVisita}
                  onChange={setFormVisita}
                  placeholder="Ej. 01"
                  error={formSubmitted && !formVisita.trim() ? 'Obligatorio' : ''}
                />
              </div>

              {/* Estado (Solo edición o para cambiar si se requiere) */}
              <SelectField
                label="Estado de Visita *"
                value={formEstado}
                onChange={(val) => setFormEstado(val as any)}
                placeholder="Seleccionar estado..."
                options={[
                  { value: 'PROGRAMADO', label: 'PROGRAMADO' },
                  { value: 'EN PROCESO', label: 'EN PROCESO' },
                  { value: 'COMPLETADO', label: 'COMPLETADO' },
                  { value: 'REPROGRAMADO', label: 'REPROGRAMADO' },
                  { value: 'CANCELADO', label: 'CANCELADO' },
                ]}
              />

              {/* Acciones */}
              <div className="flex justify-end gap-3 mt-2 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFormModal(false)}
                  className="cursor-pointer border-border"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white font-bold cursor-pointer transition-colors"
                >
                  Guardar Cronograma
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal de Detalle (Ver Ficha) ── */}
      {viewCronograma && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200">
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <Compass className="w-5 h-5 text-primary" />
                Detalle del Cronograma
              </h3>
              <button
                onClick={() => setViewCronograma(null)}
                className="p-1 hover:bg-muted text-text-muted hover:text-text rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                {/* Especialista info card */}
                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border/80">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getInitialsColor(viewCronograma.especialistaInitials)}`}>
                    {viewCronograma.especialistaInitials}
                  </div>
                  <div>
                    <div className="text-xs text-text-muted">Especialista Asignado</div>
                    <div className="text-sm font-bold text-text">{viewCronograma.especialista}</div>
                  </div>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-text-muted/80" /> Fecha Programada
                    </span>
                    <span className="text-xs font-semibold text-text">{formatTableDate(viewCronograma.fecha)}</span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-1">
                      <Layers className="w-3 h-3 text-text-muted/80" /> Nº de Visita
                    </span>
                    <span className="text-xs font-bold text-text">{viewCronograma.nroVisita}</span>
                  </div>
                </div>

                <div className="border-t border-border/60 my-1" />

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-text-muted/80" /> Institución Educativa
                  </span>
                  <span className="text-xs font-semibold text-text">{viewCronograma.institucion}</span>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-1">
                    <User className="w-3 h-3 text-text-muted/80" /> Docente / Directivo Monitoreado
                  </span>
                  <span className="text-xs font-semibold text-text">{viewCronograma.docenteDirectivo}</span>
                </div>

                <div className="border-t border-border/60 my-1" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-text-muted">Tipo de Monitoreo</span>
                    <div>
                      <Badge className={`text-[9px] font-bold px-2 py-0.5 rounded ${getTipoStyle(viewCronograma.tipo)}`}>
                        {viewCronograma.tipo}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-text-muted">Estado Actual</span>
                    <div>
                      <Badge className={`text-[9px] font-bold px-2 py-0.5 rounded ${getEstadoStyle(viewCronograma.estado)}`}>
                        {viewCronograma.estado}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4 border-t border-border pt-4">
                <Button
                  onClick={() => setViewCronograma(null)}
                  className="bg-primary hover:bg-primary/95 text-white font-bold cursor-pointer transition-colors"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Confirmación para Eliminado ── */}
      {deleteCronogramaId && (
        <ConfirmModal
          title="¿Desea eliminar este cronograma?"
          message={
            <span>
              Esta acción eliminará de forma lógica el cronograma de visita programada para esta institución.
            </span>
          }
          confirmLabel="Eliminar Cronograma"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteCronogramaId(null)}
          danger
        />
      )}
    </div>
  );
};
