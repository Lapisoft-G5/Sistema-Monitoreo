import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Docente } from '@entities/model-docentes';

const PAGE_SIZE = 10;

export const useDocentesTable = (
  docentes: Docente[],
  targetCargo: 'Director' | 'Coordinador Pedagógico' | 'Jefe de Taller' | 'Docente de Aula' = 'Director',
) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || '';
  const condicionFilter = searchParams.get('condicion') || '';
  const seccionFilter = searchParams.get('seccion') || '';
  const nivelFilter = searchParams.get('nivelEducativo') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const filtered = useMemo(() => {
    return docentes.filter((d) => {
      // 🚀 Filtrado por el cargo objetivo (activo o finalizado en cargosList)
      let hasCargo: boolean;
      if (targetCargo === 'Docente de Aula') {
        const hasActiveMonitor = d.cargosList?.some(
          (c) => c.fechaFin === null && ['Director', 'Coordinador Pedagógico', 'Jefe de Taller'].includes(c.nombre)
        );
        if (hasActiveMonitor !== undefined) {
          hasCargo = !hasActiveMonitor;
        } else {
          hasCargo = d.cargo === 'Docente de Aula';
        }
      } else {
        hasCargo = d.cargosList?.some((c) => c.nombre === targetCargo) ?? (d.cargo === targetCargo);
      }
      if (!hasCargo) return false;

      const matchSearch =
        !searchQuery ||
        d.nombres.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.apellidos.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.dni.includes(searchQuery);

      const matchCondicion = !condicionFilter || d.condicion === condicionFilter;
      const matchSeccion =
        !seccionFilter ||
        (d.secciones || []).some((s) => `${s.grado} ${s.seccion}` === seccionFilter);
      const matchNivel =
        !nivelFilter || d.nivelEducativo?.toUpperCase() === nivelFilter.toUpperCase();

      return matchSearch && matchCondicion && matchSeccion && matchNivel;
    });
  }, [docentes, searchQuery, condicionFilter, seccionFilter, nivelFilter, targetCargo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(pageParam, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const from = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const setPage = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  return {
    pageItems,
    filteredTotal: filtered.length,
    currentPage,
    totalPages,
    from,
    to,
    setPage,
  };
};
