import { prisma } from './prisma.js';
import { randomUUID } from 'node:crypto';

/**
 * Validadores de calidad de datos del seeder.
 * Lanzan warnings si los datos no cumplen las reglas minimas.
 */

const DNI_REGEX = /^\d{8}$/;
const EMAIL_UGEL_REGEX = /^[a-z]+\.[a-z]+@ugel\.gob\.pe$/i;

export function validarDNI(dni, contexto) {
  if (!DNI_REGEX.test(dni)) {
    console.warn(`[calidad] DNI invalido "${dni}" en ${contexto} (debe ser 8 digitos)`);
  }
}

export function validarEmail(email, contexto) {
  if (!EMAIL_UGEL_REGEX.test(email)) {
    console.warn(`[calidad] Email no institucional "${email}" en ${contexto} (esperado: nombre.apellido@ugel.gob.pe)`);
  }
}

export function validarEdadPlausible(fechaNacimiento, contexto) {
  if (!fechaNacimiento) return;
  const edad = (Date.now() - fechaNacimiento.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (edad < 22 || edad > 70) {
    console.warn(`[calidad] Edad ${edad.toFixed(0)} anos en ${contexto} (rango esperado: 22-70)`);
  }
}

/**
 * Helpers de upsert/find-or-create usando campos no-id.
 */
export async function findOrCreate(model, where, data) {
  const existing = await model.findFirst({ where });
  if (existing) return existing;
  return model.create({ data: { id: randomUUID(), ...data } });
}

export { prisma, randomUUID };
