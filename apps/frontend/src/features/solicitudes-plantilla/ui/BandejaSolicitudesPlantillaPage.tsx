import { useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { ISolicitudPlantilla } from '@sistema-monitoreo/shared-contracts';
import { PageHeader } from '@shared/ui/pageHeader';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { ErrorDeApi } from '@shared/config/api';
import {
  useAprobarSolicitudPlantilla,
  useRechazarSolicitudPlantilla,
  useSolicitudesPlantilla,
} from '../api/use-solicitudes-plantilla-api';
import { InsigniaEstado, ItemsSolicitados } from './EstadoSolicitud';
import { BotonJustificacion } from './BotonJustificacion';

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

const motivoDelFallo = (error: unknown, respaldo: string): string =>
  error instanceof ErrorDeApi && error.message ? error.message : respaldo;

function Tarjeta({ solicitud }: { solicitud: ISolicitudPlantilla }) {
  const [motivo, setMotivo] = useState('');
  const [rechazando, setRechazando] = useState(false);

  const aprobar = useAprobarSolicitudPlantilla();
  const rechazar = useRechazarSolicitudPlantilla();

  const pendiente = solicitud.estado === 'PENDIENTE';
  const trabajando = aprobar.isPending || rechazar.isPending;

  const onAprobar = async () => {
    try {
      await aprobar.mutateAsync({ id: solicitud.id });
      toast.success('Solicitud aprobada. La institución ya puede crear esas plantillas.');
    } catch (error) {
      toast.error(motivoDelFallo(error, 'No se pudo aprobar la solicitud.'));
    }
  };

  const onRechazar = async () => {
    try {
      await rechazar.mutateAsync({ id: solicitud.id, body: { comentario: motivo.trim() } });
      toast.success('Solicitud rechazada.');
      setRechazando(false);
      setMotivo('');
    } catch (error) {
      toast.error(motivoDelFallo(error, 'No se pudo rechazar la solicitud.'));
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-5 flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{solicitud.institucionNombre}</span>
            <InsigniaEstado estado={solicitud.estado} />
          </div>
          <p className="text-xs text-muted-foreground">
            {solicitud.solicitante} · Año {solicitud.anioEscolar} ·{' '}
            {new Date(solicitud.createdAt).toLocaleDateString('es-PE')}
          </p>
        </div>

        <BotonJustificacion solicitudId={solicitud.id} variante="boton" />
      </div>

      <ItemsSolicitados solicitud={solicitud} />

      {solicitud.comentario && (
        <p className="text-sm rounded-md bg-slate-50 p-3 text-slate-700">
          <strong>Comentario:</strong> {solicitud.comentario}
        </p>
      )}

      {!pendiente && solicitud.resueltaPor && (
        <p className="text-xs text-muted-foreground">
          Resuelta por {solicitud.resueltaPor}
          {solicitud.resueltaAt
            ? ` el ${new Date(solicitud.resueltaAt).toLocaleDateString('es-PE')}`
            : ''}
        </p>
      )}

      {pendiente && !rechazando && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button onClick={onAprobar} disabled={trabajando}>
            {aprobar.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Aprobar
          </Button>
          <Button variant="outline" onClick={() => setRechazando(true)} disabled={trabajando}>
            <X className="h-4 w-4" />
            Rechazar
          </Button>
        </div>
      )}

      {pendiente && rechazando && (
        <div className="flex flex-col gap-2 pt-1">
          <Input
            aria-label="Motivo del rechazo"
            placeholder="Explique por qué se rechaza, para que el director sepa qué corregir"
            maxLength={1000}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              onClick={onRechazar}
              disabled={motivo.trim() === '' || trabajando}
            >
              {rechazar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar rechazo
            </Button>
            <Button variant="ghost" onClick={() => setRechazando(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BandejaSolicitudesPlantillaPage() {
  const [filtro, setFiltro] = useState<string | undefined>('PENDIENTE');
  const { data, isLoading } = useSolicitudesPlantilla(filtro);

  const solicitudes = data?.solicitudes ?? [];

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
            <Tarjeta key={s.id} solicitud={s} />
          ))}
        </div>
      )}
    </div>
  );
}
