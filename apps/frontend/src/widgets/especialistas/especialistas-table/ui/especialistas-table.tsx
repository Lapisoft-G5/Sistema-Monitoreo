import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FastActions } from '@shared/ui/FastActions';
import type { Especialista } from '@entities/model-especialistas';
import { CARGO_COLORS, MOCK_ESPECIALISTAS } from '@entities/model-especialistas';
import { useEspecialistasTable } from '../lib/useTable';
import { TablePagination } from '@shared/ui/table-pagination';
import { ConfirmModal } from '@shared/ui/ConfirmModal';
import { Card } from '@shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { Badge } from '@shared/ui/badge';

import { especialistasApi } from '@shared/api/especialistas.api';

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
  const [restoringDoc, setRestoringDoc] = useState<Especialista | null>(null);

  const { pageItems, filteredTotal, currentPage, totalPages, from, to, setPage } =
    useEspecialistasTable(especialistas);

  const confirmDelete = async () => {
    if (!deletingDoc) return;
    try {
      const res = await especialistasApi.deactivate(deletingDoc.id);
      if (res.ok) {
        const index = MOCK_ESPECIALISTAS.findIndex((d) => d.id === deletingDoc.id);
        if (index !== -1) {
          MOCK_ESPECIALISTAS[index].activo = false;
        }
        setEspecialistas((prev) =>
          prev.map((e) => (e.id === deletingDoc.id ? { ...e, activo: false } : e)),
        );
      } else {
        const errMsg =
          (res.error as { message?: string })?.message ||
          'Error al desactivar el registro de especialista.';
        alert(errMsg);
      }
    } catch (err) {
      console.error('Connection error when deactivating specialist:', err);
    } finally {
      setDeletingDoc(null);
    }
  };

  const confirmRestore = async () => {
    if (!restoringDoc) return;
    try {
      const res = await especialistasApi.activate(restoringDoc.id);
      if (res.ok) {
        const index = MOCK_ESPECIALISTAS.findIndex((d) => d.id === restoringDoc.id);
        if (index !== -1) {
          MOCK_ESPECIALISTAS[index].activo = true;
        }
        setEspecialistas((prev) =>
          prev.map((e) => (e.id === restoringDoc.id ? { ...e, activo: true } : e)),
        );
      } else {
        const errMsg =
          (res.error as { message?: string })?.message ||
          'Error al reactivar el registro de especialista.';
        alert(errMsg);
      }
    } catch (err) {
      console.error('Connection error when activating specialist:', err);
    } finally {
      setRestoringDoc(null);
    }
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
                        style={{
                          backgroundColor: CARGO_COLORS[doc.cargo || 'Especialista'] || '#3b82f6',
                        }}
                      />
                      <span className="text-xs font-semibold text-text">
                        {doc.cargo || 'Especialista'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-text text-xs">
                    {doc.especialidad}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {doc.nivelEducativo && (
                        <Badge
                          variant="secondary"
                          className="text-[0.6rem] py-0 px-1.5 uppercase font-bold"
                        >
                          {doc.nivelEducativo}
                          {doc.modalidad ? ` (${doc.modalidad})` : ''}
                        </Badge>
                      )}
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
                    <FastActions
                      onView={() => onView(doc)}
                      onEdit={
                        doc.activo
                          ? () => {
                              if (onEdit) onEdit(doc);
                              else navigate(`/especialistas/${doc.id}/editar`);
                            }
                          : undefined
                      }
                      onDelete={doc.activo ? () => setDeletingDoc(doc) : undefined}
                      onRestore={!doc.activo ? () => setRestoringDoc(doc) : undefined}
                      viewTitle="Ver ficha"
                      restoreTitle="Reactivar especialista"
                      deleteTitle="Desactivar especialista"
                    />
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
          title="¿Desactivar Especialista?"
          message={`Esta acción cambiará el estado de ${deletingDoc.apellidos}, ${deletingDoc.nombres} a Inactivo.`}
          confirmLabel="Desactivar"
          cancelLabel="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => setDeletingDoc(null)}
        />
      )}

      {restoringDoc && (
        <ConfirmModal
          title="¿Reactivar Especialista?"
          message={`Esta acción reactivará el registro de ${restoringDoc.apellidos}, ${restoringDoc.nombres} en el sistema.`}
          confirmLabel="Reactivar"
          cancelLabel="Cancelar"
          onConfirm={confirmRestore}
          onCancel={() => setRestoringDoc(null)}
        />
      )}
    </div>
  );
};
