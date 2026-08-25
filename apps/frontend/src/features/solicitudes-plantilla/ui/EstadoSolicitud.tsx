import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { ISolicitudPlantilla } from '@sistema-monitoreo/shared-contracts';

/**
 * Piezas que comparten la bandeja del Jefe de Gestión y el seguimiento del
 * director. Las dos pantallas muestran el mismo pedido desde lados distintos,
 * de modo que el estado y el detalle se declaran una sola vez.
 */

const ESTILOS = {
  PENDIENTE: { texto: 'Pendiente', clase: 'bg-amber-50 text-amber-800 border-amber-200', Icono: Clock },
  APROBADA: {
    texto: 'Aprobada',
    clase: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Icono: CheckCircle2,
  },
  RECHAZADA: { texto: 'Rechazada', clase: 'bg-red-50 text-red-800 border-red-200', Icono: XCircle },
} as const;

export function InsigniaEstado({ estado }: { estado: ISolicitudPlantilla['estado'] }) {
  const { texto, clase, Icono } = ESTILOS[estado];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${clase}`}
    >
      <Icono className="h-3.5 w-3.5" />
      {texto}
    </span>
  );
}

/**
 * Las plantillas pedidas dentro de un pedido.
 *
 * Cada fila marca si su cupo ya se usó. Es lo que permite ver de un vistazo si
 * una aprobación queda con saldo, sin abrir el catálogo de plantillas.
 */
export function ItemsSolicitados({ solicitud }: { solicitud: ISolicitudPlantilla }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {solicitud.items.map((item) => (
        <li key={item.id} className="text-sm flex flex-wrap items-baseline gap-x-2">
          <span className="font-semibold">
            {item.instrumento === 'DOCENTE_EIB' ? 'Docente EIB' : 'Docente'}
          </span>
          <span className="text-muted-foreground">· {item.cargoBeneficiario}</span>
          <span className="text-slate-700">— {item.descripcion}</span>
          {solicitud.estado === 'APROBADA' && (
            <span
              className={`text-xs ${item.plantillaId ? 'text-muted-foreground' : 'text-emerald-700 font-medium'}`}
            >
              {item.plantillaId ? '(cupo usado)' : '(cupo disponible)'}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
