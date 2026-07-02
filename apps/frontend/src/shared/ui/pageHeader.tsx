import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode; // Para pasarle botones dinámicos
}

export const PageHeader = ({ title, description, action }: PageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 animate-in fade-in-0 duration-300">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-[1.7rem] font-extrabold text-text tracking-tight">
          {title}
        </h1>
        {description && <p className="text-sm text-text-muted font-medium">{description}</p>}
      </div>

      {/* Contenedor para acciones (Botones, exportar, etc.) */}
      {action && <div className="flex items-center shrink-0">{action}</div>}
    </div>
  );
};
