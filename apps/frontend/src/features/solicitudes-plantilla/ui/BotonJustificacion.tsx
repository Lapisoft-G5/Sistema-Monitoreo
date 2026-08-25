import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { solicitudesPlantillaApi } from '@shared/api/solicitudes-plantilla.api';

/**
 * Abre el PDF de justificación de una solicitud.
 *
 * ── Por qué es un botón y no un enlace ──
 * El archivo no se sirve desde `uploads/`: ese estático no exige sesión, así
 * que un enlace directo dejaría el documento al alcance de cualquiera que
 * conociera la URL. Se pide por un endpoint que valida la sesión y acota por
 * institución, y eso obliga a traer el contenido y abrirlo desde el navegador.
 *
 * Un `href` relativo, además, ni siquiera funcionaba: el navegador lo resolvía
 * contra el frontend, el router no reconocía la ruta y mandaba al inicio.
 *
 * La URL temporal se libera después de abrirla. Cada `createObjectURL` retiene
 * el blob en memoria hasta que se revoca, y una bandeja con muchas solicitudes
 * las iría acumulando.
 */

interface Props {
  solicitudId: string;
  /** `enlace` para el seguimiento del director; `boton` para la bandeja. */
  variante?: 'enlace' | 'boton';
}

/** Margen para que la pestaña alcance a cargar el blob antes de revocarlo. */
const MS_ANTES_DE_LIBERAR = 60_000;

export function BotonJustificacion({ solicitudId, variante = 'enlace' }: Props) {
  const [abriendo, setAbriendo] = useState(false);

  const abrir = async () => {
    setAbriendo(true);
    try {
      const blob = await solicitudesPlantillaApi.justificacion(solicitudId);
      const url = URL.createObjectURL(blob);
      const abierta = window.open(url, '_blank', 'noopener,noreferrer');

      if (!abierta) {
        toast.error('El navegador bloqueó la ventana. Permití las ventanas emergentes.');
      }
      setTimeout(() => URL.revokeObjectURL(url), MS_ANTES_DE_LIBERAR);
    } catch {
      toast.error('No se pudo abrir la justificación.');
    } finally {
      setAbriendo(false);
    }
  };

  const contenido = (
    <>
      {abriendo ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      {variante === 'boton' ? 'Leer la justificación' : 'Ver la justificación'}
    </>
  );

  return (
    <button
      type="button"
      onClick={abrir}
      disabled={abriendo}
      className={
        variante === 'boton'
          ? 'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-60'
          : 'inline-flex items-center gap-1 text-sm text-primary underline w-fit disabled:opacity-60'
      }
    >
      {contenido}
    </button>
  );
}
