import { useState } from 'react';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@shared/ui/alert-dialog';
import { Button } from '@shared/ui/button';
import { Textarea } from '@shared/ui/textarea';
import { useEnviarAlertaDistrito } from '../api/use-notifications-api';

interface Props {
  distrito: string;
  promedio?: number;
}

/**
 * Notifica al Jefe de Gestión que un distrito presenta promedio crítico.
 * A diferencia de la alerta institucional, el destinatario es fijo (Jefe de Gestión).
 */
export const NotificarDistritoDialog = ({ distrito, promedio }: Props) => {
  const [open, setOpen] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const enviar = useEnviarAlertaDistrito();

  const handleEnviar = () => {
    enviar.mutate(
      { distrito, promedio, mensaje: mensaje.trim() || undefined },
      {
        onSuccess: (res) => {
          if (res.notificados > 0) {
            toast.success(
              `Notificado a ${res.notificados} Jefe${res.notificados > 1 ? 's' : ''} de Gestión.`,
            );
          } else {
            toast.warning('No hay Jefe de Gestión activo para notificar.');
          }
          setOpen(false);
          setMensaje('');
        },
        onError: (e) => toast.error((e as Error)?.message ?? 'No se pudo enviar la notificación.'),
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          title="Notificar al Jefe de Gestión sobre este distrito"
        >
          <Send className="w-3 h-3" /> Notificar al Jefe de Gestión
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Notificar distrito {distrito}</AlertDialogTitle>
          <AlertDialogDescription>
            Se enviará una alerta in-app (y correo, si está disponible) al Jefe de Gestión,
            indicando que el distrito {distrito}
            {promedio !== undefined ? ` (promedio ${promedio.toFixed(1)})` : ''} presenta un
            desempeño crítico.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-1.5 py-2">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Mensaje (opcional)
          </span>
          <Textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Ej: Priorizar acompañamiento en las II.EE. críticas de este distrito."
            maxLength={1000}
            rows={3}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={enviar.isPending}>Cancelar</AlertDialogCancel>
          <Button onClick={handleEnviar} disabled={enviar.isPending}>
            {enviar.isPending ? 'Enviando…' : 'Enviar notificación'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
