import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

interface TablePaginationProps {
  from: number;
  to: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemName?: string; // Ej: "instituciones", "docentes"
}

// Función auxiliar movida aquí adentro
const getPageNumbers = (total: number, current: number) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('ellipsis');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('ellipsis');
  pages.push(total);
  return pages;
};

export const TablePagination = ({
  from,
  to,
  totalItems,
  currentPage,
  totalPages,
  onPageChange,
  itemName = 'registros',
}: TablePaginationProps) => {
  return (
    <div className="flex justify-between items-center flex-wrap gap-4 p-5 border-t border-border bg-muted/20">
      <span className="text-xs font-medium text-text-muted">
        Mostrando {from}-{to} de {totalItems} {itemName}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 w-8 rounded-lg cursor-pointer hover:bg-muted"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2} />
        </Button>
        {getPageNumbers(totalPages, currentPage).map((p, idx) =>
          p === 'ellipsis' ? (
            <span key={`e${idx}`} className="px-2 text-xs text-text-muted font-medium select-none">
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === currentPage ? 'default' : 'outline'}
              size="icon"
              onClick={() => onPageChange(p as number)}
              className="h-8 w-8 rounded-lg cursor-pointer font-bold text-xs"
            >
              {p}
            </Button>
          ),
        )}
        <Button
          variant="outline"
          size="icon"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 w-8 rounded-lg cursor-pointer hover:bg-muted"
        >
          <ChevronRight className="w-4 h-4" strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
};
