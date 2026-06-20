import { useQuery } from '@tanstack/react-query';
import { reportesApi } from '@shared/api/reportes.api';

export const useFichasCompletadas = (filters?: {
  anioAcademico?: number;
  institucionId?: string;
  tipoMonitoreo?: 'DOCENTE' | 'DIRECTIVO';
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: ['reportes', 'fichas-completadas', filters],
    queryFn: () => reportesApi.fichasCompletadas(filters),
    staleTime: 60_000,
  });

export const useResumenIE = (anio: number) =>
  useQuery({
    queryKey: ['reportes', 'resumen-ie', anio],
    queryFn: () => reportesApi.resumenIE(anio),
    enabled: !!anio,
    staleTime: 60_000,
  });
