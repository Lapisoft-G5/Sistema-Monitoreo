import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Institucion } from '@entities/model-instituciones';

const PAGE_SIZE = 10;

export const useInstitutionsTable = (instituciones: Institucion[]) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const nivelFilter = searchParams.get('nivel') || '';
  const distritoFilter = searchParams.get('distrito') || '';
  const estadoFilter = searchParams.get('estado') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const filtered = useMemo(() => {
    return instituciones.filter((i) => {
      return (!nivelFilter || i.nivel === nivelFilter) &&
             (!distritoFilter || i.distrito === distritoFilter) &&
             (!estadoFilter || i.estado === estadoFilter);
    });
  }, [instituciones, nivelFilter, distritoFilter, estadoFilter]);

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
    pageItems, filteredTotal: filtered.length,
    currentPage, totalPages, from, to, setPage
  };
};