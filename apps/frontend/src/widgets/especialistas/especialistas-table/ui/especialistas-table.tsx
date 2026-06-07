import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Eye, Edit, Trash } from 'lucide-react';
import type { Especialista } from '@entities/model-especialistas';
import { ROL_COLORS, ROL_ESPECIALISTA_LABELS, MOCK_ESPECIALISTAS } from '@entities/model-especialistas';
import { useEspecialistasTable } from '../lib/useTable';
import { TablePagination } from '@shared/ui/table-pagination';
import { ConfirmModal } from '@shared/ui/ConfirmModal';
import { Button } from '@shared/ui/button';
import { Card } from '@shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@shared/ui/dropdown-menu';
import { Badge } from '@shared/ui/badge';

interface EspecialistasTableWidgetProps {
  especialistas: Especialista[];
  setEspecialistas: React.Dispatch<React.SetStateAction<Especialista[]>>;
  onEdit?: (especialista: Especialista) => void;
  onView: (especialista: Especialista) => void;
}

export const EspecialistasTableWidget = ({
  especialistas,
  setEspecialistas,
  onEdit,
  onView,
}: EspecialistasTableWidgetProps) => {
  const navigate = useNavigate();
  const [deletingDoc, setDeletingDoc] = useState<Especialista | null>(null);

  const { pageItems, filteredTotal, currentPage, totalPages, from, to, setPage } =
    useEspecialistasTable(especialistas);

  const confirmDelete = () => {
    if (!deletingDoc) return;
    const index = MOCK_ESPECIALISTAS.findIndex((d) => d.id === deletingDoc.id);
    if (index !== -1) {
      MOCK_ESPECIALISTAS.splice(index, 1);
    }
    setEspecialistas((prev) => prev.filter((d) => d.id !== deletingDoc.id));
    setDeletingDoc(null);
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in-0 duration-300">
      <Card className="p-0 border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider pl-5">
                  DNI
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">
                  Apellidos y Nombres
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">
                  Rol de Especialista
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">
                  Especialidad
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">
                  Niveles Asignados
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">
                  Estado
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider text-right pr-5">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold pl-5 text-text">{doc.dni}</TableCell>
                  <TableCell>
                    <div className="font-bold text-text">
                      {doc.apellidos}, {doc.nombres}
                    </div>
                    <div className="text-xs text-text-muted mt-0.5">
                      {doc.correo} | Cel: {doc.celular}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: ROL_COLORS[doc.rol] }}
                      />
                      <span className="text-xs font-semibold text-text">
                        {ROL_ESPECIALISTA_LABELS[doc.rol]}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-text text-xs">
                    {doc.especialidad}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {doc.niveles.map((n) => (
                        <Badge
                          key={n}
                          variant="secondary"
                          className="text-[0.6rem] py-0 px-1.5 uppercase font-bold"
                        >
                          {n}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={doc.activo ? 'default' : 'secondary'}
                      className={`text-[0.65rem] py-0 px-2 uppercase font-bold ${
                        doc.activo
                          ? 'bg-green-500/10 text-green-500 border-green-500/20'
                          : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      }`}
                    >
                      {doc.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer rounded-lg text-text-muted hover:text-text hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[140px] z-50">
                        <DropdownMenuItem
                          onClick={() => onView(doc)}
                          className="cursor-pointer flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4 text-text-muted" />
                          <span>Ver ficha</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            onEdit?.(doc);
                            navigate(`/especialistas/${doc.id}/editar`);
                          }}
                          className="cursor-pointer flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4 text-text-muted" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeletingDoc(doc)}
                          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2"
                        >
                          <Trash className="h-4 w-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {pageItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-text-muted py-12">
                    No se encontraron especialistas con los filtros seleccionados.
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
          itemName="especialistas"
        />
      </Card>

      {deletingDoc && (
        <ConfirmModal
          danger
          title="¿Eliminar Registro de Especialista?"
          message={`Esta acción es irreversible y eliminará el registro de ${deletingDoc.apellidos}, ${deletingDoc.nombres} del sistema.`}
          confirmLabel="Eliminar Registro"
          cancelLabel="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => setDeletingDoc(null)}
        />
      )}
    </div>
  );
};
