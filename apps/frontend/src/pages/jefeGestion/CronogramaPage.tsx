import { useState, useMemo, useEffect } from 'react';
import { Compass, PlusCircle, Search, Trash2, Eye, Pencil, X, AlertCircle, Calendar, User, BookOpen, Layers, FileText } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { PageHeader } from '@shared/ui/pageHeader';
import { ConfirmModal } from '@shared/ui/ConfirmModal';
import { TextField, SelectField } from '@shared/ui/form-controls';
import { Card } from '@shared/ui/card';
import { Badge } from '@shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { TablePagination } from '@shared/ui/table-pagination';
import { useUser } from '@entities/model-user';
import { type Docente } from '@entities/model-docentes';
import { cronogramasApi } from '@shared/api/cronogramas.api';
import { especialistasApi } from '@shared/api/especialistas.api';
import { institutionsApi } from '@shared/api/institutions.api';
import { teachersApi } from '@shared/api/teachers.api';
import { mapApiDocenteToFrontend } from '@features/docentes/docente-service';
import {
  ModalidadEducativa,
  MODALIDAD_NIVEL_MAP,
  type EstadoVisita,
  type ICreateVisitaRequest,
  type IUpdateVisitaRequest,
  type Modalidad,
} from '@sistema-monitoreo/shared-contracts';

// ── Tipos ──
interface Cronograma {
  id: string;
  fechaHora: string; // ISO datetime
  especialista: string;
  especialistaInitials: string;
  institucion: string;
  docenteDirectivo: string;
  tipo: 'DOCENTE' | 'DIRECTIVO';
  nroVisita: string;
  estado: 'PROGRAMADO' | 'EN PROCESO' | 'COMPLETADO' | 'REPROGRAMADO' | 'CANCELADO';
  modalidad: string;
  nivel: string;
  observaciones?: string;
}

// ── Datos mock de Especialistas (con modalidad y nivel) ──
interface MockEspecialista {
  id: string;
  nombre: string;
  initials: string;
  modalidad: string;
  nivelEducativo: string;
}

// MOCK_ESPECIALISTAS removed

// ── Datos mock de Instituciones (con modalidad y nivel) ──
interface MockInstitucion {
  id: string;
  nombre: string;
  modalidad: string;
  nivelEducativo: string;
}

// MOCK_INSTITUCIONES removed

// ── Datos mock de Cronogramas ──
// MOCK_CRONOGRAMAS removed

// ── Constantes de modalidades ──
const MODALIDADES = Object.values(ModalidadEducativa);

// --- Procesamiento de Iniciales ---
const getInitials = (name: string) => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getInitialsColor = (initials: string) => {
  const colors: Record<string, string> = {
    JP: 'bg-pink-100 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400',
    MG: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    CM: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
    AT: 'bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400',
    PA: 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
    RQ: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
    LM: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400',
    SR: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  };
  return colors[initials] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
};

// --- Formateador de Fecha y Hora ---
const formatTableDateTime = (isoString: string) => {
  try {
    const date = new Date(isoString);
    const datePart = date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timePart = date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return { datePart, timePart };
  } catch {
    return { datePart: isoString, timePart: '' };
  }
};

export const CronogramaPage = () => {
  const { user } = useUser();
  const isDirector =
    user?.role === 'director_ie' ||
    user?.role === 'director_institucion' ||
    user?.role === 'coordinador_pedagogico' ||
    user?.role === 'jefe_taller';

  // --- Estados de Datos ---
  const [cronogramas, setCronogramas] = useState<Cronograma[]>([]);
  const [MOCK_ESPECIALISTAS, setEspecialistas] = useState<MockEspecialista[]>([]);
  const [MOCK_INSTITUCIONES, setInstituciones] = useState<MockInstitucion[]>([]);
  const [MOCK_DOCENTES, setDocentes] = useState<Docente[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [espRes, instRes, docRes, cronoRes] = await Promise.all([
          especialistasApi.findAll(),
          institutionsApi.findAll(),
          teachersApi.findAll(),
          cronogramasApi.findAll()
        ]);

        let loadedEsp: MockEspecialista[] = [];
        let loadedInst: MockInstitucion[] = [];
        let loadedDoc: Docente[] = [];

        if (espRes.ok && espRes.data) {
          loadedEsp = espRes.data.map(e => ({
            id: e.id,
            nombre: `${e.persona.nombres} ${e.persona.apellidos}`,
            initials: getInitials(`${e.persona.nombres} ${e.persona.apellidos}`),
            modalidad: e.modalidad || 'EBR',
            nivelEducativo: e.nivelEducativo || 'Primaria'
          }));
          setEspecialistas(loadedEsp);
        }

        if (instRes.ok && instRes.data) {
          loadedInst = instRes.data.data.map(i => ({
            id: i.id,
            nombre: i.nombre,
            modalidad: i.modalidad || 'EBR',
            nivelEducativo: i.nivelEducativo
          }));
          setInstituciones(loadedInst);
        }

        if (docRes.ok && docRes.data) {
          loadedDoc = docRes.data.map(d => mapApiDocenteToFrontend(d));
          setDocentes(loadedDoc);
        }

        if (cronoRes.ok && cronoRes.data) {
          const mappedCrono = cronoRes.data.map(c => {
            const esp = loadedEsp.find(e => e.id === c.monitorId);
            const inst = loadedInst.find(i => i.id === c.institucionId);
            const doc = loadedDoc.find(d => d.id === c.evaluadoId);

            return {
              id: c.id,
              fechaHora: `${String(c.fechaProgramada).split('T')[0]}T${c.horaInicio}`,
              especialista: esp ? esp.nombre : 'Sin Asignar',
              especialistaInitials: esp ? esp.initials : 'SA',
              institucion: inst ? inst.nombre : 'Sin I.E.',
              docenteDirectivo: doc ? `${doc.nombres} ${doc.apellidos}` : 'Sin Docente',
              tipo: c.tipoMonitoreo as 'DOCENTE' | 'DIRECTIVO',
              nroVisita: String(c.numeroVisita).padStart(2, '0'),
              estado: c.estado as 'PROGRAMADO' | 'EN PROCESO' | 'COMPLETADO' | 'REPROGRAMADO' | 'CANCELADO',
              modalidad: c.modalidad,
              nivel: c.nivelEducativo,
              observaciones: c.detalles || undefined,
            };
          });
          setCronogramas(mappedCrono);
        }
      } catch(err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);


  // --- Estados de Filtro ---
  const [searchEsp, setSearchEsp] = useState('');
  const [searchDocente, setSearchDocente] = useState('');
  const [filterInst, setFilterInst] = useState('Todos');
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);

  // --- Estados de Registro / Edición ---
  const [showFormModal, setShowFormModal] = useState(false);
  const [editCronogramaId, setEditCronogramaId] = useState<string | null>(null);

  // --- Valores del Formulario ---
  const [formFechaHora, setFormFechaHora] = useState('');
  const [formEspecialista, setFormEspecialista] = useState('');
  const [formInstitucion, setFormInstitucion] = useState('');
  const [formDocente, setFormDocente] = useState('');
  const [formTipo, setFormTipo] = useState<'DOCENTE' | 'DIRECTIVO'>('DOCENTE');
  const [formVisita, setFormVisita] = useState('01');
  const [formEstado, setFormEstado] = useState<Cronograma['estado']>('PROGRAMADO');
  const [formModalidad, setFormModalidad] = useState('');
  const [formNivel, setFormNivel] = useState('');
  const [formObservaciones, setFormObservaciones] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const docentesDeLaInstitucion = useMemo(() => {
    if (isDirector) {
      if (!user || !user.institucion) return [];
      return MOCK_DOCENTES.filter(
        (doc) => doc.institucionId === user.institucion && doc.cargo !== 'Director'
      );
    }

    if (!formInstitucion) return [];
    const matchInst = MOCK_INSTITUCIONES.find(
      (inst) => inst.nombre.toLowerCase() === formInstitucion.toLowerCase()
    );
    if (!matchInst) return [];

    const dbId = matchInst.id.replace(/^i/, '');
      return MOCK_DOCENTES.filter((doc) => {
        const matchInstId = doc.institucionId === dbId;
        const isDirectorCargo = doc.cargo === 'Director';
        const matchCargo = formTipo === 'DIRECTIVO' ? isDirectorCargo : !isDirectorCargo;
        return matchInstId && matchCargo;
      });
    }, [isDirector, user, formInstitucion, formTipo, MOCK_DOCENTES, MOCK_INSTITUCIONES]);

  const docenteOptions = useMemo(() => {
    const list = docentesDeLaInstitucion.map((doc) => ({
      value: `${doc.nombres} ${doc.apellidos}`,
      label: `${doc.nombres} ${doc.apellidos} (${doc.cargo})`,
    }));

    if (formDocente && !list.some((opt) => opt.value === formDocente)) {
      list.unshift({ value: formDocente, label: formDocente });
    }

    return list;
  }, [docentesDeLaInstitucion, formDocente]);

  const isSecundaria = useMemo(() => {
    const targetInstName = isDirector ? user?.institucionNombre : formInstitucion;
    if (!targetInstName) return false;

      const matchInst = MOCK_INSTITUCIONES.find(
        (inst) => inst.nombre.toLowerCase() === targetInstName.toLowerCase()
      );
      return matchInst?.nivelEducativo.toLowerCase() === 'secundaria';
    }, [isDirector, user, formInstitucion, MOCK_INSTITUCIONES]);

  const evaluadoresDeLaInstitucion = useMemo(() => {
    const targetInstName = isDirector ? user?.institucionNombre : formInstitucion;
    if (!targetInstName) return [];

    const matchInst = MOCK_INSTITUCIONES.find(
      (inst) => inst.nombre.toLowerCase() === targetInstName.toLowerCase()
    );
    if (!matchInst) return [];

    const dbId = matchInst.id.replace(/^i/, '');
    return MOCK_DOCENTES.filter(
      (doc) =>
        doc.institucionId === dbId &&
        (doc.cargo === 'Director' ||
          doc.cargo === 'Coordinador Pedagógico' ||
          doc.cargo === 'Jefe de Taller')
    );
  }, [isDirector, user, formInstitucion, MOCK_DOCENTES, MOCK_INSTITUCIONES]);

  const evaluadorOptions = useMemo(() => {
    const list = evaluadoresDeLaInstitucion.map((doc) => ({
      value: `${doc.nombres} ${doc.apellidos}`,
      label: `${doc.nombres} ${doc.apellidos} (${doc.cargo})`,
    }));

    if (formEspecialista && !list.some((opt) => opt.value === formEspecialista)) {
      list.unshift({ value: formEspecialista, label: formEspecialista });
    }

    return list;
  }, [evaluadoresDeLaInstitucion, formEspecialista]);

  // --- Estados de Detalles / Ver ---
  const [viewCronograma, setViewCronograma] = useState<Cronograma | null>(null);

  // --- Estado de Eliminado / Desactivación ---
  const [deleteCronogramaId, setDeleteCronogramaId] = useState<string | null>(null);

  // ── Niveles filtrados por modalidad seleccionada ──
  const nivelesDisponibles = useMemo(() => {
    if (!formModalidad) return [];
    return MODALIDAD_NIVEL_MAP[formModalidad] || [];
  }, [formModalidad]);

  // ── Especialistas filtrados por modalidad + nivel ──
    const especialistasFiltrados = useMemo(() => {
      if (!formModalidad || !formNivel) return [];
      return MOCK_ESPECIALISTAS.filter(
        (esp) => esp.modalidad === formModalidad && esp.nivelEducativo === formNivel
      );
    }, [formModalidad, formNivel, MOCK_ESPECIALISTAS]);

  // ── Instituciones filtradas por modalidad + nivel ──
    const institucionesFiltradas = useMemo(() => {
      if (!formModalidad || !formNivel) return [];
      return MOCK_INSTITUCIONES.filter(
        (inst) => inst.modalidad === formModalidad && inst.nivelEducativo === formNivel
      );
    }, [formModalidad, formNivel, MOCK_INSTITUCIONES]);

  const handleFormModalidadChange = (modalidad: string) => {
    setFormModalidad(modalidad);
    setFormNivel('');
    setFormEspecialista('');
    setFormInstitucion('');
  };

  const handleFormNivelChange = (nivel: string) => {
    setFormNivel(nivel);
    setFormEspecialista('');
    setFormInstitucion('');
  };

  // Resetear paginación síncronamente cuando cambian los filtros
  const filters = useMemo(
    () => ({ searchEsp, searchDocente, filterInst, filterTipo, filterEstado }),
    [searchEsp, searchDocente, filterInst, filterTipo, filterEstado]
  );
  const [prevFilters, setPrevFilters] = useState(filters);
  if (JSON.stringify(filters) !== JSON.stringify(prevFilters)) {
    setCurrentPage(1);
    setPrevFilters(filters);
  }

  // --- Lógica de Filtro ---
  const filteredBaseCronogramas = useMemo(() => {
    if (!isDirector || !user) return cronogramas;
    return cronogramas.filter((item) => {
      const isSameSchool =
        user.institucionNombre &&
        item.institucion.toLowerCase() === user.institucionNombre.toLowerCase();

      const userFullName = `${user.nombres} ${user.apellidos}`.toLowerCase();
      const isDirectedToMe =
        item.tipo === 'DIRECTIVO' &&
        (item.docenteDirectivo.toLowerCase().includes(userFullName) ||
          userFullName.includes(item.docenteDirectivo.toLowerCase()) ||
          item.docenteDirectivo.toLowerCase().includes(user.nombres.toLowerCase()));

      return isSameSchool || isDirectedToMe;
    });
  }, [cronogramas, isDirector, user]);

  const filteredCronogramas = useMemo(() => {
    return filteredBaseCronogramas.filter((item) => {
      const matchSearchEvaluador =
        searchEsp.trim() === '' ||
        item.especialista.toLowerCase().includes(searchEsp.toLowerCase());

      const matchSearchDocente =
        searchDocente.trim() === '' ||
        item.docenteDirectivo.toLowerCase().includes(searchDocente.toLowerCase());

      const matchInst = isDirector || filterInst === 'Todos' || item.institucion === filterInst;
      const matchTipo = filterTipo === 'Todos' || item.tipo === filterTipo;
      const matchEstado = filterEstado === 'Todos' || item.estado === filterEstado;

      return matchSearchEvaluador && matchSearchDocente && matchInst && matchTipo && matchEstado;
    });
  }, [filteredBaseCronogramas, searchEsp, searchDocente, filterInst, filterTipo, filterEstado, isDirector]);

  // --- Instituciones únicas para filtro de tabla ---
  const uniqueInstituciones = useMemo(() => {
    return [...new Set(cronogramas.map((c) => c.institucion))].sort();
  }, [cronogramas]);

  // --- Paginación local ---
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredCronogramas.length / itemsPerPage) || 1;
  const fromIndex = (currentPage - 1) * itemsPerPage;
  const toIndex = Math.min(currentPage * itemsPerPage, filteredCronogramas.length);

  const paginatedCronogramas = useMemo(() => {
    return filteredCronogramas.slice(fromIndex, toIndex);
  }, [filteredCronogramas, fromIndex, toIndex]);

  // --- Generar datetime default (ahora + 1 día a las 08:00) ---
  const getDefaultDateTime = () => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    now.setHours(8, 0, 0, 0);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T08:00`;
  };

  // --- Abrir Modal de Registro ---
  const handleOpenCreate = () => {
    setEditCronogramaId(null);
    setFormFechaHora(getDefaultDateTime());
    setFormDocente('');
    setFormTipo('DOCENTE');
    setFormVisita('01');
    setFormEstado('PROGRAMADO');
    setFormObservaciones('');
    setFormError(null);

    if (isDirector && user) {
      setFormInstitucion(user.institucionNombre || '');
      setFormEspecialista(`${user.nombres} ${user.apellidos}`);
      
      const matchInst = MOCK_INSTITUCIONES.find(
        (inst) => inst.nombre.toLowerCase() === user.institucionNombre?.toLowerCase()
      );
      if (matchInst) {
        setFormModalidad(matchInst.modalidad);
        setFormNivel(matchInst.nivelEducativo);
      } else {
        setFormModalidad('EBR');
        setFormNivel(user.institucionNivel || 'Primaria');
      }
    } else {
      setFormModalidad('');
      setFormNivel('');
      setFormEspecialista('');
      setFormInstitucion('');
    }

    setShowFormModal(true);
  };

  // --- Abrir Modal de Edición ---
  const handleOpenEdit = (item: Cronograma) => {
    setEditCronogramaId(item.id);
    setFormFechaHora(item.fechaHora);
    setFormModalidad(item.modalidad);
    // nivel se setea después de que el efecto de modalidad se aplique
    setTimeout(() => {
      setFormNivel(item.nivel);
      setTimeout(() => {
        setFormDocente(item.docenteDirectivo);
        setFormTipo(item.tipo);
        setFormVisita(item.nroVisita);
        setFormEstado(item.estado);
        setFormObservaciones(item.observaciones || '');
        if (isDirector && user) {
          setFormInstitucion(user.institucionNombre || item.institucion);
          setFormEspecialista(item.especialista);
        } else {
          setFormEspecialista(item.especialista);
          setFormInstitucion(item.institucion);
        }
      }, 0);
    }, 0);
    setFormError(null);
    setShowFormModal(true);
  };

  // --- Guardar Formulario ---
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formModalidad || !formNivel || !formEspecialista || !formInstitucion || !formDocente.trim() || !formFechaHora) {
      setFormError('Todos los campos con asterisco (*) son obligatorios.');
      return;
    }

    const matchedEsp = MOCK_ESPECIALISTAS.find(e => e.nombre === formEspecialista);
    const matchedInst = MOCK_INSTITUCIONES.find(i => i.nombre === formInstitucion);
    const matchedDoc = MOCK_DOCENTES.find(d => `${d.nombres} ${d.apellidos}` === formDocente.trim());

    if (!matchedEsp || !matchedInst || !matchedDoc) {
      setFormError('Error de resolución: No se encontraron los IDs correspondientes.');
      return;
    }

    if (editCronogramaId) {
      const updatePayload: IUpdateVisitaRequest = {
        detalles: formObservaciones.trim() || undefined,
        estado: formEstado as EstadoVisita,
      };
      const res = await cronogramasApi.update(editCronogramaId, updatePayload);
      if (res.ok && res.data) {
        setCronogramas((prev) =>
          prev.map((c) =>
            c.id === editCronogramaId
              ? {
                  ...c,
                  fechaHora: formFechaHora,
                  especialista: formEspecialista,
                  especialistaInitials: getInitials(formEspecialista),
                  institucion: formInstitucion,
                  docenteDirectivo: formDocente.trim(),
                  tipo: formTipo,
                  nroVisita: formVisita,
                  estado: formEstado,
                  modalidad: formModalidad,
                  nivel: formNivel,
                  observaciones: formObservaciones.trim(),
                }
              : c,
          ),
        );
        setShowFormModal(false);
      } else {
        setFormError('Error guardando en BD');
      }
    } else {
      const createPayload: ICreateVisitaRequest = {
        monitorId: matchedEsp.id,
        institucionId: matchedInst.id,
        evaluadoId: matchedDoc.id,
        tipoMonitoreo: formTipo,
        numeroVisita: parseInt(formVisita, 10),
        fechaProgramada: formFechaHora.split('T')[0],
        horaInicio: formFechaHora.split('T')[1] + (formFechaHora.split('T')[1].length === 5 ? ':00' : ''),
        modalidad: formModalidad as Modalidad,
        nivelEducativo: formNivel,
        detalles: formObservaciones.trim() || undefined
      };
      const res = await cronogramasApi.create(createPayload);
      if (res.ok && res.data) {
        const c = res.data;
        const newCronograma: Cronograma = {
          id: c.id,
          fechaHora: formFechaHora,
          especialista: formEspecialista,
          especialistaInitials: getInitials(formEspecialista),
          institucion: formInstitucion,
          docenteDirectivo: formDocente.trim(),
          tipo: formTipo,
          nroVisita: formVisita,
          estado: 'PROGRAMADO',
          modalidad: formModalidad,
          nivel: formNivel,
          observaciones: formObservaciones.trim(),
        };
        setCronogramas((prev) => [newCronograma, ...prev]);
        setShowFormModal(false);
      } else {
        setFormError('Error creando en BD');
      }
    }
  };

  // --- Confirmar Eliminado ---
  const handleDeleteConfirm = async () => {
    if (!deleteCronogramaId) return;
    const res = await cronogramasApi.delete(deleteCronogramaId);
    if (res.ok) {
      setCronogramas((prev) => prev.filter((c) => c.id !== deleteCronogramaId));
    }
    setDeleteCronogramaId(null);
  };

  // --- Estilos de Badge ---
  const getTipoStyle = (tipo: Cronograma['tipo']) => {
    if (tipo === 'DOCENTE') {
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

  const visitaOptions = ['01', '02', '03', '04'];

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
          {isDirector ? (
            <>
              <TextField
                label="Docente Evaluado"
                value={searchDocente}
                onChange={setSearchDocente}
                placeholder="Buscar docente..."
                adornment={<Search className="w-[18px] h-[18px] text-text-muted" />}
              />
              <TextField
                label="Evaluador"
                value={searchEsp}
                onChange={setSearchEsp}
                placeholder="Buscar evaluador..."
                adornment={<Search className="w-[18px] h-[18px] text-text-muted" />}
              />
            </>
          ) : (
            <>
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
                  ...uniqueInstituciones.map((inst) => ({ value: inst, label: inst })),
                ]}
              />
            </>
          )}
          <SelectField
            label="Tipo de Monitoreo"
            value={filterTipo}
            onChange={setFilterTipo}
            placeholder="Seleccionar tipo..."
            options={[
              { value: 'Todos', label: 'Todos los tipos' },
              { value: 'DOCENTE', label: 'DOCENTE' },
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
                  Fecha y Hora
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider py-3">
                  {isDirector ? 'Evaluador' : 'Especialista'}
                </TableHead>
                {!isDirector && (
                  <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider py-3">
                    Institución
                  </TableHead>
                )}
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider py-3">
                  {isDirector ? 'Evaluado' : 'Docente/Directivo'}
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider py-3">
                  Tipo
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider text-center py-3">
                  Nº Visita
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
              {paginatedCronogramas.map((item) => {
                const { datePart, timePart } = formatTableDateTime(item.fechaHora);
                return (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors border-b border-border/50">
                    {/* Fecha y Hora */}
                    <TableCell className="pl-5 text-xs text-text leading-normal">
                      <div className="flex flex-col">
                        <span className="font-bold">{datePart}</span>
                        <span className="text-[10px] text-text-muted">{timePart}</span>
                      </div>
                    </TableCell>

                    {/* Especialista / Evaluador */}
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
                    {!isDirector && (
                      <TableCell className="text-xs font-medium text-text truncate max-w-[140px]">
                        {item.institucion}
                      </TableCell>
                    )}

                    {/* Docente / Directivo / Evaluado */}
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
                        {(!isDirector || item.tipo === 'DOCENTE') && (
                          <>
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
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {paginatedCronogramas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isDirector ? 7 : 8} className="text-center text-text-muted py-16">
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
          <div className="bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header del modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-base font-bold text-text flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {editCronogramaId ? 'Editar Cronograma' : 'Registro de Cronograma'}
                </h3>
                <p className="text-xs text-text-muted">
                  Complete los datos para {editCronogramaId ? 'actualizar' : 'programar'} una visita de monitoreo.
                </p>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1.5 hover:bg-muted text-text-muted hover:text-text rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body del modal con scroll */}
            <form onSubmit={handleFormSubmit} className="flex flex-col overflow-y-auto flex-1">
              <div className="p-6 flex flex-col gap-5">
                {formError && (
                  <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-xl p-3.5 text-destructive text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>{formError}</div>
                  </div>
                )}

                {/* Fila 1: Modalidad Educativa & Nivel Educativo (oculto para Director) */}
                {!isDirector && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SelectField
                        label="Modalidad Educativa *"
                        value={formModalidad}
                        onChange={handleFormModalidadChange}
                        placeholder="Seleccionar modalidad..."
                        options={MODALIDADES.map((m) => ({ value: m, label: m }))}
                      />
                      <SelectField
                        label="Nivel Educativo *"
                        value={formNivel}
                        onChange={handleFormNivelChange}
                        placeholder={formModalidad ? 'Seleccionar nivel...' : 'Seleccione modalidad primero'}
                        options={nivelesDisponibles.map((n) => ({ value: n, label: n }))}
                      />
                    </div>

                    {/* Nota informativa si no hay modalidad/nivel seleccionado */}
                    {(!formModalidad || !formNivel) && (
                      <div className="flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-xl p-3 text-primary text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Seleccione modalidad y nivel educativo para habilitar la selección de especialista e institución.</span>
                      </div>
                    )}
                  </>
                )}

                {/* Fila 2: Especialista & Institución Educativa (filtrados) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    {isDirector ? (
                      isSecundaria ? (
                        <SelectField
                          label="Evaluador *"
                          value={formEspecialista}
                          onChange={setFormEspecialista}
                          placeholder="Seleccionar evaluador..."
                          options={evaluadorOptions}
                        />
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-text-muted">Evaluador *</label>
                          <div className="bg-slate-50 border border-slate-200 text-slate-700 font-bold px-3 py-2.5 rounded-lg text-sm shadow-inner leading-none h-10 flex items-center">
                            {formEspecialista}
                          </div>
                        </div>
                      )
                    ) : (
                      <>
                        <SelectField
                          label="Especialista (filtro por nivel) *"
                          value={formEspecialista}
                          onChange={setFormEspecialista}
                          placeholder={
                            !formModalidad || !formNivel
                              ? 'Seleccione modalidad y nivel...'
                              : especialistasFiltrados.length === 0
                                ? 'No hay especialistas para este nivel'
                                : 'Seleccionar especialista...'
                          }
                          options={especialistasFiltrados.map((esp) => ({
                            value: esp.nombre,
                            label: esp.nombre,
                          }))}
                        />
                        {formModalidad && formNivel && especialistasFiltrados.length > 0 && (
                          <span className="text-[10px] text-text-muted pl-1">
                            {especialistasFiltrados.length} especialista(s) de {formModalidad} - {formNivel}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {isDirector ? (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-text-muted">Institución Educativa *</label>
                        <div className="bg-slate-50 border border-slate-200 text-slate-700 font-bold px-3 py-2.5 rounded-lg text-sm shadow-inner leading-none h-10 flex items-center">
                          {formInstitucion}
                        </div>
                      </div>
                    ) : (
                      <>
                        <SelectField
                          label="Institución Educativa (filtro) *"
                          value={formInstitucion}
                          onChange={(val) => {
                            setFormInstitucion(val);
                            setFormDocente('');
                          }}
                          placeholder={
                            !formModalidad || !formNivel
                              ? 'Seleccione modalidad y nivel...'
                              : institucionesFiltradas.length === 0
                                ? 'No hay instituciones para este nivel'
                                : 'Seleccionar institución...'
                          }
                          options={institucionesFiltradas.map((inst) => ({
                            value: inst.nombre,
                            label: inst.nombre,
                          }))}
                        />
                        {formModalidad && formNivel && institucionesFiltradas.length > 0 && (
                          <span className="text-[10px] text-text-muted pl-1">
                            {institucionesFiltradas.length} institución(es) de {formModalidad} - {formNivel}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Tipo de Monitoreo - Toggle Buttons */}
                {!isDirector && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-text-muted">Tipo de Monitoreo *</label>
                    <div className="flex items-center gap-0 rounded-xl border border-border overflow-hidden w-fit">
                      <button
                        type="button"
                        onClick={() => {
                          setFormTipo('DOCENTE');
                          setFormDocente('');
                        }}
                        className={`px-6 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                          formTipo === 'DOCENTE'
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-surface text-text-muted hover:bg-muted/60'
                        }`}
                      >
                        Docente
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormTipo('DIRECTIVO');
                          setFormDocente('');
                        }}
                        className={`px-6 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer border-l border-border ${
                          formTipo === 'DIRECTIVO'
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-surface text-text-muted hover:bg-muted/60'
                        }`}
                      >
                        Directivo
                      </button>
                    </div>
                  </div>
                )}

                {/* Seleccionar Docente a Evaluar */}
                {isDirector ? (
                  <SelectField
                    label="Docente a Evaluar *"
                    value={formDocente}
                    onChange={setFormDocente}
                    placeholder="Seleccionar docente..."
                    options={docenteOptions}
                  />
                ) : (
                  <SelectField
                    label={`Seleccionar ${formTipo === 'DOCENTE' ? 'Docente' : 'Directivo'} a Evaluar *`}
                    value={formDocente}
                    onChange={setFormDocente}
                    placeholder={
                      !formInstitucion
                        ? 'Seleccione institución primero...'
                        : docenteOptions.length === 0
                          ? `No hay ${formTipo === 'DOCENTE' ? 'docentes' : 'directivos'} para esta institución`
                          : 'Seleccionar...'
                    }
                    disabled={!formInstitucion}
                    options={docenteOptions}
                  />
                )}

                {/* Fila: Fecha y Hora Programada & Número de Visita */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Fecha y Hora Programada */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-muted">Fecha y Hora Programada *</label>
                    <input
                      type="datetime-local"
                      value={formFechaHora}
                      onChange={(e) => setFormFechaHora(e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-input bg-surface px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium text-text placeholder:text-text-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                  </div>

                  {/* Número de Visita - Botones numéricos */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-muted">Número de Visita *</label>
                    <div className="flex items-center gap-2 mt-0.5">
                      {visitaOptions.map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setFormVisita(num)}
                          className={`w-10 h-10 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border ${
                            formVisita === num
                              ? 'bg-primary text-white border-primary shadow-sm'
                              : 'bg-surface text-text-muted border-border hover:bg-muted/60 hover:border-primary/40'
                          }`}
                        >
                          {parseInt(num)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Estado (Solo visible en edición) */}
                {editCronogramaId && (
                  <SelectField
                    label="Estado de Visita *"
                    value={formEstado}
                    onChange={(val) => setFormEstado(val as Cronograma['estado'])}
                    placeholder="Seleccionar estado..."
                    options={[
                      { value: 'PROGRAMADO', label: 'PROGRAMADO' },
                      { value: 'EN PROCESO', label: 'EN PROCESO' },
                      { value: 'COMPLETADO', label: 'COMPLETADO' },
                      { value: 'REPROGRAMADO', label: 'REPROGRAMADO' },
                      { value: 'CANCELADO', label: 'CANCELADO' },
                    ]}
                  />
                )}

                {/* Detalles / Observaciones */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-muted">Detalles / Observaciones (opcional)</label>
                  <textarea
                    value={formObservaciones}
                    onChange={(e) => setFormObservaciones(e.target.value)}
                    placeholder="Escriba cualquier detalle adicional o instrucciones..."
                    rows={3}
                    className="flex w-full rounded-xl border border-input bg-surface px-3 py-2.5 text-sm ring-offset-background text-text placeholder:text-text-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                </div>
              </div>

              {/* Acciones del formulario */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-border shrink-0 bg-muted/20">
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
      {viewCronograma && (() => {
        const { datePart, timePart } = formatTableDateTime(viewCronograma.fechaHora);
        return (
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
                      <div className="text-xs text-text-muted">{isDirector ? 'Evaluador' : 'Especialista Asignado'}</div>
                      <div className="text-sm font-bold text-text">{viewCronograma.especialista}</div>
                    </div>
                  </div>

                  {/* Modalidad y Nivel */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase font-bold text-text-muted">Modalidad</span>
                      <span className="text-xs font-semibold text-text">{viewCronograma.modalidad}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase font-bold text-text-muted">Nivel Educativo</span>
                      <span className="text-xs font-semibold text-text">{viewCronograma.nivel}</span>
                    </div>
                  </div>

                  <div className="border-t border-border/60 my-1" />

                  {/* Grid details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-text-muted/80" /> Fecha y Hora
                      </span>
                      <span className="text-xs font-semibold text-text">{datePart}</span>
                      <span className="text-[10px] text-text-muted">{timePart}</span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-1">
                        <Layers className="w-3 h-3 text-text-muted/80" /> Nº de Visita
                      </span>
                      <span className="text-xs font-bold text-text">{viewCronograma.nroVisita}</span>
                    </div>
                  </div>

                  <div className="border-t border-border/60 my-1" />

                  {!isDirector && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-text-muted/80" /> Institución Educativa
                      </span>
                      <span className="text-xs font-semibold text-text">{viewCronograma.institucion}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-1">
                      <User className="w-3 h-3 text-text-muted/80" /> {isDirector ? 'Evaluado' : 'Docente / Directivo Monitoreado'}
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

                  {/* Observaciones si existen */}
                  {viewCronograma.observaciones && (
                    <>
                      <div className="border-t border-border/60 my-1" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase font-bold text-text-muted">Observaciones</span>
                        <span className="text-xs text-text bg-muted/30 rounded-lg p-2.5 border border-border/60">{viewCronograma.observaciones}</span>
                      </div>
                    </>
                  )}
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
        );
      })()}

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
