import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Especialista, NivelInstitucion } from '@entities/model-especialistas';

const PAGE_SIZE = 10;

export const useEspecialistasTable = (especialistas: Especialista[]) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || '';
  const nivelFilter = searchParams.get('nivel') || '';
  const estadoFilter = searchParams.get('estado') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const filtered = useMemo(() => {
    return especialistas.filter((e) => {
      const matchSearch =
        !searchQuery ||
        e.nombres.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.apellidos.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.dni.includes(searchQuery) ||
        (e.especialidad || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchNivel = !nivelFilter || e.niveles.includes(nivelFilter as NivelInstitucion);
      
      const matchEstado =
        !estadoFilter ||
        (estadoFilter === 'Activo' ? e.activo : !e.activo);

      return matchSearch && matchNivel && matchEstado;
    });
  }, [especialistas, searchQuery, nivelFilter, estadoFilter]);

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
