import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FastActions } from '@shared/ui/FastActions';
import type { Docente } from '@entities/model-docentes';
import { MOCK_DOCENTES } from '@entities/model-docentes';
import { useDocentesTable } from '../lib/useTable';
import { TablePagination } from '@shared/ui/table-pagination';
import { ConfirmModal } from '@shared/ui/ConfirmModal';
import { Card } from '@shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { Badge } from '@shared/ui/badge';

import { teachersApi } from '@shared/api/teachers.api';

interface DocentesTableWidgetProps {
  docentes: Docente[];
  setDocentes: React.Dispatch<React.SetStateAction<Docente[]>>;
  onEdit?: (docente: Docente) => void;
  onView: (docente: Docente) => void;
  instituciones: { id: string; nombre: string }[];
  targetCargo?: 'Director' | 'Coordinador Pedagógico' | 'Docente de Aula';
  routePrefix?: string;
  itemName?: string;
}

export const DocentesTableWidget = ({
  docentes,
  setDocentes,
  onEdit,
  onView,
  targetCargo = 'Director',
  routePrefix = '/instituciones/docentes',
  itemName = 'directores/docentes',
}: DocentesTableWidgetProps) => {
  const navigate = useNavigate();
  const [deletingDoc, setDeletingDoc] = useState<Docente | null>(null);
  const [restoringDoc, setRestoringDoc] = useState<Docente | null>(null);

  const { pageItems, filteredTotal, currentPage, totalPages, from, to, setPage } =
    useDocentesTable(docentes, targetCargo);

  const confirmDelete = async () => {
    if (!deletingDoc) return;
    try {
      const res = await teachersApi.deactivate(deletingDoc.id);
      if (res.ok) {
        const index = MOCK_DOCENTES.findIndex((d) => d.id === deletingDoc.id);
        if (index !== -1) {
          MOCK_DOCENTES[index].activo = false;
        }
        setDocentes((prev) =>
          prev.map((d) => (d.id === deletingDoc.id ? { ...d, activo: false } : d))
        );
      } else {
        const errMsg = (res.error as { message?: string })?.message || 'Error al dar de baja el docente.';
        alert(errMsg);
      }
    } catch (err) {
      console.error('Connection error when deactivating teacher:', err);
    } finally {
      setDeletingDoc(null);
    }
  };

  const confirmRestore = async () => {
    if (!restoringDoc) return;
    try {
      const res = await teachersApi.activate(restoringDoc.id);
      if (res.ok) {
        const index = MOCK_DOCENTES.findIndex((d) => d.id === restoringDoc.id);
        if (index !== -1) {
          MOCK_DOCENTES[index].activo = true;
        }
        setDocentes((prev) =>
          prev.map((d) => (d.id === restoringDoc.id ? { ...d, activo: true } : d))
        );
      } else {
        const errMsg = (res.error as { message?: string })?.message || 'Error al reactivar el docente.';
        alert(errMsg);
      }
    } catch (err) {
      console.error('Connection error when activating teacher:', err);
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
                  Correo
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">
                  Teléfono
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">
                  Condición / Escala
                </TableHead>
                <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">
                  Grado y Sección a cargo
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
                  </TableCell>
                  <TableCell className="text-text text-sm">{doc.correo}</TableCell>
                  <TableCell className="text-text text-sm">{doc.celular}</TableCell>
                  <TableCell>
                    <div className="text-xs font-medium text-text">{doc.condicion}</div>
                    <div className="text-[0.65rem] text-text-muted mt-0.5">
                      Escala: {doc.escala}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(doc.secciones || []).map((sec) => (
                        <Badge
                          key={sec.id}
                          variant="outline"
                          className="text-[0.7rem] py-0.5 px-2.5 font-bold bg-muted/40 text-text border-border"
                        >
                          {sec.grado}
                        </Badge>
                      ))}
                      {(doc.secciones || []).length === 0 && (
                        <span className="text-xs text-text-muted italic">Sin asignar</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        doc.activo
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }
                    >
                      {doc.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-5">
                    <FastActions
                      onView={() => onView(doc)}
                      onEdit={doc.activo ? () => {
                        onEdit?.(doc);
                        navigate(`${routePrefix}/${doc.id}/editar`);
                      } : undefined}
                      onDelete={doc.activo ? () => setDeletingDoc(doc) : undefined}
                      onRestore={!doc.activo ? () => setRestoringDoc(doc) : undefined}
                      viewTitle="Ver ficha"
                      restoreTitle="Reactivar docente"
                      deleteTitle="Desactivar docente"
                    />
                  </TableCell>
                </TableRow>
              ))}
              {pageItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-text-muted py-12">
                    No se encontraron {itemName} con los filtros seleccionados.
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
          itemName={itemName}
        />
      </Card>

      {deletingDoc && (
        <ConfirmModal
          danger
          title="¿Eliminar Registro de Personal?"
          message={`Esta acción es irreversible y eliminará el registro de ${deletingDoc.apellidos}, ${deletingDoc.nombres} del padrón oficial.`}
          confirmLabel="Eliminar Registro"
          cancelLabel="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => setDeletingDoc(null)}
        />
      )}

      {restoringDoc && (
        <ConfirmModal
          title="¿Reactivar Personal?"
          message={`Esta acción reactivará el registro de ${restoringDoc.apellidos}, ${restoringDoc.nombres} en el padrón oficial.`}
          confirmLabel="Reactivar"
          cancelLabel="Cancelar"
          onConfirm={confirmRestore}
          onCancel={() => setRestoringDoc(null)}
        />
      )}
    </div>
  );
};
