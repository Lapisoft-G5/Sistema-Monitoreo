import { useSearchParams } from 'react-router-dom';
import { CONDICION_LABORAL } from '@entities/model-docentes';
import { NIVELES } from '@entities/model-instituciones';
import { FilterSelect } from '@shared/ui/Filter-Select';
import { Card } from '@shared/ui/card';
import { Input } from '@shared/ui/input';
import { Search } from 'lucide-react';

export const FilterDocentes = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const condicion = searchParams.get('condicion') || '';
  const nivelEducativo = searchParams.get('nivelEducativo') || '';

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);

    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }

    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  return (
    <Card className="p-5 border border-border shadow-xs animate-in fade-in-0 duration-300">
      <div className="flex flex-col gap-4">
        {/* Fila de Filtros Select */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Búsqueda por texto */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[0.7rem] font-bold uppercase tracking-wider text-text-muted">
              Buscar Director
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar por DNI o Nombre..."
                value={search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-9 bg-surface border-border text-text text-sm h-9 w-full"
              />
            </div>
          </div>

          <FilterSelect
            label="Condición Laboral"
            value={condicion}
            onChange={(v) => updateFilter('condicion', v)}
            options={[...CONDICION_LABORAL]}
            allLabel="Todas las condiciones"
          />

          <FilterSelect
            label="Nivel Educativo"
            value={nivelEducativo}
            onChange={(v) => updateFilter('nivelEducativo', v)}
            options={[...NIVELES]}
            allLabel="Todos los niveles"
          />
        </div>
      </div>
    </Card>
  );
};
