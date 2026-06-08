import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Docente } from '@entities/model-docentes';

const PAGE_SIZE = 10;

export const useDocentesTable = (docentes: Docente[], targetCargo: 'Director' | 'Coordinador Pedagógico' | 'Docente de Aula' = 'Director') => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || '';
  const condicionFilter = searchParams.get('condicion') || '';
  const nivelFilter = searchParams.get('nivelEducativo') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const filtered = useMemo(() => {
    return docentes.filter((d) => {
      // 🚀 Filtrado estricto por el cargo objetivo
      if (d.cargo !== targetCargo) return false;

      const matchSearch =
        !searchQuery ||
        d.nombres.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.apellidos.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.dni.includes(searchQuery);

      const matchCondicion = !condicionFilter || d.condicion === condicionFilter;
      const matchNivel = !nivelFilter || d.nivelEducativo === nivelFilter;

      return matchSearch && matchCondicion && matchNivel;
    });
  }, [docentes, searchQuery, condicionFilter, nivelFilter]);

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
