/**
 * Quién puede firmar una ficha, y por dónde se sirve la imagen de una firma.
 *
 * ── Por qué el rol se deriva y no se recibe ──
 * `SignFichaDto` declara un campo `rolFirmante` y el frontend lo envía, pero no
 * decide nada: el rol sale de comparar la persona del usuario autenticado contra
 * las partes del cronograma. Si se aceptara el del cuerpo, cualquiera podría
 * firmar como evaluador ajeno. Se deja acá, aislado y con pruebas, porque es la
 * decisión de autorización del módulo.
 */

export type RolFirmante = 'EVALUADO' | 'EVALUADOR';

/** Las dos partes de una visita, tal como llegan del cronograma. */
export interface PartesDeLaVisita {
  evaluado: { personaId: string } | null;
  monitor: { personaId: string } | null;
}

/**
 * El rol con el que esta persona firma la ficha, o nulo si no es parte.
 *
 * Compara por `personaId`, que es la clave que vincula `Usuario` con `Docente` y
 * con `Especialista`. Una persona sin `personaId` no es parte de nada: el
 * esquema lo declara requerido, y comprobarlo acá evita que dos valores ausentes
 * se consideren iguales si eso alguna vez cambia.
 */
export function rolFirmanteDe(
  personaId: string | null | undefined,
  partes: PartesDeLaVisita,
): RolFirmante | null {
  if (!personaId) return null;

  if (partes.evaluado?.personaId === personaId) return 'EVALUADO';
  if (partes.monitor?.personaId === personaId) return 'EVALUADOR';

  return null;
}

/**
 * Ruta autenticada por la que se sirve la imagen de una firma estampada.
 *
 * ── Por qué no se devuelve la ruta del archivo ──
 * `saveSignature` guarda en `uploads/`, que `main.ts` publica con
 * `express.static` SIN autenticación. Devolver esa ruta convertía la firma
 * manuscrita de una persona en un archivo descargable por cualquiera que
 * conociera la URL, y el propio endpoint de firmas las entregaba.
 *
 * Esta ruta pasa por el controlador, que exige sesión y aplica el mismo filtro
 * de alcance que el resto de las fichas. El prefijo `/api` lo pone
 * `setGlobalPrefix`, de modo que la ruta declarada acá lo lleva explícito porque
 * el cliente la usa tal cual.
 */
export function rutaDeImagenDeFirma(fichaId: string, rol: RolFirmante): string {
  return `/api/fichas/${fichaId}/firmas/${rol}/imagen`;
}

/** Ruta autenticada por la que cada persona recupera su propia firma. */
export const RUTA_DE_MI_FIRMA = '/api/fichas/me/firma/imagen';

/**
 * Si un nombre de archivo corresponde a una firma guardada en `uploads/`.
 *
 * `main.ts` lo usa para dejar de publicar esos archivos: las firmas viejas ya
 * están en el disco con este nombre y seguirían siendo descargables sin sesión.
 */
export function esArchivoDeFirma(ruta: string): boolean {
  return /(^|\/)firma-[0-9a-fA-F-]+\.png$/.test(ruta);
}
