import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FastActions } from '@shared/ui/FastActions';
import type { Especialista } from '@entities/model-especialistas';
import { ROL_COLORS, ROL_ESPECIALISTA_LABELS, MOCK_ESPECIALISTAS } from '@entities/model-especialistas';
import { useEspecialistasTable } from '../../../especialistas/especialistas-table/lib/useTable'; 
import { TablePagination } from '@shared/ui/table-pagination';
import { ConfirmModal } from '@shared/ui/ConfirmModal';
import { Card } from '@shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { Badge } from '@shared/ui/badge';

import { especialistasApi } from '@shared/api/especialistas.api';

interface JefesTableWidgetProps {
  jefes: Especialista[];
  setJefes: React.Dispatch<React.SetStateAction<Especialista[]>>;
  onEdit?: (jefe: Especialista) => void;
  onView: (jefe: Especialista) => void;
}

export const JefesTableWidget = ({ jefes, setJefes, onEdit, onView }: JefesTableWidgetProps) => {
  const navigate = useNavigate();
  const [deletingDoc, setDeletingDoc] = useState<Especialista | null>(null);

  // ✅ CORREGIDO: Se añade de manera explícita el genérico <Especialista> para quitar el error implícito 'any' en doc.rol
  const { pageItems, filteredTotal, currentPage, totalPages, from, to, setPage } =
  useEspecialistasTable(jefes);

  const confirmDelete = async () => {
    if (!deletingDoc) return;
    try {
      const res = await especialistasApi.delete(deletingDoc.id);
      if (res.ok) {
        const index = MOCK_ESPECIALISTAS.findIndex((d) => d.id === deletingDoc.id);
        if (index !== -1) {
          MOCK_ESPECIALISTAS.splice(index, 1);
        }
        setJefes((prev) => prev.filter((d) => d.id !== deletingDoc.id));
      } else {
        const errMsg = (res.error as { message?: string })?.message || 'Error al eliminar el registro de jefe de área.';
        alert(errMsg);
      }
    } catch (err) {
      console.error('Connection error when deleting jefe de area:', err);
    } finally {
      setDeletingDoc(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in-0 duration-300">
      <Card className="p-0 border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider pl-5">DNI</TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">Apellidos y Nombres</TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">Rol Directivo</TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">Área / Especialidad</TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">Niveles</TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">Estado</TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider text-right pr-5">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold pl-5 text-text">{doc.dni}</TableCell>
                  <TableCell>
                    <div className="font-bold text-text">{doc.apellidos}, {doc.nombres}</div>
                    <div className="text-xs text-text-muted mt-0.5">{doc.correo} | Cel: {doc.celular}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ROL_COLORS[doc.rol] }} />
                      <span className="text-xs font-semibold text-text">{ROL_ESPECIALISTA_LABELS[doc.rol] || 'Jefe de Área'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-text text-xs">{doc.especialidad}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {doc.niveles.map((n) => (
                        <Badge key={n} variant="secondary" className="text-[0.6rem] py-0 px-1.5 uppercase font-bold">{n}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={doc.activo ? 'default' : 'secondary'}
                      className={`text-[0.65rem] py-0 px-2 uppercase font-bold ${
                        doc.activo ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      }`}
                    >
                      {doc.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-5">
                    <FastActions
                      onView={() => onView(doc)}
                      onEdit={() => {
                        if (onEdit) onEdit(doc);
                        else navigate(`/jefes-area/${doc.id}/editar`);
                      }}
                      onDelete={() => setDeletingDoc(doc)}
                      viewTitle="Ver ficha"
                    />
                  </TableCell>
                </TableRow>
              ))}
              {pageItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-text-muted py-12">
                    No se encontraron jefes de área con los filtros seleccionados.
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
          itemName="jefes de área"
        />
      </Card>

      {deletingDoc && (
        <ConfirmModal
          danger
          title="¿Eliminar Registro de Jefe de Área?"
          message={`Esta acción eliminará de forma permanente el registro de ${deletingDoc.apellidos}, ${deletingDoc.nombres}.`}
          confirmLabel="Eliminar Registro"
          cancelLabel="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => setDeletingDoc(null)}
        />
      )}
    </div>
  );
};