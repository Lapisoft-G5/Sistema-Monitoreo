import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UseEntityTableOptions<T> {
  data: T[];
  filterFn?: (item: T, params: URLSearchParams) => boolean;
  defaultPageSize?: number;
}

export interface UseEntityTableReturn<T> {
  pageItems: T[];
  filteredTotal: number;
  currentPage: number;
  totalPages: number;
  from: number;
  to: number;
  setPage: (page: number) => void;
}

export function useEntityTable<T>({
  data,
  filterFn,
  defaultPageSize = 10,
}: UseEntityTableOptions<T>): UseEntityTableReturn<T> {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const filtered = useMemo(() => {
    if (!filterFn) return data;
    return data.filter((item) => filterFn(item, searchParams));
  }, [data, filterFn, searchParams]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / defaultPageSize));
  const currentPage = Math.min(pageParam, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * defaultPageSize,
    currentPage * defaultPageSize,
  );

  const from = filtered.length === 0 ? 0 : (currentPage - 1) * defaultPageSize + 1;
  const to = Math.min(currentPage * defaultPageSize, filtered.length);

  const setPage = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  return { pageItems, filteredTotal: filtered.length, currentPage, totalPages, from, to, setPage };
}
