import { useState } from 'react';
import type { ISolicitudPlantilla } from '@sistema-monitoreo/shared-contracts';
import { PageHeader } from '@shared/ui/pageHeader';
import { Button } from '@shared/ui/button';
import { useSolicitudesPlantilla } from '../api/use-solicitudes-plantilla-api';
import { InsigniaEstado, ItemsSolicitados } from './EstadoSolicitud';
import { DetalleSolicitudDialog } from './DetalleSolicitudDialog';

/**
 * Bandeja del Jefe de Gestión.
 *
 * Decide sobre el pedido completo de una institución: aprueba o rechaza todas
 * las plantillas solicitadas de una vez.
 *
 * ── Por qué el rechazo exige motivo y la aprobación no ──
 * Un rechazo sin explicación obliga al director a adivinar qué corregir, y el
 * trámite vuelve igual. Una aprobación no necesita defenderse. El backend
 * aplica la misma regla: la pantalla no es el control.
 *
 * ── Por qué el PDF está a un clic y no escondido ──
 * Es el documento sobre el que se decide. Aprobar sin leerlo convierte el
 * trámite en un sello, y entonces la función no protege nada.
 */

function Tarjeta({
  solicitud,
  onAbrir,
}: {
  solicitud: ISolicitudPlantilla;
  onAbrir: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAbrir}
      className="w-full text-left bg-white rounded-lg border shadow-sm p-5 flex flex-col gap-2 hover:border-primary/40 hover:shadow transition-colors"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{solicitud.institucionNombre}</span>
          <InsigniaEstado estado={solicitud.estado} />
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(solicitud.createdAt).toLocaleDateString('es-PE')}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        {solicitud.solicitante} · Año {solicitud.anioEscolar} ·{' '}
        {solicitud.items.length === 1
          ? '1 plantilla solicitada'
          : `${solicitud.items.length} plantillas solicitadas`}
      </p>

      <ItemsSolicitados solicitud={solicitud} />

      <span className="text-xs font-semibold text-primary pt-1">
        Ver detalle y trazabilidad →
      </span>
    </button>
  );
}

export function BandejaSolicitudesPlantillaPage() {
  const [filtro, setFiltro] = useState<string | undefined>('PENDIENTE');
  const [abiertaId, setAbiertaId] = useState<string | null>(null);
  const { data, isLoading } = useSolicitudesPlantilla(filtro);

  const solicitudes = data?.solicitudes ?? [];
  // Se busca en la lista viva y no se guarda una copia: así el detalle refleja
  // el estado nuevo apenas la consulta se revalida tras aprobar o rechazar.
  const abierta = solicitudes.find((s) => s.id === abiertaId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Solicitudes de Plantilla"
        description="Pedidos de las instituciones para usar plantillas propias además de las fichas oficiales."
      />

      <div className="flex flex-wrap items-center gap-2">
        {[
          { valor: 'PENDIENTE', etiqueta: 'Pendientes' },
          { valor: 'APROBADA', etiqueta: 'Aprobadas' },
          { valor: 'RECHAZADA', etiqueta: 'Rechazadas' },
          { valor: undefined, etiqueta: 'Todas' },
        ].map(({ valor, etiqueta }) => (
          <Button
            key={etiqueta}
            variant={filtro === valor ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltro(valor)}
          >
            {etiqueta}
            {valor === 'PENDIENTE' && data?.pendientes ? ` (${data.pendientes})` : ''}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : solicitudes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay solicitudes en este estado.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {solicitudes.map((s) => (
            <Tarjeta key={s.id} solicitud={s} onAbrir={() => setAbiertaId(s.id)} />
          ))}
        </div>
      )}

      <DetalleSolicitudDialog
        solicitud={abierta}
        puedeDecidir
        onClose={() => setAbiertaId(null)}
      />
    </div>
  );
}
