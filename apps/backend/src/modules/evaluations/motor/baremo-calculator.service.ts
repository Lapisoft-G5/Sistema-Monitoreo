import type { NivelLogro } from '@sistema-monitoreo/shared-contracts';

export class BaremoCalculatorService {
  /**
   * Convierte nivel numerico (1-4) a romano.
   */
  static nivelARomano(nivel: number): 'I' | 'II' | 'III' | 'IV' {
    switch (nivel) {
      case 1:
        return 'I';
      case 2:
        return 'II';
      case 3:
        return 'III';
      case 4:
        return 'IV';
      default:
        throw new Error(`Nivel invalido: ${nivel}. Debe estar entre 1 y 4.`);
    }
  }

  /**
   * Calcula el promedio a partir de una lista de niveles (1-4).
   */
  static calcularPromedio(niveles: number[]): number {
    if (niveles.length === 0) return 1.0;
    const suma = niveles.reduce((acc, n) => acc + n, 0);
    return Number((suma / niveles.length).toFixed(2));
  }

  /**
   * Calcula el nivel de logro segun el baremo institucional (EDU-0009).
   *   Inicio:           1.0 - 1.4
   *   En Proceso:       1.6 - 2.4
   *   Logro Esperado:   2.6 - 3.4
   *   Logro Destacado:  3.6 - 4.0
   *
   * Los gaps 1.5, 2.5, 3.5 son intencionales segun especificacion.
   */
  static calcularNivelLogro(promedio: number): NivelLogro {
    if (promedio < 1.0 || promedio > 4.0) {
      throw new Error(`Promedio fuera de rango: ${promedio}. Debe estar entre 1.0 y 4.0.`);
    }
    if (promedio >= 1.0 && promedio <= 1.4) return 'INICIO';
    if (promedio >= 1.6 && promedio <= 2.4) return 'EN_PROCESO';
    if (promedio >= 2.6 && promedio <= 3.4) return 'LOGRO_ESPERADO';
    if (promedio >= 3.6 && promedio <= 4.0) return 'LOGRO_DESTACADO';
    throw new Error(`Promedio en gap invalido: ${promedio}. Gaps 1.5, 2.5, 3.5 no son validos.`);
  }

  /**
   * Calcula el resultado completo del baremo: puntaje, promedio, nivel.
   */
  static calcularResultadoCompleto(niveles: number[]): {
    puntajeTotal: number;
    promedio: number;
    nivelLogro: NivelLogro;
  } {
    if (niveles.length === 0) {
      return { puntajeTotal: 0, promedio: 1, nivelLogro: 'INICIO' };
    }
    const puntajeTotal = niveles.reduce((acc, n) => acc + n, 0);
    const promedio = this.calcularPromedio(niveles);
    const nivelLogro = this.calcularNivelLogro(promedio);
    return { puntajeTotal, promedio, nivelLogro };
  }
}
