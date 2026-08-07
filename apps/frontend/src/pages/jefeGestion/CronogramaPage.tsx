import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAtenderSolicitud } from '@features/visit-requests';
import { PlusCircle } from 'lucide-react';
import { Button } from '@shared/ui/button';
import {
  especialistasAsignables,
  institucionesAsignables,
  modalidadesPermitidas,
  nivelesPermitidos,
} from '@features/cronogramas/lib/asignacion';
import { useFormularioCronograma } from '@features/cronogramas/hooks/use-formulario-cronograma';
import {
  fechaProgramadaPorDefecto,
  validarProgramacion,
} from '@features/cronogramas/lib/formulario';
import { useListadoCronogramas } from '@features/cronogramas/hooks/use-listado-cronogramas';
import { cronogramasVisibles } from '@features/cronogramas/lib/visibilidad';
import { BarraFiltros } from './cronograma/BarraFiltros';
import { ModalCronograma } from './cronograma/ModalCronograma';
import { TablaCronogramas } from './cronograma/TablaCronogramas';
import { ModalDetalleCronograma } from './cronograma/ModalDetalleCronograma';
import { PageHeader } from '@shared/ui/pageHeader';
import { ConfirmModal } from '@shared/ui/ConfirmModal';
import { useUser } from '@entities/model-user';
import { useCronogramasData } from '@features/cronogramas/hooks/use-cronogramas-data';
import type { Cronograma } from '@entities/model-cronogramas';
import {
  type EstadoVisita,
  type IUpdateVisitaRequest,
  type Modalidad,
} from '@sistema-monitoreo/shared-contracts';
import { useScope } from '@shared/auth';

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
  const navigate = useNavigate();
  const location = useLocation();
  const atenderSolicitud = useAtenderSolicitud();
  const [pendingSolicitudId, setPendingSolicitudId] = useState<string | null>(null);
  const { isInstitution, isMonitorCampo } = useScope();

  // Se llamaba `isDirector`, pero incluía al coordinador pedagógico y al jefe de
  // taller: es todo el personal del lado de la institución educativa. Se conserva
  // el identificador para no tocar sus 32 usos en este archivo; el nombre honesto
  // es el de la derecha.
  const isDirector = isInstitution;

  const isCoordOrTaller = isMonitorCampo && isInstitution;

  const {
    cronogramas,
    especialistas,
    instituciones,
    docentes,
    createCronograma,
    updateCronograma,
    deleteCronograma: deleteFromContext,
  } = useCronogramasData();

  // --- Estados de Filtro ---


  // --- Estados de Registro / Edición ---
  const [showFormModal, setShowFormModal] = useState(false);
  const [editCronogramaId, setEditCronogramaId] = useState<string | null>(null);

  // --- Valores del Formulario ---
  // Una sola pieza de estado, con actualizadores estables: es lo que permite
  // que el efecto de precarga declare sus dependencias en lugar de silenciarlas.
  const {
    valores: form,
    error: formError,
    enviando: formSubmitting,
    cambiar: cambiarForm,
    cargar: cargarForm,
    reiniciar: reiniciarForm,
    setError: setFormError,
    setEnviando: setFormSubmitting,
  } = useFormularioCronograma();

  const {
    fechaHora: formFechaHora,
    especialista: formEspecialista,
    institucion: formInstitucion,
    docente: formDocente,
    tipo: formTipo,
    visita: formVisita,
    estado: formEstado,
    modalidad: formModalidad,
    nivel: formNivel,
    observaciones: formObservaciones,
  } = form;

  const setFormFechaHora = (v: string) => cambiarForm('fechaHora', v);
  const setFormEspecialista = (v: string) => cambiarForm('especialista', v);
  const setFormInstitucion = (v: string) => cambiarForm('institucion', v);
  const setFormDocente = (v: string) => cambiarForm('docente', v);
  const setFormTipo = (v: 'DOCENTE' | 'DIRECTIVO') => cambiarForm('tipo', v);
  const setFormVisita = (v: string) => cambiarForm('visita', v);
  const setFormEstado = (v: Cronograma['estado']) => cambiarForm('estado', v);
  const setFormObservaciones = (v: string) => cambiarForm('observaciones', v);
  const setFormModalidad = (v: string) => cargarForm({ modalidad: v });
  const setFormNivel = (v: string) => cargarForm({ nivel: v });

  // Docente actualmente seleccionado en el formulario y sus visitas existentes
  const selectedDocente = useMemo(() => {
    if (!formDocente) return null;
    return docentes.find(
      (d) => `${d.nombres} ${d.apellidos}`.trim() === formDocente.trim(),
    ) ?? null;
  }, [formDocente, docentes]);

  // --- Estados de Detalles / Ver ---
  const [viewCronograma, setViewCronograma] = useState<Cronograma | null>(null);

  // --- Estado de Eliminado / Desactivación ---
  const [deleteCronogramaId, setDeleteCronogramaId] = useState<string | null>(null);

  const docentesDeLaInstitucion = useMemo(() => {
    if (isDirector) {
      if (!user || !user.institucion) return [];
      
      const baseList = docentes.filter(
        (doc) => 
          doc.institucionId === user.institucion && 
          doc.activo === true && 
          doc.cargo !== 'Director'
      );

      // Buscar el evaluador seleccionado
      const matchedEvaluador = docentes.find(
        (doc) =>
          doc.institucionId === user.institucion &&
          doc.activo === true &&
          `${doc.nombres} ${doc.apellidos}`.trim().toLowerCase() === formEspecialista.trim().toLowerCase()
      );

      if (
        matchedEvaluador &&
        (matchedEvaluador.cargo === 'Coordinador Pedagógico' ||
          matchedEvaluador.cargo === 'Jefe de Taller')
      ) {
        return baseList.filter(
          (doc) => doc.evaluadorActual?.evaluadorId === matchedEvaluador.id
        );
      }

      return baseList;
    }

    if (!formInstitucion) return [];
    const matchInst = instituciones.find(
      (inst) => inst.nombre.toLowerCase() === formInstitucion.toLowerCase()
    );
    if (!matchInst) return [];

    return docentes.filter((doc) => {
      const matchInstId = doc.institucionId === matchInst.id;
      const isActive = doc.activo === true;
      const isDirectorCargo = doc.cargo === 'Director';
      const matchCargo = formTipo === 'DIRECTIVO' ? isDirectorCargo : !isDirectorCargo;
      return matchInstId && isActive && matchCargo;
    });
  }, [isDirector, user, formInstitucion, formTipo, formEspecialista, docentes, instituciones]);

  // Limpia el docente seleccionado si deja de estar en la lista de opciones al cambiar de evaluador (solo en modo creación)
  useEffect(() => {
    if (editCronogramaId) return;
    if (!formEspecialista || !formDocente) return;
    const isValid = docentesDeLaInstitucion.some(
      (doc) => `${doc.nombres} ${doc.apellidos}`.trim() === formDocente.trim()
    );
    if (!isValid) {
      const t = setTimeout(() => {
        cambiarForm('docente', '');
      }, 0);
      return () => clearTimeout(t);
    }
  }, [formEspecialista, docentesDeLaInstitucion, formDocente, editCronogramaId, cambiarForm]);

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

    const matchInst = instituciones.find(
      (inst) => inst.nombre.toLowerCase() === targetInstName.toLowerCase()
    );
    return matchInst?.nivelEducativo.toLowerCase() === 'secundaria';
  }, [isDirector, user, formInstitucion, instituciones]);

  const evaluadoresDeLaInstitucion = useMemo(() => {
    const targetInstName = isDirector ? user?.institucionNombre : formInstitucion;
    if (!targetInstName) return [];

    const matchInst = instituciones.find(
      (inst) => inst.nombre.toLowerCase() === targetInstName.toLowerCase()
    );
    if (!matchInst) return [];

    return docentes.filter(
      (doc) =>
        doc.institucionId === matchInst.id &&
        doc.activo === true &&
        (doc.cargo === 'Director' ||
          doc.cargo === 'Coordinador Pedagógico' ||
          doc.cargo === 'Jefe de Taller')
    );
  }, [isDirector, user, formInstitucion, docentes, instituciones]);

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

  // Auto-calcula el numero de visita en base a las visitas existentes del
  // docente/directivo seleccionado. Solo aplica al crear; en edicion se
  // respeta el valor original (los botones son read-only en cualquier caso).
  // El setTimeout(0) cumple con react-hooks/set-state-in-effect (AGENTS.md §6).
  useEffect(() => {
    if (editCronogramaId) return;
    if (!formDocente) return;
    const matchedDoc = docentes.find(
      (d) => `${d.nombres} ${d.apellidos}`.trim() === formDocente.trim(),
    );
    if (!matchedDoc) return;
    const visitasPrevias = cronogramas
      .filter((c) => c.evaluadoId === matchedDoc.id && c.tipo === formTipo && c.estado !== 'ANULADO')
      .map((c) => parseInt(c.nroVisita, 10));
    const maxVisita = visitasPrevias.length > 0 ? Math.max(...visitasPrevias) : 0;
    const next = maxVisita + 1;
    const t = setTimeout(() => {
      cambiarForm('visita', String(next).padStart(2, '0'));
    }, 0);
    return () => clearTimeout(t);
  }, [formDocente, formTipo, editCronogramaId, docentes, cronogramas, cambiarForm]);

  // Cascada de asignacion: modalidad -> nivel -> especialista e institucion.
  // Las cuatro reglas viven en `features/cronogramas/lib/asignacion.ts`, con
  // cobertura propia; aca solo se les pasa el estado del formulario.
  const allowedModalidades = useMemo(() => modalidadesPermitidas(user), [user]);

  const nivelesDisponibles = useMemo(
    () => nivelesPermitidos(formModalidad, user),
    [formModalidad, user],
  );

  const especialistasFiltrados = useMemo(
    () => especialistasAsignables(especialistas, formModalidad, formNivel, user),
    [formModalidad, formNivel, especialistas, user],
  );

  const institucionesFiltradas = useMemo(
    () => institucionesAsignables(instituciones, formModalidad, formNivel),
    [formModalidad, formNivel, instituciones],
  );

  // Regla unica de visibilidad, compartida con CalendarioPage y con cobertura
  // en `features/cronogramas/lib/visibilidad.test.ts`.
  const filteredBaseCronogramas = useMemo(
    () => cronogramasVisibles(cronogramas, user),
    [cronogramas, user],
  );

  // Filtrado y paginacion del listado, en `use-listado-cronogramas`.
  const listado = useListadoCronogramas(filteredBaseCronogramas, isDirector);

  const uniqueInstituciones = useMemo(
    () => [...new Set(cronogramas.map((c) => c.institucion))].sort(),
    [cronogramas],
  );

  const resetForm = useCallback(() => {
    setEditCronogramaId(null);
    reiniciarForm();
  }, [reiniciarForm]);

  // --- Abrir Modal de Registro ---
  const handleOpenCreate = () => {
    resetForm();
    setFormFechaHora(fechaProgramadaPorDefecto());

    if (isDirector && user) {
      setFormInstitucion(user.institucionNombre || '');
      setFormEspecialista(`${user.nombres} ${user.apellidos}`);

      const matchInst = instituciones.find(
        (inst) => inst.nombre.toLowerCase() === user.institucionNombre?.toLowerCase()
      );
      if (matchInst) {
        setFormModalidad(matchInst.modalidad);
        setFormNivel(matchInst.nivelEducativo);
      } else {
        setFormModalidad('EBR');
        setFormNivel(user.institucionNivel || 'Primaria');
      }
    }

    setShowFormModal(true);
  };

  // --- Abrir Modal de Edición (síncrono: todos los setState se aplican en el mismo render) ---
  const handleOpenEdit = (item: Cronograma) => {
    setEditCronogramaId(item.id);
    setFormFechaHora(item.fechaHora);
    setFormModalidad(item.modalidad);
    setFormNivel(item.nivel);
    setFormDocente(item.docenteDirectivo);
    setFormTipo(item.tipo);
    setFormVisita(item.nroVisita);
    setFormEstado(item.estado);
    setFormObservaciones(item.observaciones || '');
    setFormEspecialista(item.especialista);
    setFormInstitucion(item.institucion);
    setFormError(null);
    setShowFormModal(true);
  };

  // --- Precarga desde una Solicitud de Visita ("Atender" del Jefe de Gestión) ---
  useEffect(() => {
    // `solicitudId` es opcional: viene de "Atender" una solicitud (Jefe de
    // Gestión la marca ATENDIDA al guardar) o está ausente cuando el Jefe de
    // Gestión genera la visita directamente desde Focos de Atención.
    const prefill = (location.state as { prefillSolicitud?: { solicitudId?: string; institucionId: string; docenteId?: string | null } } | null)
      ?.prefillSolicitud;
    if (!prefill) return;
    if (instituciones.length === 0 || docentes.length === 0) return; // esperar datos

    const ie = instituciones.find((i) => i.id === prefill.institucionId);
    const doc = prefill.docenteId ? docentes.find((d) => d.id === prefill.docenteId) : null;

    const timer = setTimeout(() => {
      setEditCronogramaId(null);
      // Una sola escritura del formulario en lugar de siete asignaciones
      // sueltas: es lo que permite declarar las dependencias de este efecto.
      reiniciarForm({
        fechaHora: fechaProgramadaPorDefecto(),
        tipo: 'DOCENTE',
        ...(ie
          ? { modalidad: ie.modalidad, nivel: ie.nivelEducativo, institucion: ie.nombre }
          : {}),
        ...(doc ? { docente: `${doc.nombres} ${doc.apellidos}`.trim() } : {}),
      });
      setPendingSolicitudId(prefill.solicitudId ?? null);
      setShowFormModal(true);

      // Limpiar el state para no reabrir el modal en cada render.
      navigate(location.pathname, { replace: true });
    }, 0);

    return () => clearTimeout(timer);
  }, [location.state, location.pathname, instituciones, docentes, reiniciarForm, navigate]);

  // --- Guardar Formulario ---
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Campos obligatorios y fecha no anterior al presente. Las reglas viven en
    // `lib/formulario.ts`, con cobertura; al editar no se revalida la fecha.
    const falta = validarProgramacion(form, { esEdicion: !!editCronogramaId });
    if (falta) {
      setFormError(falta);
      return;
    }

    const matchedEsp = especialistas.find(e => e.nombre === formEspecialista);
    const matchedInst = instituciones.find(i => i.nombre === formInstitucion);
    const matchedDoc = docentes.find(d => `${d.nombres} ${d.apellidos}` === formDocente.trim());

    if (!matchedEsp || !matchedInst || !matchedDoc) {
      setFormError('Error de resolución: No se encontraron los IDs correspondientes.');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editCronogramaId) {
        const updatePayload: IUpdateVisitaRequest = {
          detalles: formObservaciones.trim() || undefined,
          estado: formEstado as EstadoVisita,
        };
        await updateCronograma(editCronogramaId, updatePayload);
        setShowFormModal(false);
        // Auto-navegar al calendario en la fecha del cronograma editado
        const editedCronograma = cronogramas.find((c) => c.id === editCronogramaId);
        if (editedCronograma) {
          navigate('/monitoreo/calendario', {
            state: { newDate: editedCronograma.fechaHora.substring(0, 10) },
          });
        }
      } else {
        const [datePart, timePart] = formFechaHora.split('T');
        const horaInicio = timePart.length === 5 ? `${timePart}:00` : timePart;
        const creada = await createCronograma({
          monitorId: matchedEsp.id,
          institucionId: matchedInst.id,
          evaluadoId: matchedDoc.id,
          tipoMonitoreo: formTipo,
          numeroVisita: parseInt(formVisita, 10),
          fechaProgramada: datePart,
          horaInicio,
          modalidad: formModalidad as Modalidad,
          nivelEducativo: formNivel,
          detalles: formObservaciones.trim() || undefined
        });
        setShowFormModal(false);

        // Si venía de "Atender" una solicitud, enlazarla y marcarla ATENDIDA.
        if (pendingSolicitudId) {
          try {
            await atenderSolicitud.mutateAsync({
              id: pendingSolicitudId,
              body: { cronogramaId: creada?.id },
            });
            toast.success('Solicitud de visita atendida con este cronograma.');
          } catch {
            toast.warning('Cronograma creado, pero no se pudo marcar la solicitud.');
          }
          setPendingSolicitudId(null);
        }

        // Auto-navegar al calendario en la fecha del cronograma recién creado
        navigate('/monitoreo/calendario', {
          state: { newDate: datePart },
        });
      }
    } catch (err) {
      console.error('[Cronograma] Error guardando:', err);
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setFormError(`Error al guardar: ${errorMsg}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  // --- Confirmar Eliminado ---
  const handleDeleteConfirm = () => {
    if (!deleteCronogramaId) return;
    deleteFromContext(deleteCronogramaId);
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
      case 'EN_PROCESO':
        return 'bg-amber-50 text-amber-600 border border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'COMPLETADO':
        return 'bg-purple-50 text-purple-600 border border-purple-200/50 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30';
      case 'REPROGRAMADO':
        return 'bg-indigo-50 text-indigo-600 border border-indigo-200/50 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30';
      case 'CANCELADO':
        return 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50';
      case 'ANULADO':
        return 'bg-red-50 text-red-500 border border-red-200/50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
    }
  };

  // Botones de número de visita dinámicos
  const visitaButtons = useMemo(() => {
    let ocupados: Set<number>;
    let anulados: Set<number>;
    let maxNonAnulado = 0;
    if (selectedDocente) {
      const visitasDelEvaluado = cronogramas.filter(
        (c) => c.evaluadoId === selectedDocente.id && c.tipo === formTipo,
      );
      maxNonAnulado = Math.max(
        0,
        ...visitasDelEvaluado
          .filter((c) => c.estado !== 'ANULADO')
          .map((c) => parseInt(c.nroVisita, 10)),
      );
      ocupados = new Set(
        visitasDelEvaluado
          .filter((c) => c.estado !== 'ANULADO')
          .map((c) => parseInt(c.nroVisita, 10)),
      );
      anulados = new Set(
        visitasDelEvaluado
          .filter((c) => c.estado === 'ANULADO')
          .map((c) => parseInt(c.nroVisita, 10)),
      );
    } else {
      ocupados = new Set();
      anulados = new Set();
    }
    const totalCount = Math.max(5, maxNonAnulado + 1);

    return Array.from({ length: totalCount }, (_, i) => {
      const num = i + 1;
      const strNum = String(num).padStart(2, '0');
      return {
        value: strNum,
        num,
        isOcupado: ocupados.has(num),
        isAnulado: anulados.has(num),
        isFuture: !ocupados.has(num) && !anulados.has(num) && num > maxNonAnulado + 1,
      };
    });
  }, [selectedDocente, formTipo, cronogramas]);

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

      <BarraFiltros
        filtros={listado.filtros}
        onCambiar={listado.cambiarFiltro}
        instituciones={uniqueInstituciones}
        esDirector={isDirector}
      />

      <TablaCronogramas
        cronogramas={listado.paginados}
        esDirector={isDirector}
        paginacion={{
          desde: listado.desde,
          hasta: listado.hasta,
          total: listado.filtrados.length,
          pagina: listado.pagina,
          totalPaginas: listado.totalPaginas,
          onPagina: listado.irAPagina,
        }}
        onVer={setViewCronograma}
        onEditar={handleOpenEdit}
        onEliminar={setDeleteCronogramaId}
        formatearFechaHora={formatTableDateTime}
        colorDeIniciales={getInitialsColor}
        estiloTipo={getTipoStyle}
        estiloEstado={getEstadoStyle}
      />

      {showFormModal && (
        <ModalCronograma
          form={form}
          onCambiar={cambiarForm}
          opciones={{
            modalidades: allowedModalidades,
            niveles: nivelesDisponibles,
            especialistas: especialistasFiltrados.map((e) => ({ value: e.nombre, label: e.nombre })),
            instituciones: institucionesFiltradas.map((i) => ({ value: i.nombre, label: i.nombre })),
            evaluados: docenteOptions,
            evaluadores: evaluadorOptions,
            visitas: visitaButtons,
          }}
          perfil={{
            esDirector: isDirector,
            esSecundaria: isSecundaria,
            esCoordinadorOTaller: isCoordOrTaller,
          }}
          esEdicion={editCronogramaId !== null}
          envio={{ error: formError, enviando: formSubmitting }}
          onEnviar={handleFormSubmit}
          onCerrar={() => setShowFormModal(false)}
        />
      )}

      {viewCronograma && (
        <ModalDetalleCronograma
          cronograma={viewCronograma}
          esDirector={isDirector}
          onCerrar={() => setViewCronograma(null)}
          formatearFechaHora={formatTableDateTime}
          colorDeIniciales={getInitialsColor}
          estiloTipo={getTipoStyle}
          estiloEstado={getEstadoStyle}
        />
      )}

      {/* ── Modal de Confirmación para Eliminado ── */}
      {deleteCronogramaId && (
        <ConfirmModal
          title="¿Desea anular este cronograma?"
          message={
            <span>
              Esta acción marcará la visita como ANULADA. El número de visita quedará como evidencia de auditoría.
            </span>
          }
          confirmLabel="Anular Cronograma"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteCronogramaId(null)}
          danger
        />
      )}
    </div>
  );
};
