import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from './button';

interface FastActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewTitle?: string;
  editTitle?: string;
  deleteTitle?: string;
}

export const FastActions = ({
  onView,
  onEdit,
  onDelete,
  viewTitle = 'Ver detalle',
  editTitle = 'Editar',
  deleteTitle = 'Eliminar',
}: FastActionsProps) => {
  return (
    <div className="flex items-center justify-end gap-1">
      {onView && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="h-8 w-8 cursor-pointer rounded-lg text-text-muted hover:text-primary hover:bg-muted"
          title={viewTitle}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      {onEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="h-8 w-8 cursor-pointer rounded-lg text-text-muted hover:text-blue-600 hover:bg-muted"
          title={editTitle}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="h-8 w-8 cursor-pointer rounded-lg text-text-muted hover:text-destructive hover:bg-destructive/10"
          title={deleteTitle}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
