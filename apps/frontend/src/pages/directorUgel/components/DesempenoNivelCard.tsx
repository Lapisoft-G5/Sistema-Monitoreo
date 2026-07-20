import { Card } from '@shared/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useState } from 'react';

const IndicadorItem = ({
  titulo,
  valor,
  tendencia,
  tipoTendencia,
  bgClass,
  textClass,
}: {
  titulo: string;
  valor: string;
  tendencia: string;
  tipoTendencia: 'up' | 'down' | 'neutral';
  bgClass: string;
  textClass: string;
}) => {
  return (
    <div className={`p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 ${bgClass}`}>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${textClass}`}>{titulo}</span>
      <span className={`text-3xl font-black ${textClass}`}>{valor}</span>
      <div className={`flex items-center text-[10px] font-bold ${textClass}`}>
        {tipoTendencia === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
        {tipoTendencia === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
        {tipoTendencia === 'neutral' && <Minus className="w-3 h-3 mr-1" />}
        {tendencia}
      </div>
    </div>
  );
};

export const DesempenoNivelCard = () => {
  const [nivel, setNivel] = useState('primaria');

  const dataPrimaria = [
    { titulo: 'Comprensión Lectora', valor: '72%', tendencia: '↑ +4.2%', tipoTendencia: 'up' as const, bgClass: 'bg-green-500/10', textClass: 'text-green-600' },
    { titulo: 'Raz. Matemático', valor: '54%', tendencia: '↓ -1.5%', tipoTendencia: 'down' as const, bgClass: 'bg-amber-500/10', textClass: 'text-amber-600' },
    { titulo: 'Asistencia Docente', valor: '96%', tendencia: '= Estable', tipoTendencia: 'neutral' as const, bgClass: 'bg-green-500/10', textClass: 'text-green-600' },
    { titulo: 'Competencias Digitales', valor: '28%', tendencia: '! Crítico', tipoTendencia: 'down' as const, bgClass: 'bg-destructive/10', textClass: 'text-destructive' },
  ];

  const dataSecundaria = [
    { titulo: 'Comprensión Lectora', valor: '68%', tendencia: '↑ +2.1%', tipoTendencia: 'up' as const, bgClass: 'bg-green-500/10', textClass: 'text-green-600' },
    { titulo: 'Raz. Matemático', valor: '48%', tendencia: '↓ -3.2%', tipoTendencia: 'down' as const, bgClass: 'bg-amber-500/10', textClass: 'text-amber-600' },
    { titulo: 'Asistencia Docente', valor: '92%', tendencia: '= Estable', tipoTendencia: 'neutral' as const, bgClass: 'bg-green-500/10', textClass: 'text-green-600' },
    { titulo: 'Competencias Digitales', valor: '45%', tendencia: '↑ +5.0%', tipoTendencia: 'up' as const, bgClass: 'bg-amber-500/10', textClass: 'text-amber-600' },
  ];

  const currentData = nivel === 'primaria' ? dataPrimaria : dataSecundaria;

  return (
    <Card className="p-6 h-full flex flex-col gap-6 border-border shadow-xs bg-card">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center">
            <div className="w-2.5 h-2.5 grid grid-cols-2 gap-[2px]">
              <div className="bg-primary rounded-[1px]" />
              <div className="bg-primary rounded-[1px]" />
              <div className="bg-primary rounded-[1px]" />
              <div className="bg-primary rounded-[1px]" />
            </div>
          </div>
          <h3 className="text-sm font-bold text-text">Indicadores de Desempeño por Nivel</h3>
        </div>
        
        <div className="flex bg-muted p-1 rounded-lg">
          <button
            onClick={() => setNivel('primaria')}
            className={`h-7 px-4 text-xs font-semibold rounded-md transition-all ${
              nivel === 'primaria' ? 'bg-white shadow-sm text-text' : 'text-text-muted hover:text-text'
            }`}
          >
            Primaria
          </button>
          <button
            onClick={() => setNivel('secundaria')}
            className={`h-7 px-4 text-xs font-semibold rounded-md transition-all ${
              nivel === 'secundaria' ? 'bg-white shadow-sm text-text' : 'text-text-muted hover:text-text'
            }`}
          >
            Secundaria
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
        {currentData.map((item, idx) => (
          <IndicadorItem key={idx} {...item} />
        ))}
      </div>
    </Card>
  );
};
