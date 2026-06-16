import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { JefeArea } from '@entities/model-jefes-area';

const PAGE_SIZE = 10;

export const useJefesTable = (jefes: JefeArea[]) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || '';
  const nivelFilter = searchParams.get('nivel') || '';
  const estadoFilter = searchParams.get('estado') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const filtered = useMemo(() => {
    return jefes.filter((j) => {
      const matchSearch =
        !searchQuery ||
        j.nombres.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.apellidos.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.dni.includes(searchQuery);

      const matchNivel = !nivelFilter || j.nivelEducativo === nivelFilter;

      const matchEstado = !estadoFilter || (estadoFilter === 'Activo' ? j.activo : !j.activo);

      return matchSearch && matchNivel && matchEstado;
    });
  }, [jefes, searchQuery, nivelFilter, estadoFilter]);

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
