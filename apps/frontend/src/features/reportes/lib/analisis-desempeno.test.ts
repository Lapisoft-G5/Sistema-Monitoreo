import { describe, it, expect } from 'vitest';
import {
  normalizarNivelLogro,
  calcularAnalisisPorCriterios,
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

describe('calcularAnalisisPorCriterios', () => {
  it('maneja listas vacías correctamente para docente, eib y directivo', () => {
    const resDoc = calcularAnalisisPorCriterios([], [], [], 'DOCENTE');
    expect(resDoc.totalEvaluaciones).toBe(0);
    expect(resDoc.promedioGeneral).toBe(0);
    expect(resDoc.criterios.length).toBe(3);
    expect(resDoc.criterios[0].nombre).toContain('Involucra activamente');

    const resEib = calcularAnalisisPorCriterios([], [], [], 'DOCENTE_EIB');
    expect(resEib.totalEvaluaciones).toBe(0);
    expect(resEib.promedioGeneral).toBe(0);
    expect(resEib.criterios.length).toBe(4);
    expect(resEib.criterios[0].nombre).toContain('Condiciones básicas');

    const resDir = calcularAnalisisPorCriterios([], [], [], 'DIRECTIVO');
    expect(resDir.totalEvaluaciones).toBe(0);
    expect(resDir.promedioGeneral).toBe(0);
    expect(resDir.criterios.length).toBe(3);
    expect(resDir.criterios[0].nombre).toContain('liderazgo pedagógico');
  });

  it('calcula métricas agregadas por criterio / desempeño', () => {
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
      }),
    ];

    const res = calcularAnalisisPorCriterios([], mockVisitas, [], 'DOCENTE');

    expect(res.totalEvaluaciones).toBe(4);
    expect(res.criterios.length).toBe(3);
    expect(res.criterios[0].nombre).toContain('Involucra activamente');
    expect(res.criterios[1].nombre).toContain('Maximiza el tiempo');
    expect(res.criterios[2].nombre).toContain('Fomenta el razonamiento');
    expect(res.criterioMayorDominio).not.toBeNull();
    expect(res.criterioMayorRefuerzo).not.toBeNull();
  });
});
