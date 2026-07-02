import type { ReactNode } from 'react';
import { Card } from './card';
import { Table, TableBody, TableCell, TableHeader, TableRow } from './table';
import { TablePagination } from './table-pagination';
import type { UseEntityTableReturn } from '@shared/hooks/useEntityTable';

interface EntityTableProps {
  header: ReactNode;
  children: ReactNode;
  pagination: UseEntityTableReturn<unknown>;
  emptyMessage: string;
  emptyColSpan?: number;
  itemName?: string;
}

export function EntityTable({
  header,
  children,
  pagination,
  emptyMessage,
  emptyColSpan = 8,
  itemName = 'registros',
}: EntityTableProps) {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in-0 duration-300">
      <Card className="p-0 border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>{header}</TableRow>
            </TableHeader>
            <TableBody>
              {children}
              {pagination.pageItems.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={emptyColSpan}
                    className="text-center text-text-muted py-12"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <TablePagination
          from={pagination.from}
          to={pagination.to}
          totalItems={pagination.filteredTotal}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.setPage}
          itemName={itemName}
        />
      </Card>
    </div>
  );
}
