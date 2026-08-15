import { FileText, BarChart2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SubnavReportesProps {
  totalFichas?: number;
}

export const SubnavReportes = ({ totalFichas }: SubnavReportesProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAnalisis = location.pathname.startsWith('/reportes/analisis');
  const isFichas = !isAnalisis;

  return (
    <div className="flex items-center gap-2 border-b border-border pb-3 mb-6">
      <button
        onClick={() => navigate('/reportes')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          isFichas
            ? 'bg-primary text-white shadow-sm'
            : 'bg-surface text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-border'
        }`}
      >
        <FileText className="h-4 w-4" />
        <span>Fichas Completadas</span>
        {typeof totalFichas === 'number' && (
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
              isFichas ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {totalFichas}
          </span>
        )}
      </button>

      <button
        onClick={() => navigate('/reportes/analisis')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          isAnalisis
            ? 'bg-primary text-white shadow-sm'
            : 'bg-surface text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-border'
        }`}
      >
        <BarChart2 className="h-4 w-4" />
        <span>Análisis de Desempeño</span>
      </button>
    </div>
  );
};
