import { FileText } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export const PlaceholderPage = ({ title, description, icon }: Props) => (
  <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8">
    <div className="text-center max-w-[420px] bg-white/[0.03] border border-white/[0.07] rounded-2xl p-12">
      <div className="w-20 h-20 rounded-2xl bg-[rgb(153,5,55)]/10 border border-[rgb(153,5,55)]/20 flex items-center justify-center mx-auto mb-5 text-[rgb(220,80,110)]">
        {icon ?? <FileText className="h-[38px] w-[38px]" strokeWidth={1.5} />}
      </div>
      <h2 className="text-white text-[1.45rem] font-bold mb-3">{title}</h2>
      <p className="text-white/40 text-[0.88rem] leading-relaxed mb-5">
        {description ??
          'Esta sección está en desarrollo. Próximamente disponible con todas sus funcionalidades.'}
      </p>
      <div className="flex justify-center gap-2 flex-wrap">
        <span className="bg-white/[0.05] border border-white/10 text-white/45 text-[0.75rem] px-3 py-1.5 rounded-full">
          En desarrollo
        </span>
        <span className="bg-white/[0.05] border border-white/10 text-white/45 text-[0.75rem] px-3 py-1.5 rounded-full">
          Próximamente
        </span>
      </div>
    </div>
  </div>
);
