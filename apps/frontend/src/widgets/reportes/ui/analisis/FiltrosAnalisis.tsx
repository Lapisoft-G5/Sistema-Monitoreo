import { Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

interface FiltrosAnalisisProps {
  filtroAnio: string;
  setFiltroAnio: (anio: string) => void;
  filtroNivel: string;
  setFiltroNivel: (nivel: string) => void;
  filtroLogro: string;
  setFiltroLogro: (logro: string) => void;
  aniosDisponibles: string[];
  nivelesDisponibles: string[];
  onLimpiarFiltros: () => void;
  isFiltered: boolean;
}

export const FiltrosAnalisis = ({
  filtroAnio,
  setFiltroAnio,
  filtroNivel,
  setFiltroNivel,
  filtroLogro,
  setFiltroLogro,
  aniosDisponibles,
  nivelesDisponibles,
  onLimpiarFiltros,
  isFiltered,
}: FiltrosAnalisisProps) => {
  return (
    <div className="bg-surface p-3 rounded-xl border border-border flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-1">
          <Filter className="h-3.5 w-3.5" />
          <span>Filtros:</span>
        </div>

        {/* Filtro Año */}
        <Select value={filtroAnio} onValueChange={setFiltroAnio}>
          <SelectTrigger className="w-[120px] h-8 text-xs bg-white">
            <SelectValue placeholder="Año" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los años</SelectItem>
            {aniosDisponibles.map((a) => (
              <SelectItem key={a} value={a}>
                Año {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro Nivel Educativo */}
        <Select value={filtroNivel} onValueChange={setFiltroNivel}>
          <SelectTrigger className="w-[140px] h-8 text-xs bg-white">
            <SelectValue placeholder="Nivel Educativo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los niveles</SelectItem>
            {nivelesDisponibles.map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro Nivel de Logro */}
        <Select value={filtroLogro} onValueChange={setFiltroLogro}>
          <SelectTrigger className="w-[160px] h-8 text-xs bg-white">
            <SelectValue placeholder="Nivel de Logro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los logros</SelectItem>
            <SelectItem value="I">Nivel I - En Inicio</SelectItem>
            <SelectItem value="II">Nivel II - En Proceso</SelectItem>
            <SelectItem value="III">Nivel III - Satisfactorio</SelectItem>
            <SelectItem value="IV">Nivel IV - Destacado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isFiltered && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onLimpiarFiltros}
          className="h-8 text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Limpiar filtros</span>
        </Button>
      )}
    </div>
  );
};
