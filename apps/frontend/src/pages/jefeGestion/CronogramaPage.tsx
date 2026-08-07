import { useState, useMemo, useEffect } from 'react';
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
import { useSincronizacionFormulario } from '@features/cronogramas/hooks/use-sincronizacion-formulario';
import { useOpcionesDeEvaluacion } from '@features/cronogramas/hooks/use-opciones-de-evaluacion';
import {
  aPayloadDeCreacion,
  aPayloadDeEdicion,
  resolverReferencias,
} from '@features/cronogramas/lib/payload';
import { numerosDeVisitaDisponibles } from '@features/cronogramas/lib/numeracion-visitas';
import { cronogramasVisibles } from '@features/cronogramas/lib/visibilidad';
import {
  colorDeIniciales,
  estiloDeEstado,
  estiloDeTipo,
  fechaYHoraDeTabla,
} from './cronograma/presentacion';
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
  type IUpdateVisitaRequest,
} from '@sistema-monitoreo/shared-contracts';
import { useScope } from '@shared/auth';

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
    reiniciar: reiniciarForm,
    setError: setFormError,
    setEnviando: setFormSubmitting,
  } = useFormularioCronograma();

  const {
    especialista: formEspecialista,
    institucion: formInstitucion,
    docente: formDocente,
    tipo: formTipo,
    modalidad: formModalidad,
    nivel: formNivel,
  } = form;


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

  // Quien puede evaluar y a quien, dentro de la institucion. En
  // `use-opciones-de-evaluacion`.
  const {
    evaluados: docentesDeLaInstitucion,
    esSecundaria: isSecundaria,
    opcionesDeEvaluado: docenteOptions,
    opcionesDeEvaluador: evaluadorOptions,
  } = useOpcionesDeEvaluacion({
    docentes,
    instituciones,
    esDirector: isDirector,
    institucionDelUsuario: { id: user?.institucion, nombre: user?.institucionNombre },
    institucionElegida: formInstitucion,
    tipoDeVisita: formTipo,
    evaluadorElegido: formEspecialista,
    evaluadoElegido: formDocente,
  });

  // Correcciones automáticas del formulario ante cambios en cascada.
  useSincronizacionFormulario({
    esEdicion: editCronogramaId !== null,
    evaluadorElegido: formEspecialista,
    evaluadoElegido: formDocente,
    tipoDeVisita: formTipo,
    evaluadosDisponibles: docentesDeLaInstitucion,
    evaluadoResuelto: selectedDocente,
    cronogramas,
    onCambiar: cambiarForm,
  });

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

  // --- Abrir Modal de Registro ---
  const handleOpenCreate = () => {
    setEditCronogramaId(null);

    // El director programa siempre sobre su propia institución: se precarga
    // para que no tenga que elegir lo único que puede elegir.
    const suInstitucion = instituciones.find(
      (inst) => inst.nombre.toLowerCase() === user?.institucionNombre?.toLowerCase(),
    );

    reiniciarForm({
      fechaHora: fechaProgramadaPorDefecto(),
      ...(isDirector && user
        ? {
            institucion: user.institucionNombre || '',
            especialista: `${user.nombres} ${user.apellidos}`,
            modalidad: suInstitucion?.modalidad ?? 'EBR',
            nivel: suInstitucion?.nivelEducativo ?? user.institucionNivel ?? 'Primaria',
          }
        : {}),
    });

    setShowFormModal(true);
  };

  const handleOpenEdit = (item: Cronograma) => {
    setEditCronogramaId(item.id);
    reiniciarForm({
      fechaHora: item.fechaHora,
      modalidad: item.modalidad,
      nivel: item.nivel,
      docente: item.docenteDirectivo,
      tipo: item.tipo,
      visita: item.nroVisita,
      estado: item.estado,
      observaciones: item.observaciones || '',
      especialista: item.especialista,
      institucion: item.institucion,
    });
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

    const referencias = resolverReferencias(form, { especialistas, instituciones, docentes });
    if (!referencias) {
      setFormError('Error de resolución: No se encontraron los IDs correspondientes.');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editCronogramaId) {
        await updateCronograma(editCronogramaId, aPayloadDeEdicion(form) as IUpdateVisitaRequest);
        setShowFormModal(false);

        const editado = cronogramas.find((c) => c.id === editCronogramaId);
        if (editado) {
          navigate('/monitoreo/calendario', {
            state: { newDate: editado.fechaHora.substring(0, 10) },
          });
        }
      } else {
        const payload = aPayloadDeCreacion(form, referencias);
        const creada = await createCronograma(payload as Parameters<typeof createCronograma>[0]);
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

        navigate('/monitoreo/calendario', { state: { newDate: payload.fechaProgramada } });
      }
    } catch (err) {
      console.error('[Cronograma] Error guardando:', err);
      const detalle = err instanceof Error ? err.message : 'Error desconocido';
      setFormError(`Error al guardar: ${detalle}`);
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
  const visitaButtons = useMemo(
    () =>
      numerosDeVisitaDisponibles(
        selectedDocente
          ? cronogramas.filter(
              (c) => c.evaluadoId === selectedDocente.id && c.tipo === formTipo,
            )
          : [],
      ),
    [selectedDocente, formTipo, cronogramas],
  );

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
        formatearFechaHora={fechaYHoraDeTabla}
        colorDeIniciales={colorDeIniciales}
        estiloTipo={estiloDeTipo}
        estiloEstado={estiloDeEstado}
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
          formatearFechaHora={fechaYHoraDeTabla}
          colorDeIniciales={colorDeIniciales}
          estiloTipo={estiloDeTipo}
          estiloEstado={estiloDeEstado}
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
