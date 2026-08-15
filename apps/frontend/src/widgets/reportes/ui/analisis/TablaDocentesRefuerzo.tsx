import { useState } from 'react';
import { AlertCircle, User, School, Calendar, Search } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { formatearFechaCorta } from '@/shared/lib/fecha/fecha';
import type { DocenteEnRefuerzo } from '@/features/reportes/lib/analisis-desempeno';

interface TablaDocentesRefuerzoProps {
  docentes: DocenteEnRefuerzo[];
  onSeleccionarDocente?: (docenteId: string) => void;
}

export const TablaDocentesRefuerzo = ({ docentes }: TablaDocentesRefuerzoProps) => {
  const [busqueda, setBusqueda] = useState('');

  const filtrados = docentes.filter(
    (d) =>
      d.docenteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.institucion.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.especialista.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <Card className="border border-border bg-surface shadow-xs overflow-hidden rounded-xl">
      <div className="p-4 border-b border-border bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <AlertCircle className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Docentes que Requieren Fortalecimiento Pedagógico
            </h3>
            <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-black">
              {docentes.length} en Foco
            </Badge>
          </div>
          <p className="text-xs text-text-muted mt-0.5 pl-8">
            Docentes evaluados en Nivel I (En Inicio) o Nivel II (En Proceso) para planificación de
            asistencia técnica.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Buscar docente o I.E..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-8 text-xs h-8 bg-white"
          />
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="p-8 text-center text-xs text-text-muted">
          {docentes.length === 0
            ? '¡Excelente! No se registran docentes en Nivel I o II en este período.'
            : 'No se encontraron docentes con el término de búsqueda.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-border text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">Docente Evaluado</th>
                <th className="py-2.5 px-4">Institución Educativa</th>
                <th className="py-2.5 px-4">Nivel Educativo</th>
                <th className="py-2.5 px-4">Especialista / Monitor</th>
                <th className="py-2.5 px-4">Fecha</th>
                <th className="py-2.5 px-4 text-center">Nivel Obtenido</th>
                <th className="py-2.5 px-4 text-right">Puntaje / Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtrados.map((docente) => {
                const esNivelI = docente.nivelLogro === 'I';
                return (
                  <tr
                    key={docente.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            esNivelI ? 'bg-red-500 ring-4 ring-red-100' : 'bg-amber-500'
                          }`}
                        />
                        <span>{docente.docenteNombre}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-semibold max-w-[200px] truncate">
                      <div className="flex items-center gap-1.5">
                        <School className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{docente.institucion}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {docente.nivelEducativo}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{docente.especialista}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{formatearFechaCorta(docente.fecha)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        className={`font-black text-[9.5px] uppercase tracking-wider ${
                          esNivelI
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        Nivel {docente.nivelLogro} - {esNivelI ? 'En Inicio' : 'En Proceso'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-800">
                      {docente.promedio > 0 ? docente.promedio.toFixed(2) : '-'}
                      {docente.puntajeTotal > 0 && (
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          ({docente.puntajeTotal} pts)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
