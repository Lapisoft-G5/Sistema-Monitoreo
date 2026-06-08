import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Eye, Edit, Trash } from 'lucide-react';
import { type Institucion, MOCK_INSTITUCIONES } from '@entities/model-instituciones';
import { NivelBadge, EstadoBadge, DirectorCell } from '@entities/model-instituciones/ui';
import { useInstitutionsTable } from '../lib/useTable';
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

interface InstitutionsTableWidgetProps {
  instituciones: Institucion[];
  setInstituciones: React.Dispatch<React.SetStateAction<Institucion[]>>;
  onEdit: (inst: Institucion) => void;
  onView: (inst: Institucion) => void;
}

export const InstitutionsTableWidget = ({
  instituciones,
  setInstituciones,
  onEdit,
  onView,
}: InstitutionsTableWidgetProps) => {
  const navigate = useNavigate();
  const [deletingInst, setDeletingInst] = useState<Institucion | null>(null);

  // 🚀 Invocamos el cerebro matemático
  const { pageItems, filteredTotal, currentPage, totalPages, from, to, setPage } =
    useInstitutionsTable(instituciones);

  const confirmDelete = () => {
    if (!deletingInst) return;
    const index = MOCK_INSTITUCIONES.findIndex((i) => i.id === deletingInst.id);
    if (index !== -1) {
      MOCK_INSTITUCIONES.splice(index, 1);
    }
    setInstituciones((prev) => prev.filter((i) => i.id !== deletingInst.id));
    setDeletingInst(null);
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in-0 duration-300">
      <Card className="p-0 border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider pl-5">
                  Código Modular
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">
                  Nombre de la I.E.
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">
                  Nivel
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">
                  Distrito
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">
                  Director
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
              {pageItems.map((inst) => (
                <TableRow key={inst.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold pl-5 text-text">
                    {inst.codigoModular}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-text">{inst.nombre}</div>
                    <div className="text-xs text-text-muted mt-0.5">{inst.direccion}</div>
                  </TableCell>

                  <TableCell>
                    <NivelBadge nivel={inst.nivel} />
                  </TableCell>
                  <TableCell className="text-text font-medium">{inst.distrito}</TableCell>
                  <TableCell>
                    <DirectorCell director={inst.director} />
                  </TableCell>
                  <TableCell>
                    <EstadoBadge estado={inst.estado} />
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
                          onClick={() => {
                            onView(inst);
                            navigate(`/instituciones/${inst.id}`);
                          }}
                          className="cursor-pointer flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4 text-text-muted" />
                          <span>Ver detalle</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            onEdit(inst);
                            navigate(`/instituciones/${inst.id}/editar`);
                          }}
                          className="cursor-pointer flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4 text-text-muted" />
                          <span>Editar</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => setDeletingInst(inst)}
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
                    No se encontraron instituciones con los filtros seleccionados.
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
          itemName="instituciones"
        />
      </Card>

      {deletingInst && (
        <ConfirmModal
          danger
          title="¿Eliminar Institución?"
          message="Esta acción es irreversible. Asegúrese de que no existen dependencias activas."
          confirmLabel="Eliminar Registro"
          cancelLabel="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => setDeletingInst(null)}
        />
      )}
    </div>
  );
};
