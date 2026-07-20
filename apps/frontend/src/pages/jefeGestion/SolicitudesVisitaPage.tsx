import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CalendarClock, Check, X } from 'lucide-react';
import { Card } from '@shared/ui/card';
import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';
import { useSolicitudesVisita, useRechazarSolicitud } from '@features/visit-requests';

const ESTADOS = [
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: '', label: 'Todas' },
] as const;

export const SolicitudesVisitaPage = () => {
  const [estado, setEstado] = useState<string>('PENDIENTE');
  const { data, isLoading } = useSolicitudesVisita(estado);
  const rechazar = useRechazarSolicitud();
  const navigate = useNavigate();

  const items = data?.items ?? [];

  // "Atender" abre el registro de cronograma precargado; la solicitud se marca
  // ATENDIDA automáticamente al guardar ese cronograma.
  const handleAtender = (s: (typeof items)[number]) =>
    navigate('/monitoreo/cronograma', {
      state: {
        prefillSolicitud: {
          solicitudId: s.id,
          institucionId: s.institucionId,
          docenteId: s.docenteId,
        },
      },
    });

  const handleRechazar = (id: string) => {
    const comentario = window.prompt('Motivo del rechazo (opcional):') ?? undefined;
    rechazar.mutate(
      { id, body: { comentario } },
      {
        onSuccess: () => toast.success('Solicitud rechazada.'),
        onError: (e) => toast.error((e as Error)?.message ?? 'No se pudo rechazar.'),
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarClock className="w-6 h-6" /> Solicitudes de visita
          </h1>
          <p className="text-sm text-text-muted">
            Pedidos de monitoreo priorizados por el Director UGEL.
          </p>
        </div>
        <div className="flex gap-1">
          {ESTADOS.map((e) => (
            <button
              key={e.value}
              onClick={() => setEstado(e.value)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
                estado === e.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-text-muted'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-text-muted">Cargando…</p>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center text-text-muted border-border">
          No hay solicitudes {estado === 'PENDIENTE' ? 'pendientes' : ''}.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((s) => (
            <Card key={s.id} className="p-4 border-border shadow-xs flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{s.institucionNombre}</span>
                  <Badge variant={s.prioridad === 'ALTA' ? 'destructive' : 'secondary'} className="text-[10px] uppercase">
                    {s.prioridad}
                  </Badge>
                  {s.estado !== 'PENDIENTE' && (
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {s.estado}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-text-muted uppercase tracking-wide">{s.distrito}</div>
                {s.docenteNombre && (
                  <p className="text-sm mt-1 font-medium">Docente: {s.docenteNombre}</p>
                )}
                {s.motivo && <p className="text-sm mt-1 text-text-muted">{s.motivo}</p>}
                <p className="text-xs text-text-muted mt-1">
                  Solicitado por {s.solicitanteNombre} ·{' '}
                  {new Date(s.createdAt).toLocaleDateString('es-PE')}
                </p>
              </div>

              {s.estado === 'PENDIENTE' && (
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" onClick={() => handleAtender(s)}>
                    <Check className="w-4 h-4 mr-1" /> Atender
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRechazar(s.id)}
                    disabled={rechazar.isPending}
                  >
                    <X className="w-4 h-4 mr-1" /> Rechazar
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
