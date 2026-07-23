import { describe, it, expect } from 'vitest';
import { directorSchema } from './validator';

/** Datos válidos base; cada test sobrescribe el campo bajo prueba. */
const baseValido = {
  nombres: 'Juan Carlos',
  apellidos: 'Pérez García',
  dni: '74859612',
  correo: 'jperez@ugel-lampa.gob.pe',
  celular: '987654321',
  condicion: 'Designado',
  escala: 'V',
  institucionId: 'ie-001',
  nivelEducativo: 'Primaria',
  especialidad: 'Educación Primaria',
  cargaHoraria: 30,
};

const errorDe = (data: Record<string, unknown>, campo: string): string | undefined => {
  const res = directorSchema.safeParse(data);
  if (res.success) return undefined;
  return res.error.issues.find((i) => i.path[0] === campo)?.message;
};

describe('directorSchema', () => {
  it('acepta un formulario completo y válido', () => {
    expect(directorSchema.safeParse(baseValido).success).toBe(true);
  });

  describe('DNI', () => {
    it('rechaza DNI con menos de 8 dígitos', () => {
      expect(errorDe({ ...baseValido, dni: '1234567' }, 'dni')).toBeDefined();
    });

    it('rechaza DNI con más de 8 dígitos', () => {
      expect(errorDe({ ...baseValido, dni: '123456789' }, 'dni')).toBeDefined();
    });

    it('rechaza DNI con letras', () => {
      expect(errorDe({ ...baseValido, dni: '1234567a' }, 'dni')).toBeDefined();
    });

    it('acepta exactamente 8 dígitos', () => {
      expect(errorDe({ ...baseValido, dni: '00112233' }, 'dni')).toBeUndefined();
    });
  });

  describe('celular', () => {
    it('rechaza celular que no empieza en 9', () => {
      expect(errorDe({ ...baseValido, celular: '187654321' }, 'celular')).toBeDefined();
    });

    it('rechaza celular con menos de 9 dígitos', () => {
      expect(errorDe({ ...baseValido, celular: '98765432' }, 'celular')).toBeDefined();
    });

    it('acepta celular de 9 dígitos que empieza en 9', () => {
      expect(errorDe({ ...baseValido, celular: '912345678' }, 'celular')).toBeUndefined();
    });
  });

  describe('correo', () => {
    it('rechaza un correo con formato inválido', () => {
      expect(errorDe({ ...baseValido, correo: 'no-es-correo' }, 'correo')).toBeDefined();
    });

    it('acepta un correo válido', () => {
      expect(errorDe({ ...baseValido, correo: 'a@b.com' }, 'correo')).toBeUndefined();
    });
  });

  describe('carga horaria', () => {
    it('rechaza carga horaria mayor a 40', () => {
      expect(errorDe({ ...baseValido, cargaHoraria: 41 }, 'cargaHoraria')).toBeDefined();
    });

    it('rechaza carga horaria menor a 1', () => {
      expect(errorDe({ ...baseValido, cargaHoraria: 0 }, 'cargaHoraria')).toBeDefined();
    });
  });
});
