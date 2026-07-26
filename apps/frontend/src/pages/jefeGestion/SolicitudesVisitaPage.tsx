import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CalendarClock, Check, X } from 'lucide-react';
import { Card } from '@shared/ui/card';
import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';
import { Textarea } from '@shared/ui/textarea';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@shared/ui/alert-dialog';
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

  // Solicitud seleccionada para rechazar (abre el modal) y su motivo.
  const [rechazando, setRechazando] = useState<{ id: string; nombre: string } | null>(null);
  const [motivo, setMotivo] = useState('');

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

  const abrirRechazo = (s: (typeof items)[number]) => {
    setMotivo('');
    setRechazando({ id: s.id, nombre: s.docenteNombre ?? s.institucionNombre });
  };

  const confirmarRechazo = () => {
    if (!rechazando) return;
    rechazar.mutate(
      { id: rechazando.id, body: { comentario: motivo.trim() || undefined } },
      {
        onSuccess: () => {
          toast.success('Solicitud rechazada.');
          setRechazando(null);
          setMotivo('');
        },
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
            Pedidos de visita de monitoreo priorizados. Atiéndelos agendando la visita.
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
                    onClick={() => abrirRechazo(s)}
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

      {/* Modal de rechazo: captura el motivo que verá el solicitante. */}
      <AlertDialog
        open={rechazando !== null}
        onOpenChange={(open) => {
          if (!open && !rechazar.isPending) setRechazando(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rechazar solicitud de visita</AlertDialogTitle>
            <AlertDialogDescription>
              Indica el motivo por el que se rechaza la solicitud
              {rechazando ? ` de ${rechazando.nombre}` : ''}. Se notificará al solicitante.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-1.5 py-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Motivo del rechazo (opcional)
            </span>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: La visita ya está contemplada en el cronograma vigente."
              maxLength={1000}
              rows={3}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={rechazar.isPending}>Cancelar</AlertDialogCancel>
            <Button variant="destructive" onClick={confirmarRechazo} disabled={rechazar.isPending}>
              {rechazar.isPending ? 'Rechazando…' : 'Rechazar solicitud'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
