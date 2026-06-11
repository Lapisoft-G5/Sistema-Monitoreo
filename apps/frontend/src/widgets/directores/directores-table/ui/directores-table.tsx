import { useState } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { Docente, CondicionDirectiva } from '@entities/model-docentes';
import { CONDICION_DIRECTIVA_COLOR, MOCK_DOCENTES } from '@entities/model-docentes';
// Reutilizamos la lógica de filtros/paginación de docentes (mismo patrón del equipo).
import { useDocentesTable } from '@widgets/docentes/docentes-table/lib/useTable';
import { TablePagination } from '@shared/ui/table-pagination';
import { ConfirmModal } from '@shared/ui/ConfirmModal';
import { Button } from '@shared/ui/button';
import { Card } from '@shared/ui/card';
import { Avatar, AvatarFallback } from '@shared/ui/avatar';
import { Badge } from '@shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';

// Escala magisterial romana → número con cero (V → "05"), como en el mockup.
const ESCALA_NUM: Record<string, string> = {
  I: '01', II: '02', III: '03', IV: '04', V: '05', VI: '06', VII: '07', VIII: '08',
};

// PRIMARIA → Primaria
const nivelLabel = (nivel: string) => nivel.charAt(0) + nivel.slice(1).toLowerCase();

interface DirectoresTableWidgetProps {
  directores: Docente[];
  setDirectores: React.Dispatch<React.SetStateAction<Docente[]>>;
  instituciones: { id: string; nombre: string }[];
  onView: (director: Docente) => void;
  onEdit?: (director: Docente) => void;
}

export const DirectoresTableWidget = ({
  directores,
  setDirectores,
  instituciones,
  onView,
  onEdit,
}: DirectoresTableWidgetProps) => {
  const [deleting, setDeleting] = useState<Docente | null>(null);

  const { pageItems, filteredTotal, currentPage, totalPages, from, to, setPage } =
    useDocentesTable(directores, 'Director');

  const getInstName = (id: string) =>
    instituciones.find((i) => i.id === id)?.nombre ?? 'I.E. No Asignada';

  const confirmDelete = () => {
    if (!deleting) return;
    const idx = MOCK_DOCENTES.findIndex((d) => d.id === deleting.id);
    if (idx !== -1) MOCK_DOCENTES.splice(idx, 1);
    setDirectores((prev) => prev.filter((d) => d.id !== deleting.id));
    setDeleting(null);
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in-0 duration-300">
      <Card className="p-0 border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider pl-5">
                  Nombres y Apellidos
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">DNI</TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">Cargo</TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">Condición</TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">Escala</TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider text-right pr-5">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((dir) => (
                <TableRow key={dir.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {dir.nombres[0]}
                          {dir.apellidos[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-bold text-text text-sm truncate">
                          {dir.apellidos}, {dir.nombres}
                        </div>
                        <div className="text-xs text-text-muted truncate">
                          {getInstName(dir.institucionId)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-text">{dir.dni}</TableCell>
                  <TableCell className="text-xs font-medium text-text">
                    Director de {nivelLabel(dir.nivelEducativo)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="text-[0.65rem] py-0.5 px-2.5 uppercase font-bold border-0 text-white"
                      style={{
                        backgroundColor:
                          CONDICION_DIRECTIVA_COLOR[dir.condicion as CondicionDirectiva] ?? '#6b7280',
                      }}
                    >
                      {dir.condicion}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs font-bold px-2.5">
                      {ESCALA_NUM[dir.escala] ?? dir.escala}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-5">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(dir)}
                        className="h-8 w-8 cursor-pointer rounded-lg text-text-muted hover:text-primary hover:bg-muted"
                        title="Ver ficha"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit?.(dir)}
                        className="h-8 w-8 cursor-pointer rounded-lg text-text-muted hover:text-blue-600 hover:bg-muted"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleting(dir)}
                        className="h-8 w-8 cursor-pointer rounded-lg text-text-muted hover:text-destructive hover:bg-destructive/10"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pageItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-text-muted py-12">
                    No se encontraron directores con los filtros seleccionados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <TablePagination
          from={from}
          to={to}
          totalItems={filteredTotal}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          itemName="directores"
        />
      </Card>

      {deleting && (
        <ConfirmModal
          danger
          title="¿Eliminar Director?"
          message={`Esta acción es irreversible y eliminará el registro de ${deleting.apellidos}, ${deleting.nombres} del padrón de directores.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
};
