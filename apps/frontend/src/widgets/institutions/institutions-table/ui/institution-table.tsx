import { useState } from 'react';

import { FastActions } from '@shared/ui/FastActions';
import { type Institucion } from '@entities/model-instituciones';
import { NivelBadge, ModalidadBadge, DirectorCell } from '@features/institutions/ui';
import { useEntityTable } from '@shared/hooks/useEntityTable';
import { EntityTable } from '@shared/ui/EntityTable';
import { ConfirmModal } from '@shared/ui/ConfirmModal';
import { TableCell, TableHead, TableRow } from '@shared/ui/table';
import { Badge } from '@shared/ui/badge';
import { institutionsApi } from '@shared/api/institutions.api';

interface InstitutionsTableWidgetProps {
  instituciones: Institucion[];
  setInstituciones: React.Dispatch<React.SetStateAction<Institucion[]>>;
  onEdit: (inst: Institucion) => void;
  onView: (inst: Institucion) => void;
}

const institutionFilter = (inst: Institucion, params: URLSearchParams) => {
  const nivelFilter = params.get('nivel') || '';
  const distritoFilter = params.get('distrito') || '';
  const estadoFilter = params.get('estado') || '';
  return (
    (!nivelFilter || inst.nivel === nivelFilter) &&
    (!distritoFilter || inst.distrito === distritoFilter) &&
    (!estadoFilter ||
      (estadoFilter.toLowerCase().startsWith('activ') &&
        inst.estado.toLowerCase().startsWith('activ')) ||
      (estadoFilter.toLowerCase().startsWith('inactiv') &&
        inst.estado.toLowerCase().startsWith('inactiv')) ||
      inst.estado.toLowerCase() === estadoFilter.toLowerCase())
  );
};

export const InstitutionsTableWidget = ({
  instituciones,
  setInstituciones,
  onEdit,
  onView,
}: InstitutionsTableWidgetProps) => {

  const [deletingInst, setDeletingInst] = useState<Institucion | null>(null);
  const [restoringInst, setRestoringInst] = useState<Institucion | null>(null);

  const pagination = useEntityTable({ data: instituciones, filterFn: institutionFilter });

  const confirmDelete = async () => {
    if (!deletingInst) return;
    try {
      const res = await institutionsApi.softDelete(deletingInst.id);
      if (res.ok) {
        setInstituciones((prev) =>
          prev.map((i) => (i.id === deletingInst.id ? { ...i, activo: false } : i)),
        );
      } else {
        alert('Error al dar de baja la institución.');
      }
    } catch (err) {
      console.error('Connection error when deleting institution:', err);
    } finally {
      setDeletingInst(null);
    }
  };

  const confirmRestore = async () => {
    if (!restoringInst) return;
    try {
      const res = await institutionsApi.restore(restoringInst.id);
      if (res.ok) {
        setInstituciones((prev) =>
          prev.map((i) => (i.id === restoringInst.id ? { ...i, activo: true } : i)),
        );
      } else {
        alert('Error al reactivar la institución.');
      }
    } catch (err) {
      console.error('Connection error when restoring institution:', err);
    } finally {
      setRestoringInst(null);
    }
  };

  return (
    <>
      <EntityTable
        header={
          <>
            <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider pl-5">
              Código Modular
            </TableHead>
            <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">
              Nombre de la I.E.
            </TableHead>
            <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">Nivel</TableHead>
            <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">Modalidad</TableHead>
            <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">Distrito</TableHead>
            <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">Director</TableHead>
            <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider">Estado</TableHead>
            <TableHead className="font-bold text-[0.7rem] uppercase tracking-wider text-right pr-5">
              Acciones
            </TableHead>
          </>
        }
        pagination={pagination}
        emptyMessage="No se encontraron instituciones con los filtros seleccionados."
        itemName="instituciones"
      >
        {pagination.pageItems.map((inst) => (
          <TableRow key={inst.id} className="hover:bg-muted/30 transition-colors">
            <TableCell className="pl-5 text-text">
              <div className="font-semibold">{inst.codigoModular}</div>
              <div className="text-xs text-text-muted mt-0.5">
                Local: {inst.codigoLocal || '-'}
              </div>
            </TableCell>
            <TableCell>
              <div className="font-bold text-text">{inst.nombre}</div>
              <div className="text-xs text-text-muted mt-0.5">{inst.direccion}</div>
            </TableCell>
            <TableCell>
              <NivelBadge nivel={inst.nivel} />
            </TableCell>
            <TableCell>
              <ModalidadBadge modalidad={inst.modalidad} />
            </TableCell>
            <TableCell className="text-text font-medium">{inst.distrito}</TableCell>
            <TableCell>
              <DirectorCell director={inst.director} />
            </TableCell>
            <TableCell>
              <Badge
                className={
                  inst.activo
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }
              >
                {inst.activo ? 'Activa' : 'Inactiva'}
              </Badge>
            </TableCell>
            <TableCell className="text-right pr-5">
              <FastActions
                onView={() => onView(inst)}
                onEdit={inst.activo ? () => onEdit(inst) : undefined}
                onDelete={inst.activo ? () => setDeletingInst(inst) : undefined}
                onRestore={!inst.activo ? () => setRestoringInst(inst) : undefined}
                viewTitle="Ver detalle"
                restoreTitle="Reactivar institución"
                deleteTitle="Desactivar institución"
              />
            </TableCell>
          </TableRow>
        ))}
      </EntityTable>

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

      {restoringInst && (
        <ConfirmModal
          title="¿Reactivar Institución?"
          message={`Esta acción reactivará el registro de la institución ${restoringInst.nombre}.`}
          confirmLabel="Reactivar"
          cancelLabel="Cancelar"
          onConfirm={confirmRestore}
          onCancel={() => setRestoringInst(null)}
        />
      )}
    </>
  );
};
