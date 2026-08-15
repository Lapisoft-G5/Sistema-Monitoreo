import { describe, it, expect } from 'vitest';
import {
  normalizarNivelLogro,
  calcularAnalisisDesempeno,
} from './analisis-desempeno';
import type { BackendReportVisit } from '@/widgets/reportes';

describe('normalizarNivelLogro', () => {
  it('normaliza strings con nombres estándar y romanos', () => {
    expect(normalizarNivelLogro('NIVEL_I')).toBe('I');
    expect(normalizarNivelLogro('INICIO')).toBe('I');
    expect(normalizarNivelLogro('NIVEL_II')).toBe('II');
    expect(normalizarNivelLogro('EN_PROCESO')).toBe('II');
    expect(normalizarNivelLogro('NIVEL_III')).toBe('III');
    expect(normalizarNivelLogro('LOGRO_ESPERADO')).toBe('III');
    expect(normalizarNivelLogro('SATISFACTORIO')).toBe('III');
    expect(normalizarNivelLogro('NIVEL_IV')).toBe('IV');
    expect(normalizarNivelLogro('LOGRO_DESTACADO')).toBe('IV');
    expect(normalizarNivelLogro('DESTACADO')).toBe('IV');
  });

  it('infiere nivel a partir del promedio si no hay string', () => {
    expect(normalizarNivelLogro(undefined, 1.5)).toBe('I');
    expect(normalizarNivelLogro(undefined, 2.5)).toBe('II');
    expect(normalizarNivelLogro(undefined, 3.2)).toBe('III');
    expect(normalizarNivelLogro(undefined, 3.8)).toBe('IV');
  });
});

const crearVisita = (overrides: Partial<BackendReportVisit>): BackendReportVisit => ({
  id: 'v-default',
  tipo: 'DOCENTE',
  docenteDirectivo: 'Docente Test',
  institucion: 'IE 100',
  institucionId: 'ie-100',
  especialista: 'Esp 1',
  especialistaInitials: 'E1',
  monitorId: 'm-1',
  nroVisita: '1',
  fechaHora: '2026-08-10T10:00:00Z',
  nivel: 'Primaria',
  modalidad: 'EBR',
  estado: 'COMPLETADO',
  anioAcademico: 2026,
  ...overrides,
});

describe('calcularAnalisisDesempeno', () => {
  it('maneja listas vacías correctamente', () => {
    const res = calcularAnalisisDesempeno([]);
    expect(res.totalEvaluaciones).toBe(0);
    expect(res.totalDocentes).toBe(0);
    expect(res.promedioGeneral).toBe(0);
    expect(res.tasaSatisfactoria).toBe(0);
    expect(res.tasaRefuerzo).toBe(0);
    expect(res.docentesRefuerzo).toEqual([]);
  });

  it('calcula métricas agregadas y clasifica docentes para refuerzo', () => {
    const mockVisitas: BackendReportVisit[] = [
      crearVisita({
        id: 'v-1',
        tipo: 'DOCENTE',
        docenteDirectivo: 'Juan Perez',
        institucion: 'IE 100',
        especialista: 'Esp 1',
        fechaHora: '2026-08-10T10:00:00Z',
        nivelLogro: 'NIVEL_I',
        promedio: 1.8,
        puntajeTotal: 7,
        nivel: 'Primaria',
      }),
      crearVisita({
        id: 'v-2',
        tipo: 'DOCENTE',
        docenteDirectivo: 'Maria Gomez',
        institucion: 'IE 200',
        especialista: 'Esp 1',
        fechaHora: '2026-08-11T10:00:00Z',
        nivelLogro: 'NIVEL_II',
        promedio: 2.6,
        puntajeTotal: 10,
        nivel: 'Inicial',
      }),
      crearVisita({
        id: 'v-3',
        tipo: 'DOCENTE',
        docenteDirectivo: 'Carlos Ramos',
        institucion: 'IE 100',
        especialista: 'Esp 2',
        fechaHora: '2026-08-12T10:00:00Z',
        nivelLogro: 'NIVEL_III',
        promedio: 3.4,
        puntajeTotal: 14,
        nivel: 'Secundaria',
      }),
      crearVisita({
        id: 'v-4',
        tipo: 'DOCENTE',
        docenteDirectivo: 'Ana Lopez',
        institucion: 'IE 300',
        especialista: 'Esp 2',
        fechaHora: '2026-08-13T10:00:00Z',
        nivelLogro: 'NIVEL_IV',
        promedio: 3.9,
        puntajeTotal: 16,
        nivel: 'Secundaria',
      }),
      crearVisita({
        id: 'v-5',
        tipo: 'DIRECTIVO', // debe ignorar directivos en análisis docente
        docenteDirectivo: 'Director IE 100',
        institucion: 'IE 100',
        especialista: 'Esp 1',
        fechaHora: '2026-08-13T10:00:00Z',
        nivelLogro: 'NIVEL_III',
        promedio: 3.5,
        puntajeTotal: 14,
        nivel: 'Primaria',
      }),
    ];

    const res = calcularAnalisisDesempeno(mockVisitas);

    expect(res.totalEvaluaciones).toBe(4);
    expect(res.totalDocentes).toBe(4);
    expect(res.distribucionNiveles.I.conteo).toBe(1);
    expect(res.distribucionNiveles.II.conteo).toBe(1);
    expect(res.distribucionNiveles.III.conteo).toBe(1);
    expect(res.distribucionNiveles.IV.conteo).toBe(1);

    expect(res.tasaSatisfactoria).toBe(50); // (1+1)/4 = 50%
    expect(res.tasaRefuerzo).toBe(50); // (1+1)/4 = 50%

    expect(res.docentesRefuerzo.length).toBe(2);
    expect(res.docentesRefuerzo[0].docenteNombre).toBe('Juan Perez'); // menor promedio primero
    expect(res.docentesRefuerzo[1].docenteNombre).toBe('Maria Gomez');

    expect(res.porNivelEducativo.length).toBe(3);
  });
});
