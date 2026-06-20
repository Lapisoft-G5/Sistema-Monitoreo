import { FileText, TrendingUp, BookOpen, User, ArrowUpRight } from 'lucide-react';
import { Card } from '@/shared/ui/card';

interface ReportesStatsProps {
  stats: {
    total: number;
    docentes: number;
    directivos: number;
    satisfactionPercent: number;
    uniqueIEs: number;
  };
}

export const ReportesStats = ({ stats }: ReportesStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <Card className="p-4 border border-border bg-surface flex items-center gap-4 shadow-sm relative overflow-hidden group hover:shadow transition-shadow">
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
            Fichas Finalizadas
          </span>
          <span className="text-xl font-black text-slate-800 block mt-0.5 leading-none">
            {stats.total}
          </span>
        </div>
        <ArrowUpRight className="absolute top-3 right-3 h-4.5 w-4.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
      </Card>

      <Card className="p-4 border border-border bg-surface flex items-center gap-4 shadow-sm relative overflow-hidden group hover:shadow transition-shadow">
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
            Nivel Satisfactorio
          </span>
          <span className="text-xl font-black text-slate-800 block mt-0.5 leading-none">
            {stats.satisfactionPercent}%
          </span>
        </div>
        <ArrowUpRight className="absolute top-3 right-3 h-4.5 w-4.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
      </Card>

      <Card className="p-4 border border-border bg-surface flex items-center gap-4 shadow-sm relative overflow-hidden group hover:shadow transition-shadow">
        <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-600">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
            I.E. Monitoreadas
          </span>
          <span className="text-xl font-black text-slate-800 block mt-0.5 leading-none">
            {stats.uniqueIEs}
          </span>
        </div>
        <ArrowUpRight className="absolute top-3 right-3 h-4.5 w-4.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
      </Card>

      <Card className="p-4 border border-border bg-surface flex items-center gap-4 shadow-sm relative overflow-hidden group hover:shadow transition-shadow">
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
          <User className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
            Docentes vs Directivos
          </span>
          <span className="text-xl font-black text-slate-800 block mt-0.5 leading-none">
            {stats.docentes} / {stats.directivos}
          </span>
        </div>
        <ArrowUpRight className="absolute top-3 right-3 h-4.5 w-4.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
      </Card>
    </div>
  );
};
