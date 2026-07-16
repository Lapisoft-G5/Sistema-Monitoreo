import { FilterSelect } from '@shared/ui/Filter-Select';
import { Button } from '@shared/ui/button';
import { Filter, RotateCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const PadronFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset pagination on filter change
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="p-4 flex flex-col md:flex-row gap-4 items-end bg-card w-full">
      <div className="flex-1 w-full min-w-[150px]">
        <FilterSelect
          label="Distrito"
          allLabel="Todos los Distritos"
          value={searchParams.get('distrito') || ''}
          onChange={(v) => handleFilterChange('distrito', v)}
          options={['Lampa', 'Santa Lucía', 'Pucará', 'Ocuviri']}
        />
      </div>
      
      <div className="flex-1 w-full min-w-[150px]">
        <FilterSelect
          label="Nivel Educativo"
          allLabel="Todos los Niveles"
          value={searchParams.get('nivel') || ''}
          onChange={(v) => handleFilterChange('nivel', v)}
          options={['INICIAL', 'PRIMARIA', 'SECUNDARIA']}
        />
      </div>

      <div className="flex-1 w-full min-w-[150px]">
        <FilterSelect
          label="Estado"
          allLabel="Todos los Estados"
          value={searchParams.get('estado') || ''}
          onChange={(v) => handleFilterChange('estado', v)}
          options={['Activo', 'Pendiente']}
        />
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
        <Button variant="secondary" className="px-6 font-semibold flex-1 md:flex-none">
          <Filter className="w-4 h-4 mr-2" />
          Filtrar
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="shrink-0 text-text-muted hover:text-text"
          onClick={clearFilters}
          title="Limpiar filtros"
        >
          <RotateCw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
