import { NavegacionPasos } from './NavegacionPasos';
import { EvidenciaGeneralSeccion } from './EvidenciaGeneralSeccion';

/** Los pasos de cierre que viven en el panel, después de los criterios. */
export type PasoCierreTipo = 'obs' | 'sugerencias' | 'compromisos' | 'evidencia';

interface PasoCierreProps {
  paso: PasoCierreTipo;
  observaciones: string;
  sugerencias: string;
  compromisos: string;
  onObservaciones: (texto: string) => void;
  onSugerencias: (texto: string) => void;
  onCompromisos: (texto: string) => void;
  evidencias: Record<string, string>;
  onEvidencias: (siguientes: Record<string, string>) => void;
  onVerImagen: (url: string) => void;
  soloLectura: boolean;
  onAnterior?: () => void;
  onSiguiente?: () => void;
}

const CLASES_TEXTAREA =
  'w-full bg-surface border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner h-40 resize-none leading-relaxed';

/** Configuración de cada paso de texto: título, ayuda y si es obligatorio. */
const TEXTOS: Record<
  Exclude<PasoCierreTipo, 'evidencia'>,
  { titulo: string; ayuda: string; placeholder: string; obligatorio: boolean }
> = {
  obs: {
    titulo: 'Observaciones Generales',
    ayuda: 'Opcional. Describa cómo se desarrolló la visita en conjunto, más allá de cada rúbrica.',
    placeholder: 'Describa cómo se desarrolló la visita en conjunto...',
    obligatorio: false,
  },
  sugerencias: {
    titulo: 'Sugerencias',
    ayuda: 'Obligatorio. Qué debería mejorar el docente a partir de lo observado.',
    placeholder: 'Escriba aquí las sugerencias...',
    obligatorio: true,
  },
  compromisos: {
    titulo: 'Compromisos',
    ayuda: 'Obligatorio. A qué se compromete el docente de cara a la próxima visita.',
    placeholder: 'Escriba aquí los compromisos...',
    obligatorio: true,
  },
};

/**
 * Un paso de cierre dentro del panel de la ficha.
 *
 * Antes el cierre (observaciones, sugerencias, compromisos y evidencia) vivía
 * al pie del formulario y el evaluador tenía que scrollear para llegar —o se lo
 * olvidaba—. Ahora es un paso más del mismo escenario: el índice de la
 * izquierda lo selecciona y «Siguiente» encadena desde el último criterio.
 */
export const PasoCierre = ({
  paso,
  observaciones,
  sugerencias,
  compromisos,
  onObservaciones,
  onSugerencias,
  onCompromisos,
  evidencias,
  onEvidencias,
  onVerImagen,
  soloLectura,
  onAnterior,
  onSiguiente,
}: PasoCierreProps) => {
  const valorPorPaso: Record<Exclude<PasoCierreTipo, 'evidencia'>, string> = {
    obs: observaciones,
    sugerencias,
    compromisos,
  };
  const cambioPorPaso: Record<Exclude<PasoCierreTipo, 'evidencia'>, (t: string) => void> = {
    obs: onObservaciones,
    sugerencias: onSugerencias,
    compromisos: onCompromisos,
  };

  const hayEvidencia = Object.keys(evidencias).some((clave) => clave.startsWith('GENERAL'));

  const etiqueta =
    paso === 'evidencia' ? 'Cierre · Evidencia' : `Cierre · ${TEXTOS[paso].titulo}`;

  const estado: 'completado' | 'pendiente' | null =
    paso === 'evidencia'
      ? hayEvidencia
        ? 'completado'
        : null
      : valorPorPaso[paso].trim()
        ? 'completado'
        : TEXTOS[paso].obligatorio
          ? 'pendiente'
          : null;

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-5 md:sticky md:top-0 self-start max-h-[560px] bg-white">
      <div className="space-y-5 animate-in fade-in duration-200">
        {paso === 'evidencia' ? (
          <EvidenciaGeneralSeccion
            evidencias={evidencias}
            onCambiar={onEvidencias}
            onVerImagen={onVerImagen}
            soloLectura={soloLectura}
          />
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-800 tracking-tight leading-snug">
                {TEXTOS[paso].titulo}
                {!TEXTOS[paso].obligatorio && (
                  <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Opcional
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {TEXTOS[paso].ayuda}
              </p>
            </div>
            <textarea
              value={valorPorPaso[paso]}
              onChange={(e) => cambioPorPaso[paso](e.target.value)}
              disabled={soloLectura}
              placeholder={TEXTOS[paso].placeholder}
              className={CLASES_TEXTAREA}
            />
          </div>
        )}

        <NavegacionPasos
          etiqueta={etiqueta}
          estado={estado}
          onAnterior={onAnterior}
          onSiguiente={onSiguiente}
        />
      </div>
    </div>
  );
};
