import { useSearchParams } from 'react-router-dom';
import { NIVELES, ESTADOS } from '@entities/model-instituciones';
import { FilterSelect } from '@shared/ui/Filter-Select';
import { Card } from '@shared/ui/card';

interface FilterInstitutionsProps {
  distritosOptions: string[];
}

export const FilterInstitutions = ({ distritosOptions }: FilterInstitutionsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Leemos los filtros directamente desde la URL (?nivel=X&distrito=Y...)
  const nivel = searchParams.get('nivel') || '';
  const distrito = searchParams.get('distrito') || '';
  const estado = searchParams.get('estado') || '';

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key); // Si elige "Todos", limpiamos la URL
    }
    
    newParams.set('page', '1'); // Cada vez que filtramos, reiniciamos a la página 1
    setSearchParams(newParams);
  };

  return (
    <Card className="p-5 border border-border shadow-xs animate-in fade-in-0 duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FilterSelect
          label="Nivel educativo"
          value={nivel}
          onChange={(v) => updateFilter('nivel', v)}
          options={NIVELES}
          allLabel="Todos los niveles"
        />
        <FilterSelect
          label="Distrito"
          value={distrito}
          onChange={(v) => updateFilter('distrito', v)}
          options={distritosOptions}
          allLabel="Todos los distritos"
        />
        <FilterSelect
          label="Estado"
          value={estado}
          onChange={(v) => updateFilter('estado', v)}
          options={ESTADOS}
          allLabel="Todas"
        />
      </div>
    </Card>
  );
};