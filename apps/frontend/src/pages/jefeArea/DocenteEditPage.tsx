import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { EditDirectorCard } from '@widgets/directores';

export const DocenteEditPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-5 w-full animate-in fade-in-0 duration-300">
      <button
        onClick={() => navigate('/instituciones/docentes')}
        className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al Padrón de Directores
      </button>

      <EditDirectorCard />
    </div>
  );
};
