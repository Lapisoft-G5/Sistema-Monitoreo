import { useState } from 'react';
import { FileText, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  CargoBeneficiario,
  INSTRUMENTOS_SOLICITABLES,
  type ISolicitudPlantilla,
  type TipoPlantilla,
} from '@sistema-monitoreo/shared-contracts';
import { PageHeader } from '@shared/ui/pageHeader';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { ErrorDeApi } from '@shared/config/api';
import {
  useCrearSolicitudPlantilla,
  useMisSolicitudesPlantilla,
} from '../api/use-solicitudes-plantilla-api';
import { InsigniaEstado, ItemsSolicitados } from './EstadoSolicitud';

/**
 * Solicitudes de plantilla de la institución, vistas por su director.
 *
 * El catálogo oficial son las tres fichas de la UGEL. Si la institución
 * necesita un instrumento propio, el director lo pide acá con un PDF que lo
 * justifica y la Jefatura de Gestión decide.
 *
 * El director es la única boca de la institución: también tramita lo que
 * necesitan el Jefe de Taller y el Coordinador Pedagógico, y por eso cada
 * plantilla pedida declara para qué cargo es.
 */

const ETIQUETA_INSTRUMENTO: Record<string, string> = {
  DOCENTE: 'Docente',
  DOCENTE_EIB: 'Docente EIB',
};

interface ItemBorrador {
  instrumento: TipoPlantilla;
  cargoBeneficiario: CargoBeneficiario;
  descripcion: string;
}

const itemVacio = (): ItemBorrador => ({
  instrumento: 'DOCENTE',
  cargoBeneficiario: CargoBeneficiario.DIRECTOR,
  descripcion: '',
});

const motivoDelFallo = (error: unknown, respaldo: string): string =>
  error instanceof ErrorDeApi && error.message ? error.message : respaldo;

function Formulario({ onListo }: { onListo: () => void }) {
  const [anio] = useState(() => new Date().getFullYear());
  const [items, setItems] = useState<ItemBorrador[]>([itemVacio()]);
  const [pdf, setPdf] = useState<File | null>(null);

  const crear = useCrearSolicitudPlantilla();

  const cambiar = (i: number, cambio: Partial<ItemBorrador>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...cambio } : it)));

  const completo = pdf !== null && items.every((i) => i.descripcion.trim() !== '');

  const enviar = async () => {
    if (!pdf) return;
    try {
      await crear.mutateAsync({
        dto: {
          anioEscolar: anio,
          items: items.map((i) => ({ ...i, descripcion: i.descripcion.trim() })),
        },
        pdf,
      });
      toast.success('Solicitud presentada. Espere la respuesta de la Jefatura de Gestión.');
      onListo();
    } catch (error) {
      toast.error(motivoDelFallo(error, 'No se pudo presentar la solicitud.'));
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6 flex flex-col gap-5">
      <h3 className="text-lg font-semibold">Nueva solicitud · {anio}</h3>

      <div className="flex flex-col gap-2">
        <Label htmlFor="pdf-justificacion">Justificación en PDF</Label>
        <Input
          id="pdf-justificacion"
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
        />
        <p className="text-xs text-muted-foreground">
          Explique por qué la institución necesita estas plantillas y qué no cubre la ficha
          oficial.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Label>Plantillas solicitadas</Label>
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr_auto] gap-2">
            <select
              aria-label={`Instrumento de la plantilla ${i + 1}`}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={item.instrumento}
              onChange={(e) => cambiar(i, { instrumento: e.target.value as TipoPlantilla })}
            >
              {INSTRUMENTOS_SOLICITABLES.map((valor) => (
                <option key={valor} value={valor}>
                  {ETIQUETA_INSTRUMENTO[valor] ?? valor}
                </option>
              ))}
            </select>

            <select
              aria-label={`Cargo destinatario de la plantilla ${i + 1}`}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={item.cargoBeneficiario}
              onChange={(e) =>
                cambiar(i, { cargoBeneficiario: e.target.value as CargoBeneficiario })
              }
            >
              {Object.values(CargoBeneficiario).map((cargo) => (
                <option key={cargo} value={cargo}>
                  {cargo}
                </option>
              ))}
            </select>

            <Input
              aria-label={`Descripción de la plantilla ${i + 1}`}
              placeholder="Para qué es esta plantilla"
              maxLength={300}
              value={item.descripcion}
              onChange={(e) => cambiar(i, { descripcion: e.target.value })}
            />

            <Button
              variant="ghost"
              aria-label={`Quitar la plantilla ${i + 1}`}
              disabled={items.length === 1}
              onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          variant="outline"
          className="w-fit"
          onClick={() => setItems((prev) => [...prev, itemVacio()])}
        >
          <Plus className="h-4 w-4" />
          Agregar otra plantilla
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={enviar} disabled={!completo || crear.isPending}>
          {crear.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Presentar solicitud
        </Button>
        <Button variant="ghost" onClick={onListo}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

function Tarjeta({ solicitud }: { solicitud: ISolicitudPlantilla }) {
  return (
    <div className="bg-white rounded-lg border shadow-sm p-5 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Solicitud {solicitud.anioEscolar}</span>
          <InsigniaEstado estado={solicitud.estado} />
        </div>
        <span className="text-xs text-muted-foreground">
          Presentada el {new Date(solicitud.createdAt).toLocaleDateString('es-PE')}
        </span>
      </div>

      <ItemsSolicitados solicitud={solicitud} />

      {solicitud.comentario && (
        <p
          className={`text-sm rounded-md p-3 ${
            solicitud.estado === 'RECHAZADA'
              ? 'bg-red-50 text-red-900'
              : 'bg-slate-50 text-slate-700'
          }`}
        >
          <strong>
            {solicitud.estado === 'RECHAZADA' ? 'Motivo del rechazo' : 'Nota de la Jefatura'}:
          </strong>{' '}
          {solicitud.comentario}
        </p>
      )}

      <a
        href={solicitud.justificacionUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary underline inline-flex items-center gap-1 w-fit"
      >
        <FileText className="h-4 w-4" />
        Ver la justificación
      </a>
    </div>
  );
}

export function MisSolicitudesPlantillaPage() {
  const [creando, setCreando] = useState(false);
  const { data, isLoading } = useMisSolicitudesPlantilla();

  const solicitudes = data?.solicitudes ?? [];
  const hayPendiente = solicitudes.some((s) => s.estado === 'PENDIENTE');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Solicitudes de Plantilla"
        description="Pide autorización a la Jefatura de Gestión para que tu institución use plantillas propias."
      />

      {!creando && (
        <Button
          className="w-fit"
          onClick={() => setCreando(true)}
          // Un segundo pedido abierto deja a la Jefatura decidiendo sobre
          // información que se contradice. El backend también lo rechaza.
          disabled={hayPendiente}
        >
          <Plus className="h-4 w-4" />
          Nueva solicitud
        </Button>
      )}
      {hayPendiente && !creando && (
        <p className="text-sm text-muted-foreground -mt-4">
          Ya tienes una solicitud pendiente. Espera la respuesta antes de presentar otra.
        </p>
      )}

      {creando && <Formulario onListo={() => setCreando(false)} />}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : solicitudes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Tu institución todavía no presentó solicitudes. Las tres fichas oficiales de la UGEL
          están disponibles sin trámite.
        </p>
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
