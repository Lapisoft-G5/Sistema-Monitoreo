import type { AspectoEvaluado, Desempeno } from './model';
import { NIVELES_ROMANOS } from './constants';

const uid = () => globalThis.crypto?.randomUUID?.() ?? String(Math.random());

// Crea un aspecto evaluado vacío (fila del checklist).
export const crearAspectoVacio = (): AspectoEvaluado => ({
  id: uid(),
  descripcion: '',
});

// Crea un desempeño vacío con su rúbrica inicializada (una entrada por nivel I-IV).
export const crearDesempenoVacio = (): Desempeno => ({
  id: uid(),
  nombre: '',
  descripcionCorta: '',
  aspectos: [crearAspectoVacio()],
  rubrica: NIVELES_ROMANOS.map((nivel) => ({ nivel, descripcion: '' })),
});
