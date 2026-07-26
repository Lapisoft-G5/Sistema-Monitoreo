import { CalendarPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUser } from '@entities/model-user';
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
  const { user } = useUser();
  const navigate = useNavigate();
  const solicitar = useSolicitarVisita();

  // El Jefe de Gestión agenda la visita directamente: en lugar de crear una
  // solicitud (que iría a "Solicitudes de visita"), abre el Registro de
  // Cronograma precargado con la IE y el docente. Los demás roles sí solicitan.
  const esJefeGestion = user?.role === 'jefe_gestion';

  const generarVisita = () =>
    navigate('/monitoreo/cronograma', {
      state: {
        prefillSolicitud: { institucionId, docenteId },
      },
    });

  const solicitarVisita = () =>
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
      onClick={esJefeGestion ? generarVisita : solicitarVisita}
      disabled={!esJefeGestion && solicitar.isPending}
      className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-60"
      title={
        esJefeGestion
          ? 'Generar la visita de monitoreo (registrar cronograma)'
          : 'Solicitar visita de monitoreo prioritaria'
      }
    >
      <CalendarPlus className="w-3 h-3" />
      {esJefeGestion
        ? 'Generar visita'
        : solicitar.isPending
          ? 'Solicitando…'
          : 'Solicitar visita'}
    </button>
  );
};
