import { BaremoCalculatorService } from './baremo-calculator.service.js';

describe('BaremoCalculatorService', () => {
  let service: BaremoCalculatorService;

  beforeEach(() => {
    service = new BaremoCalculatorService();
  });

  describe('nivelARomano', () => {
    it('convierte 1 a I', () => {
      expect(service.nivelARomano(1)).toBe('I');
    });
    it('convierte 2 a II', () => {
      expect(service.nivelARomano(2)).toBe('II');
    });
    it('convierte 3 a III', () => {
      expect(service.nivelARomano(3)).toBe('III');
    });
    it('convierte 4 a IV', () => {
      expect(service.nivelARomano(4)).toBe('IV');
    });
    it('lanza error para nivel invalido', () => {
      expect(() => service.nivelARomano(0)).toThrow();
      expect(() => service.nivelARomano(5)).toThrow();
    });
  });

  describe('calcularPromedio', () => {
    it('retorna 0 para lista vacia', () => {
      expect(service.calcularPromedio([])).toBe(0);
    });
    it('calcula promedio simple', () => {
      expect(service.calcularPromedio([2, 4])).toBe(3);
    });
    it('calcula promedio redondeado a 2 decimales', () => {
      expect(service.calcularPromedio([1, 2, 3, 4])).toBe(2.5);
    });
  });

  describe('calcularNivelLogro (baremo EDU-0009)', () => {
    it('1.0 -> INICIO', () => {
      expect(service.calcularNivelLogro(1.0)).toBe('INICIO');
    });
    it('1.4 -> INICIO (limite superior)', () => {
      expect(service.calcularNivelLogro(1.4)).toBe('INICIO');
    });
    it('1.5 -> throw (gap intencional)', () => {
      expect(() => service.calcularNivelLogro(1.5)).toThrow();
    });
    it('1.6 -> EN_PROCESO (limite inferior)', () => {
      expect(service.calcularNivelLogro(1.6)).toBe('EN_PROCESO');
    });
    it('2.0 -> EN_PROCESO', () => {
      expect(service.calcularNivelLogro(2.0)).toBe('EN_PROCESO');
    });
    it('2.4 -> EN_PROCESO (limite superior)', () => {
      expect(service.calcularNivelLogro(2.4)).toBe('EN_PROCESO');
    });
    it('2.5 -> throw (gap)', () => {
      expect(() => service.calcularNivelLogro(2.5)).toThrow();
    });
    it('2.6 -> LOGRO_ESPERADO', () => {
      expect(service.calcularNivelLogro(2.6)).toBe('LOGRO_ESPERADO');
    });
    it('3.0 -> LOGRO_ESPERADO', () => {
      expect(service.calcularNivelLogro(3.0)).toBe('LOGRO_ESPERADO');
    });
    it('3.4 -> LOGRO_ESPERADO (limite superior)', () => {
      expect(service.calcularNivelLogro(3.4)).toBe('LOGRO_ESPERADO');
    });
    it('3.5 -> throw (gap)', () => {
      expect(() => service.calcularNivelLogro(3.5)).toThrow();
    });
    it('3.6 -> LOGRO_DESTACADO', () => {
      expect(service.calcularNivelLogro(3.6)).toBe('LOGRO_DESTACADO');
    });
    it('4.0 -> LOGRO_DESTACADO (limite superior)', () => {
      expect(service.calcularNivelLogro(4.0)).toBe('LOGRO_DESTACADO');
    });
    it('fuera de rango -> throw', () => {
      expect(() => service.calcularNivelLogro(0.5)).toThrow();
      expect(() => service.calcularNivelLogro(4.5)).toThrow();
    });
  });

  describe('calcularResultadoCompleto', () => {
    it('todos en nivel I -> INICIO con puntaje 4', () => {
      const r = service.calcularResultadoCompleto([1, 1, 1, 1]);
      expect(r.puntajeTotal).toBe(4);
      expect(r.promedio).toBe(1);
      expect(r.nivelLogro).toBe('INICIO');
    });
    it('todos en nivel IV -> LOGRO_DESTACADO con puntaje 16', () => {
      const r = service.calcularResultadoCompleto([4, 4, 4, 4]);
      expect(r.puntajeTotal).toBe(16);
      expect(r.promedio).toBe(4);
      expect(r.nivelLogro).toBe('LOGRO_DESTACADO');
    });
    it('mezcla 2 III + 2 IV -> LOGRO_DESTACADO (promedio 3.5 -> throw)', () => {
      expect(() => service.calcularResultadoCompleto([3, 3, 4, 4])).toThrow();
    });
    it('mezcla 3 III + 1 II -> LOGRO_ESPERADO (promedio 2.75)', () => {
      const r = service.calcularResultadoCompleto([3, 3, 3, 2]);
      expect(r.promedio).toBe(2.75);
      expect(r.nivelLogro).toBe('LOGRO_ESPERADO');
    });
  });
});