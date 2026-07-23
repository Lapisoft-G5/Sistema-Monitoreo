import { Card } from '@shared/ui/card';

const AlertItem = ({
  nombre,
  motivo,
  estadoTxt,
}: {
  nombre: string;
  motivo: string;
  estadoTxt: string;
}) => {
  return (
    <div className="flex flex-col gap-1 pb-3 border-b border-border last:border-0 last:pb-0">
      <div className="flex justify-between items-start gap-2">
        <span className="text-xs font-bold text-text">{nombre}</span>
        <span className="text-[10px] font-bold text-destructive whitespace-nowrap">{estadoTxt}</span>
      </div>
      <span className="text-[10px] text-text-muted">{motivo}</span>
    </div>
  );
};

export const SeguimientoCriticoCard = () => {
  const alerts = [
    { nombre: 'I.E. Santa Lucía', motivo: 'Nivel Secundaria - Deserción alta (12%)', estadoTxt: '90 días sin visita' },
    { nombre: 'I.E. 71015 Lampa', motivo: 'Infraestructura colapsada - Pabellón B', estadoTxt: 'Informe pendiente' },
    { nombre: 'I.E.P. María Auxiliadora', motivo: 'Metas de aprendizaje no alcanzadas (I Bimestre)', estadoTxt: 'Bajo rendimiento' },
  ];

  return (
    <Card className="p-5 h-full flex flex-col gap-4 border-destructive/30 shadow-xs bg-card">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-destructive font-black text-sm">!</span>
          <h3 className="text-sm font-bold text-destructive">Seguimiento Crítico</h3>
        </div>
        <div className="bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-full">
          4 II.EE.
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1 mt-1">
        {alerts.map((item, idx) => (
          <AlertItem key={idx} {...item} />
        ))}
      </div>
    </Card>
  );
};
