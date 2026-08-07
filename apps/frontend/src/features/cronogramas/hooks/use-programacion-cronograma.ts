import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Cronograma } from '@entities/model-cronogramas';
import type { Docente } from '@entities/model-docentes';
import { useAtenderSolicitud } from '@features/visit-requests';
import {
  especialistasAsignables,
  institucionesAsignables,
  modalidadesPermitidas,
  nivelesPermitidos,
  type EspecialistaAsignable,
  type InstitucionAsignable,
  type UsuarioAsignador,
} from '../lib/asignacion';
import { fechaProgramadaPorDefecto, validarProgramacion } from '../lib/formulario';
import {
  opcionesDeEspecialista,
  opcionesDeInstitucion,
  type InstitucionOfrecible,
} from '../lib/opciones-de-asignacion';
import { numerosDeVisitaDisponibles } from '../lib/numeracion-visitas';
import { aPayloadDeCreacion, aPayloadDeEdicion, resolverReferencias } from '../lib/payload';
import { useFormularioCronograma } from './use-formulario-cronograma';
import { useOpcionesDeEvaluacion } from './use-opciones-de-evaluacion';
import { useSincronizacionFormulario } from './use-sincronizacion-formulario';

/** Datos que la precarga trae desde una solicitud de visita. */
interface PrefillSolicitud {
  solicitudId?: string;
  institucionId: string;
  docenteId?: string | null;
}

interface UsuarioProgramador extends UsuarioAsignador {
  /** Identificador de su institución, cuando pertenece a una. */
  institucion?: string;
  /** Identificador de su registro de especialista, con el que se lo asigna. */
  especialistaId?: string;
}

interface ProgramacionParams {
  usuario: UsuarioProgramador | null | undefined;
  /** Personal de institución educativa: programa sobre su propio colegio. */
  esDeInstitucion: boolean;
  catalogos: {
    cronogramas: readonly Cronograma[];
    especialistas: readonly (EspecialistaAsignable & {
      id: string;
      personaId: string;
      nombre: string;
      cargo?: string;
    })[];
    instituciones: readonly (InstitucionAsignable & InstitucionOfrecible)[];
    docentes: readonly Docente[];
  };
  crear: (payload: never) => Promise<{ id?: string } | undefined | void>;
  actualizar: (id: string, payload: never) => Promise<unknown>;
}

/**
 * Programación de una visita de monitoreo: alta, edición y precarga.
 *
 * Fase 5 de PLAN_REMEDIACION.md. `CronogramaPage` mezclaba dos asuntos
 * distintos: **listar** cronogramas y **programar** uno. Este hook toma el
 * segundo entero —estado del formulario, cascada de opciones, correcciones
 * automáticas y guardado— y deja a la página con el listado.
 *
 * Las reglas viven en `../lib`, con cobertura propia; acá sólo se coordinan.
 */
export function useProgramacionCronograma({
  usuario,
  esDeInstitucion,
  catalogos,
  crear,
  actualizar,
}: ProgramacionParams) {
  const navigate = useNavigate();
  const location = useLocation();
  const atenderSolicitud = useAtenderSolicitud();

  const [abierto, setAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [solicitudPendiente, setSolicitudPendiente] = useState<string | null>(null);

  const {
    valores: form,
    error,
    enviando,
    cambiar,
    reiniciar,
    setError,
    setEnviando,
  } = useFormularioCronograma();

  const { cronogramas, especialistas, instituciones, docentes } = catalogos;

  /** Evaluado elegido, resuelto a su registro. */
  const evaluadoResuelto = useMemo(
    () => (form.evaluadoId ? (docentes.find((d) => d.id === form.evaluadoId) ?? null) : null),
    [form.evaluadoId, docentes],
  );

  const { evaluados, esSecundaria, opcionesDeEvaluado, opcionesDeEvaluador } =
    useOpcionesDeEvaluacion({
      docentes,
      instituciones,
      especialistas,
      esDirector: esDeInstitucion,
      institucionDelUsuarioId: usuario?.institucion,
      institucionElegidaId: form.institucionId,
      tipoDeVisita: form.tipo,
      evaluadorElegidoId: form.monitorId,
      evaluadoElegidoId: form.evaluadoId,
    });

  useSincronizacionFormulario({
    esEdicion: editandoId !== null,
    evaluadorElegidoId: form.monitorId,
    evaluadoElegidoId: form.evaluadoId,
    tipoDeVisita: form.tipo,
    evaluadosDisponibles: evaluados,
    evaluadoResuelto,
    cronogramas,
    onCambiar: cambiar,
  });

  // Cascada de asignación: modalidad → nivel → especialista e institución.
  const opciones = useMemo(
    () => ({
      modalidades: modalidadesPermitidas(usuario),
      niveles: nivelesPermitidos(form.modalidad, usuario),
      especialistas: opcionesDeEspecialista(
        especialistasAsignables(especialistas, form.modalidad, form.nivel, usuario),
      ),
      instituciones: opcionesDeInstitucion(
        institucionesAsignables(instituciones, form.modalidad, form.nivel),
      ),
      evaluados: opcionesDeEvaluado,
      evaluadores: opcionesDeEvaluador,
      visitas: numerosDeVisitaDisponibles(
        evaluadoResuelto
          ? cronogramas.filter(
              (c) => c.evaluadoId === evaluadoResuelto.id && c.tipo === form.tipo,
            )
          : [],
      ),
    }),
    [
      usuario,
      form.modalidad,
      form.nivel,
      form.tipo,
      especialistas,
      instituciones,
      opcionesDeEvaluado,
      opcionesDeEvaluador,
      evaluadoResuelto,
      cronogramas,
    ],
  );

  const abrirCreacion = () => {
    setEditandoId(null);

    // Quien pertenece a una institución programa siempre sobre la suya: se
    // precarga para que no tenga que elegir lo único que puede elegir. Se busca
    // por identificador, que el token ya trae; antes se buscaba por nombre y,
    // si no acertaba, se rellenaba con 'EBR' y 'Primaria' inventados.
    const suInstitucion = instituciones.find((i) => i.id === usuario?.institucion);

    reiniciar({
      fechaHora: fechaProgramadaPorDefecto(),
      ...(esDeInstitucion && suInstitucion
        ? {
            institucionId: suInstitucion.id,
            monitorId: usuario?.especialistaId ?? '',
            modalidad: suInstitucion.modalidad,
            nivel: suInstitucion.nivelEducativo,
          }
        : {}),
    });

    setAbierto(true);
  };

  const abrirEdicion = (visita: Cronograma) => {
    setEditandoId(visita.id);
    reiniciar({
      fechaHora: visita.fechaHora,
      modalidad: visita.modalidad,
      nivel: visita.nivel,
      tipo: visita.tipo,
      visita: visita.nroVisita,
      estado: visita.estado,
      observaciones: visita.observaciones || '',
      monitorId: visita.monitorId,
      institucionId: visita.institucionId,
      evaluadoId: visita.evaluadoId ?? '',
    });
    setAbierto(true);
  };

  /** Precarga desde «Atender» una solicitud de visita. */
  useEffect(() => {
    const prefill = (location.state as { prefillSolicitud?: PrefillSolicitud } | null)
      ?.prefillSolicitud;
    if (!prefill) return;
    // Esperar a que los catálogos estén cargados para poder resolver los datos.
    if (instituciones.length === 0 || docentes.length === 0) return;

    const ie = instituciones.find((i) => i.id === prefill.institucionId);
    const doc = prefill.docenteId ? docentes.find((d) => d.id === prefill.docenteId) : null;

    const timer = setTimeout(() => {
      setEditandoId(null);
      reiniciar({
        fechaHora: fechaProgramadaPorDefecto(),
        tipo: 'DOCENTE',
        ...(ie ? { modalidad: ie.modalidad, nivel: ie.nivelEducativo, institucionId: ie.id } : {}),
        ...(doc ? { evaluadoId: doc.id } : {}),
      });
      setSolicitudPendiente(prefill.solicitudId ?? null);
      setAbierto(true);

      // Limpiar el state para no reabrir el modal en cada render.
      navigate(location.pathname, { replace: true });
    }, 0);

    return () => clearTimeout(timer);
  }, [location.state, location.pathname, instituciones, docentes, reiniciar, navigate]);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const falta = validarProgramacion(form, { esEdicion: !!editandoId });
    if (falta) {
      setError(falta);
      return;
    }

    const referencias = resolverReferencias(form, { especialistas, instituciones, docentes });
    if (!referencias) {
      setError('Error de resolución: No se encontraron los IDs correspondientes.');
      return;
    }

    setEnviando(true);
    try {
      if (editandoId) {
        await actualizar(editandoId, aPayloadDeEdicion(form) as never);
        setAbierto(false);

        const editado = cronogramas.find((c) => c.id === editandoId);
        if (editado) {
          navigate('/monitoreo/calendario', {
            state: { newDate: editado.fechaHora.substring(0, 10) },
          });
        }
        return;
      }

      const payload = aPayloadDeCreacion(form, referencias);
      const creada = await crear(payload as never);
      setAbierto(false);

      // Si venía de «Atender» una solicitud, enlazarla y marcarla ATENDIDA.
      if (solicitudPendiente) {
        try {
          await atenderSolicitud.mutateAsync({
            id: solicitudPendiente,
            body: { cronogramaId: creada?.id },
          });
          toast.success('Solicitud de visita atendida con este cronograma.');
        } catch {
          toast.warning('Cronograma creado, pero no se pudo marcar la solicitud.');
        }
        setSolicitudPendiente(null);
      }

      navigate('/monitoreo/calendario', { state: { newDate: payload.fechaProgramada } });
    } catch (err) {
      console.error('[Cronograma] Error guardando:', err);
      const detalle = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al guardar: ${detalle}`);
    } finally {
      setEnviando(false);
    }
  };

  return {
    form,
    cambiar,
    opciones,
    esSecundaria,
    abierto,
    esEdicion: editandoId !== null,
    envio: { error, enviando },
    abrirCreacion,
    abrirEdicion,
    cerrar: () => setAbierto(false),
    guardar,
  };
}
