import { Card } from '@shared/ui/card';
import { Button } from '@shared/ui/button';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CoberturaProvincialCard = () => {
  return (
    <Card className="p-5 h-full flex flex-col justify-between border-transparent shadow-xs bg-primary text-primary-foreground relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-2">
        <h3 className="text-sm font-bold">Cobertura Provincial</h3>
        <p className="text-xs text-primary-foreground/80 leading-relaxed max-w-[90%]">
          Visualización geo-referenciada de redes educativas en Lampa.
        </p>
      </div>

      <div className="relative z-10 flex justify-between items-end mt-6">
        <div className="flex flex-col">
          <span className="text-2xl font-black">10/12</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/70">
            Distritos Activos
          </span>
        </div>
        
        <Link to="/director/dashboard">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs font-bold border-transparent bg-white/20 hover:bg-white/30 text-white"
          >
            <MapPin className="w-3 h-3 mr-1.5" />
            Explorar Mapa
          </Button>
        </Link>
      </div>
    </Card>
  );
};
