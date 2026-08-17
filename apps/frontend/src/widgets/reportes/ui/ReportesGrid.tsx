import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useReactToPrint } from 'react-to-print';
import type { Cronograma } from '@/entities/model-cronogramas';
import type { Plantilla } from '@/entities/model-plantillas';
import { usePlantilla } from '@/entities/model-plantillas/use-plantillas-api';
import { LlenarFichaForm } from '@/features/monitoreos';
import { fichasApi } from '@/features/monitoreos/api/fichas.api';
import { fichaAEstadoFormulario } from '@/features/monitoreos/lib/ficha-estado';
import { FiltrosReportes } from './grid/FiltrosReportes';
import { TarjetaReporte } from './grid/TarjetaReporte';
import { TablaReportes } from './grid/TablaReportes';
import { FichaNoDisponible, SinReportes } from './grid/EstadosDelListado';
import { FichaPrintable } from './FichaPrintable';
import { reportesApi } from '@/shared/api/reportes.api';
import { toast } from 'sonner';

/**
 * Listado de fichas de monitoreo completadas.
 *
 * Fase 7 de PLAN_REMEDIACION.md. Tenía 616 líneas: los filtros, la vista de
 * cuadrícula, la de tabla —cada una con su copia del cálculo de la
 * calificación—, la traducción de la ficha del backend y una función que
 * devolvía una evaluación inventada cuando la ficha no llegaba.
 */

import type { FiltroPeriodoTipo } from '@/features/reportes/lib/filtro-temporal';

export interface BackendReportVisit extends Cronograma {
  /**
   * La visita de la que salió la ficha. `id` es el de la FICHA.
   *
   * Una visita docente puede llevar la ficha regular y la EIB, así que dos filas
   * pueden compartir cronograma. Ya viajaba en el objeto sin estar declarado.
   */
  cronogramaId?: string;
  plantillaId?: string;
  plantillaNombre?: string;
  nivelLogro?: string;
  promedio?: number;
  puntajeTotal?: number;
  correoEnviado?: boolean;
  horaInicio?: string;
  horaFin?: string;
  anioAcademico?: number;
}

interface ReportesGridProps {
  filteredVisits: BackendReportVisit[];
  viewMode: 'GRID' | 'TABLE';
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterModalidad: string;
  setFilterModalidad: (m: string) => void;
  filterNivel: string;
  setFilterNivel: (n: string) => void;
  filterAnio: string;
  setFilterAnio: (a: string) => void;
  filterTipo?: string;
  setFilterTipo?: (tipo: string) => void;
  conteosTipo?: Record<string, number>;
  filtroPeriodo: FiltroPeriodoTipo;
  setFiltroPeriodo: (p: FiltroPeriodoTipo) => void;
  conteosPeriodo?: Record<FiltroPeriodoTipo, number>;
  nivelesDisponibles: string[];
  añosDisponibles: string[];
  isAnyFilterActive: boolean;
  handleClearFilters: () => void;
  plantillas: Plantilla[];
  /** Cuando true, ajusta filtros y tarjetas para la perspectiva del docente evaluado */
  isEvaluatedView?: boolean;
}

export const ReportesGrid = ({
  filteredVisits,
  viewMode,
  plantillas,
  isEvaluatedView = false,
  ...filtros
}: ReportesGridProps) => {
  const [visitaAbierta, setVisitaAbierta] = useState<BackendReportVisit | null>(null);
  const queryClient = useQueryClient();

  const {
    data: fichaDelBackend,
    isLoading: cargandoFicha,
    isError: errorDeFicha,
  } = useQuery({
    queryKey: ['ficha-completada', visitaAbierta?.id],
    queryFn: () => {
      if (!visitaAbierta) return null;
      // El listado del backend trae el id de la FICHA; el respaldo local trae
      // el del cronograma, y hay que buscarla por la visita.
      return 'nivelLogro' in visitaAbierta
        ? fichasApi.findById(visitaAbierta.id)
        : fichasApi.findByVisita(visitaAbierta.id);
    },
    enabled: !!visitaAbierta,
  });

  // La plantilla se carga por id de la ficha, lo que funciona con `monitoreo:read`
  // y por lo tanto también para el docente evaluado.
  const plantillaDeLaFicha = usePlantilla(fichaDelBackend?.plantillaId).data;

  const plantillaActiva = useMemo(() => {
    if (!visitaAbierta) return null;
    if (plantillaDeLaFicha) return plantillaDeLaFicha;

    const tipoBuscado =
      visitaAbierta.tipo === 'DIRECTIVO'
        ? 'Monitoreo Directivo'
        : visitaAbierta.tipo === 'DOCENTE_EIB' ||
          visitaAbierta.tipo?.toUpperCase().includes('EIB')
        ? 'Monitoreo Docente EIB'
        : 'Monitoreo Docente';
    return (
      plantillas.find(
        (p) =>
          p.tipoMonitoreo === tipoBuscado ||
          p.tipoMonitoreo.toUpperCase().includes(tipoBuscado.toUpperCase()),
      ) ||
      plantillas[0] ||
      null
    );
  }, [plantillaDeLaFicha, visitaAbierta, plantillas]);

  /**
   * El estado del formulario sale de la ficha del backend, o no sale.
   */
  const estadoDeLaFicha = useMemo(
    () => (fichaDelBackend ? fichaAEstadoFormulario(fichaDelBackend) : null),
    [fichaDelBackend],
  );

  const cerrarFicha = () => setVisitaAbierta(null);

  // Impresión directa del formato oficial (FichaPrintable)
  const [visitaParaImprimir, setVisitaParaImprimir] = useState<BackendReportVisit | null>(null);
  const printDirectRef = useRef<HTMLDivElement>(null);
  const handlePrintDirect = useReactToPrint({ contentRef: printDirectRef });

  const {
    data: fichaParaImprimir,
    isError: errorFichaImprimir,
  } = useQuery({
    queryKey: ['ficha-imprimir-directa', visitaParaImprimir?.id],
    queryFn: () => {
      if (!visitaParaImprimir) return null;
      return 'nivelLogro' in visitaParaImprimir
        ? fichasApi.findById(visitaParaImprimir.id)
        : fichasApi.findByVisita(visitaParaImprimir.id);
    },
    enabled: !!visitaParaImprimir,
  });

  const plantillaDeLaFichaImprimir = usePlantilla(fichaParaImprimir?.plantillaId).data;

  const plantillaImprimirActiva = useMemo(() => {
    if (!visitaParaImprimir) return null;
    if (plantillaDeLaFichaImprimir) return plantillaDeLaFichaImprimir;

    const tipoBuscado =
      visitaParaImprimir.tipo === 'DIRECTIVO'
        ? 'Monitoreo Directivo'
        : visitaParaImprimir.tipo === 'DOCENTE_EIB' ||
          visitaParaImprimir.tipo?.toUpperCase().includes('EIB')
        ? 'Monitoreo Docente EIB'
        : 'Monitoreo Docente';
    return (
      plantillas.find(
        (p) =>
          p.tipoMonitoreo === tipoBuscado ||
          p.tipoMonitoreo.toUpperCase().includes(tipoBuscado.toUpperCase()),
      ) ||
      plantillas[0] ||
      null
    );
  }, [plantillaDeLaFichaImprimir, visitaParaImprimir, plantillas]);

  const estadoFichaImprimir = useMemo(
    () => (fichaParaImprimir ? fichaAEstadoFormulario(fichaParaImprimir) : null),
    [fichaParaImprimir],
  );

  useEffect(() => {
    if (errorFichaImprimir) {
      toast.error('No se pudo cargar la información de la ficha para exportar.');
      const timer = setTimeout(() => {
        setVisitaParaImprimir(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [errorFichaImprimir]);

  useEffect(() => {
    if (
      visitaParaImprimir &&
      fichaParaImprimir &&
      plantillaImprimirActiva &&
      estadoFichaImprimir &&
      printDirectRef.current
    ) {
      const timer = setTimeout(() => {
        handlePrintDirect();
        setVisitaParaImprimir(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [
    visitaParaImprimir,
    fichaParaImprimir,
    plantillaImprimirActiva,
    estadoFichaImprimir,
    handlePrintDirect,
  ]);

  const handleDescargarPdf = (visita: BackendReportVisit, e: React.MouseEvent) => {
    e.stopPropagation();
    setVisitaParaImprimir(visita);
  };

  const [enviandoCorreoId, setEnviandoCorreoId] = useState<string | null>(null);
  const handleEnviarCorreo = async (visita: BackendReportVisit, e: React.MouseEvent) => {
    e.stopPropagation();
    setEnviandoCorreoId(visita.id);
    try {
      await reportesApi.enviarFichaCorreo(visita.id);
      toast.success('Correo enviado con éxito.');
      await queryClient.invalidateQueries({ queryKey: ['reportes', 'fichas-completadas'] });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Error al enviar el correo.');
    } finally {
      setEnviandoCorreoId(null);
    }
  };

  const fichaLista = !!visitaAbierta && !!plantillaActiva && !!estadoDeLaFicha;
  const descargandoId = visitaParaImprimir?.id ?? null;

  return (
    <div className="space-y-6">
      <FiltrosReportes {...filtros} isEvaluatedView={isEvaluatedView} />

      {/* Contenedor oculto para renderizar la Ficha Oficial para el diálogo de PDF */}
      {visitaParaImprimir && plantillaImprimirActiva && estadoFichaImprimir && (
        <div style={{ display: 'none' }}>
          <FichaPrintable
            ref={printDirectRef}
            visit={visitaParaImprimir}
            template={plantillaImprimirActiva}
            fichaState={estadoFichaImprimir}
          />
        </div>
      )}

      {filteredVisits.length === 0 ? (
        <SinReportes />
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVisits.map((visita) => (
            <TarjetaReporte
              key={visita.id}
              visita={visita}
              isEvaluatedView={isEvaluatedView}
              onAbrir={() => setVisitaAbierta(visita)}
              onDescargar={(e) => handleDescargarPdf(visita, e)}
              isDescargando={descargandoId === visita.id}
              onEnviarCorreo={(e) => handleEnviarCorreo(visita, e)}
              isEnviandoCorreo={enviandoCorreoId === visita.id}
            />
          ))}
        </div>
      ) : (
        <TablaReportes
          visitas={filteredVisits}
          onAbrir={setVisitaAbierta}
          onDescargar={(visita, e) => handleDescargarPdf(visita, e)}
          descargandoId={descargandoId}
        />
      )}

      {fichaLista && (
        <LlenarFichaForm
          isOpen
          onClose={cerrarFicha}
          visit={visitaAbierta}
          template={plantillaActiva}
          initialState={estadoDeLaFicha}
        />
      )}

      {!!visitaAbierta && !fichaLista && (
        <FichaNoDisponible
          cargando={cargandoFicha && !errorDeFicha}
          onCerrar={cerrarFicha}
        />
      )}
    </div>
  );
};
