import { useSearchParams } from 'react-router-dom';
import { ROL_ESPECIALISTA_LABELS } from '@entities/model-especialistas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select';
import { Card } from '@shared/ui/card';
import { Input } from '@shared/ui/input';
import { Search } from 'lucide-react';

export const FilterEspecialistas = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const rol = searchParams.get('rol') || '';
  const estado = searchParams.get('estado') || '';

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Búsqueda por texto */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[0.7rem] font-bold uppercase tracking-wider text-text-muted">
              Buscar Especialista
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar por DNI, Nombre o Especialidad..."
                value={search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-9 bg-surface border-border text-text text-sm h-9 w-full"
              />
            </div>
          </div>

          {/* Selector de Rol */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[0.7rem] font-bold uppercase tracking-wider text-text-muted">
              Rol de Especialista
            </label>
            <Select value={rol || 'todos'} onValueChange={(v) => updateFilter('rol', v === 'todos' ? '' : v)}>
              <SelectTrigger className="w-full text-left text-sm bg-surface border-border text-text h-9">
                <SelectValue placeholder="Todos los roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los roles</SelectItem>
                {Object.entries(ROL_ESPECIALISTA_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selector de Estado */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[0.7rem] font-bold uppercase tracking-wider text-text-muted">
              Estado
            </label>
            <Select value={estado || 'todos'} onValueChange={(v) => updateFilter('estado', v === 'todos' ? '' : v)}>
              <SelectTrigger className="w-full text-left text-sm bg-surface border-border text-text h-9">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="Activo">Activos</SelectItem>
                <SelectItem value="Inactivo">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
};
