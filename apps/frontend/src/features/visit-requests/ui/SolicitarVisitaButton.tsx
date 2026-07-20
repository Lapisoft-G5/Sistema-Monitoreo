import { CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useSolicitarVisita } from '../api/use-visits-api';

interface Props {
  institucionId: string;
  institucionNombre: string;
  docenteId?: string;
  docenteNombre?: string;
}

export const SolicitarVisitaButton = ({
  institucionId,
  institucionNombre,
  docenteId,
  docenteNombre,
}: Props) => {
  const solicitar = useSolicitarVisita();

  const handle = () =>
    solicitar.mutate(
      { institucionId, docenteId, prioridad: 'ALTA' },
      {
        onSuccess: () =>
          toast.success(`Visita solicitada para ${docenteNombre ?? institucionNombre}.`),
        onError: (e) => toast.error((e as Error)?.message ?? 'No se pudo solicitar la visita.'),
      },
    );

  return (
    <button
      onClick={handle}
      disabled={solicitar.isPending}
      className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-60"
      title="Solicitar visita de monitoreo prioritaria"
    >
      <CalendarPlus className="w-3 h-3" /> {solicitar.isPending ? 'Solicitando…' : 'Solicitar visita'}
    </button>
  );
};
