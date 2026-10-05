import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { Cronograma } from '@entities/model-cronogramas';
import {
  type Plantilla,
  plantillasAplicables,
  seleccionarPlantillaActiva,
} from '@entities/model-plantillas';
import { usePlantillasList } from '@entities/model-plantillas/use-plantillas-api';
import { useCronogramasData } from '@features/cronogramas/hooks/use-cronogramas-data';
import { useUser } from '@entities/model-user';
import { useScope } from '@shared/auth';
import type { DatosFicha } from '../lib/ficha-estado';
import { useFichaPersistence, type PlantillaVersionada } from '../hooks/use-ficha-persistence';
import { LlenarFichaForm } from './LlenarFichaForm';
import { MigracionPlantillaFicha } from './MigracionPlantillaFicha';

/**
 * Página de "llenar ficha".
 *
 * El calendario y los reportes ya tienen `visit` y `template` resueltos al
 * navegar: se los pasa por `location.state` para una apertura instantánea.
 *
 * Si la página se abre sin ese estado (recarga del navegador en campo sin
 * conexión, rotación de pantalla o enlace directo), esta pantalla se
 * auto-recupera consultando el cache persistido en IndexedDB de TanStack Query
 * (`cronogramas` y `plantillas`) y el borrador de `localStorage`.
 */

interface LlenarFichaLocationState {
  visit?: Cronograma;
  template?: Plantilla;
  initialState?: DatosFicha;
}

export const LlenarFichaPage = () => {
  const { visitaId } = useParams<{ visitaId: string }>();
  const [searchParams] = useSearchParams();
  const plantillaIdParam = searchParams.get('plantillaId') ?? undefined;

  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LlenarFichaLocationState | null;
  const visitFromState = state?.visit && state.visit.id === visitaId ? state.visit : undefined;
  const templateFromState = state?.template;
  const initialStateFromState = state?.initialState;

  // Si visit o template no vinieron por location.state, recuperamos de la caché local persistida
  const necesitaCronogramas = !visitFromState;
  const necesitaPlantillas = !templateFromState;

  const { cronogramas, isLoading: cargandoCronogramas } = useCronogramasData(necesitaCronogramas);
  const { data: plantillas = [], isLoading: cargandoPlantillas } = usePlantillasList(undefined, {
    enabled: necesitaPlantillas,
  });
  const { user } = useUser();
  const { isMonitorCampo, isInstitution } = useScope();

  const visit = useMemo(() => {
    if (visitFromState) return visitFromState;
    if (!visitaId) return undefined;
    return cronogramas.find((c) => c.id === visitaId);
  }, [visitFromState, visitaId, cronogramas]);

  const template = useMemo(() => {
    if (templateFromState) return templateFromState;
    if (!plantillas || plantillas.length === 0) return undefined;

    // 1. Si vino por query parameter en la URL
    if (plantillaIdParam) {
      const encontrada = plantillas.find((p) => p.id === plantillaIdParam);
      if (encontrada) return encontrada;
    }

    // 2. Si existe un borrador guardado en localStorage para esta visita con alguna plantilla
    if (visitaId) {
      for (const p of plantillas) {
        if (localStorage.getItem(`sistema-monitoreo:ficha-state:${visitaId}:${p.id}`)) {
          return p;
        }
      }
    }

    // 3. Resolución por cascada oficial según alcance y visita
    if (visit && user) {
      const candidatas = plantillasAplicables(plantillas, {
        tipoVisita: visit.tipo,
        usuarioId: user.id,
        institucionUsuarioId: user.institucion,
        esInstitucion: isInstitution,
        esMonitorCampo: isMonitorCampo,
        anioVisita: new Date(visit.fechaHora).getFullYear(),
      });
      return (
        seleccionarPlantillaActiva(candidatas, {
          tipoVisita: visit.tipo,
          usuarioId: user.id,
          institucionUsuarioId: user.institucion,
          esInstitucion: isInstitution,
          esMonitorCampo: isMonitorCampo,
        }) ||
        candidatas[0] ||
        plantillas[0]
      );
    }

    return plantillas[0];
  }, [
    templateFromState,
    plantillas,
    plantillaIdParam,
    visitaId,
    visit,
    user,
    isInstitution,
    isMonitorCampo,
  ]);

  const volver = () => navigate(-1);

  // ILA-0046: la plantilla en uso pasó a Histórico mientras se llenaba la ficha; se ofrece migrar.
  const [migracionContext, setMigracionContext] = useState<PlantillaVersionada | null>(null);

  const { guardarBorrador, finalizar } = useFichaPersistence({
    plantillaId: template?.id,
    onPersistido: volver,
    onPlantillaVersionada: setMigracionContext,
  });

  const descartarMigracion = () => setMigracionContext(null);
  const resolverMigracion = () => {
    descartarMigracion();
    volver();
  };

  // Mientras se hidrata el cache de IndexedDB
  const cargando = (!visit && cargandoCronogramas) || (!template && cargandoPlantillas);
  if (cargando) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium text-text-muted">Cargando ficha de monitoreo…</p>
      </div>
    );
  }

  if (!visit || !template) {
    return (
      <div className="w-full max-w-[600px] mx-auto text-center py-20 bg-surface border border-border rounded-2xl shadow-sm mt-6">
        <h2 className="text-xl font-bold text-text mb-2">No se pudo abrir la ficha</h2>
        <p className="text-text-muted mb-6">
          Volvé a abrirla desde el Calendario o desde Reportes.
        </p>
        <button
          onClick={volver}
          className="px-5 py-2.5 bg-bg border border-border rounded-xl font-semibold text-text hover:bg-muted transition-colors cursor-pointer"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <>
      <LlenarFichaForm
        isOpen
        onClose={volver}
        visit={visit}
        template={template}
        initialState={initialStateFromState}
        onSave={guardarBorrador}
        onFinalize={finalizar}
      />

      <MigracionPlantillaFicha
        contexto={migracionContext}
        abierto={migracionContext !== null}
        onDescartar={descartarMigracion}
        onResuelto={resolverMigracion}
      />
    </>
  );
};
