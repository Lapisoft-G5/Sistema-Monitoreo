import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card';
import { Button } from '@shared/ui/button';
import { Search, X, AlertCircle, Save } from 'lucide-react';
import { TextField } from '@shared/ui/form-controls';
import type { Docente } from '@entities/model-docentes';
import { fetchDocentes } from '@features/docentes/docente-service';
import { teachersApi } from '@shared/api/teachers.api';
import { toast } from 'sonner';

interface AsignacionEvaluadorWidgetProps {
  evaluadorId: string;
  evaluadorNombre: string;
  evaluadorCargo: string;
}

export const AsignacionEvaluadorWidget: React.FC<AsignacionEvaluadorWidgetProps> = ({
  evaluadorId,
  evaluadorNombre,
  evaluadorCargo,
}) => {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [asignados, setAsignados] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadDocentes = async () => {
      setLoading(true);
      try {
        const allDocentes = await fetchDocentes();
        // Filtramos para obtener solo Docentes de Aula
        const deAula = allDocentes.filter((d) => d.cargo === 'Docente de Aula' && d.id !== evaluadorId);
        setDocentes(deAula);
        
        // Cargar asignados reales
        const res = await teachersApi.getAsignaciones(evaluadorId);
        if (res.ok && res.data) {
          const asignadosIds = res.data.map((a: any) => a.evaluadoId);
          setAsignados(asignadosIds);
        } else {
          setAsignados([]);
        }
      } catch (err) {
        toast.error('Error al cargar docentes de aula');
      } finally {
        setLoading(false);
      }
    };
    loadDocentes();
  }, [evaluadorId]);

  const toggleAsignacion = (docenteId: string) => {
    setAsignados((prev) =>
      prev.includes(docenteId)
        ? prev.filter((id) => id !== docenteId)
        : [...prev, docenteId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await teachersApi.saveAsignaciones(evaluadorId, asignados);
      if (res.ok) {
        toast.success(res.data?.message || 'Asignaciones guardadas correctamente');
      } else {
        toast.error('Error al guardar las asignaciones');
      }
    } catch (err) {
      toast.error('Error al guardar las asignaciones');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredDocentes = docentes.filter((d) =>
    `${d.nombres} ${d.apellidos} ${d.especialidad}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="w-full bg-surface border-border shadow-sm rounded-xl overflow-hidden mt-6">
      <CardHeader className="border-b border-border bg-slate-50 p-4">
        <CardTitle className="text-sm font-bold text-slate-800 flex items-center justify-between">
          <span>
            Docentes asignados a <span className="text-primary">{evaluadorNombre}</span> ({evaluadorCargo})
          </span>
          <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md">
            {asignados.length} Asignados
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="w-full max-w-sm">
            <TextField
              label=""
              value={search}
              onChange={setSearch}
              placeholder="Buscar por nombre o especialidad..."
              adornment={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving || loading}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs h-9 px-4 rounded-lg flex items-center gap-2 cursor-pointer shadow-sm"
          >
            {isSaving ? (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar Asignaciones
          </Button>
        </div>

        {loading ? (
          <div className="py-8 flex justify-center">
            <span className="text-slate-500 text-xs animate-pulse">Cargando docentes...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredDocentes.map((docente) => {
              const isAsignado = asignados.includes(docente.id);
              const isAssignedToOther = docente.evaluadorActual && docente.evaluadorActual.evaluadorId !== evaluadorId;
              
              return (
                <div
                  key={docente.id}
                  onClick={() => !isAssignedToOther && toggleAsignacion(docente.id)}
                  className={`p-3 border rounded-lg transition-all flex items-start gap-3 select-none ${
                    isAsignado
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20 cursor-pointer'
                      : isAssignedToOther
                      ? 'border-slate-200 bg-slate-100 opacity-70 cursor-not-allowed'
                      : 'border-slate-200 hover:border-primary/40 bg-white hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    isAsignado ? 'bg-primary border-primary text-white' : isAssignedToOther ? 'border-slate-300 bg-slate-200' : 'border-slate-300 bg-white'
                  }`}>
                    {isAsignado && <X className="w-3 h-3" style={{ transform: 'rotate(45deg)' }} />}
                  </div>
                  <div className="flex flex-col min-w-0 w-full">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {docente.apellidos}, {docente.nombres}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 truncate">
                      DNI: {docente.dni}
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] font-semibold text-slate-400 truncate">
                        Esp: {docente.especialidad}
                      </span>
                      {isAssignedToOther && (
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded truncate max-w-[100px]" title={`Asignado a: ${docente.evaluadorActual?.evaluadorNombres}`}>
                          Ocupado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredDocentes.length === 0 && (
              <div className="col-span-full py-8 flex flex-col items-center justify-center text-slate-400 gap-2 border border-dashed border-slate-200 rounded-lg">
                <AlertCircle className="w-6 h-6" />
                <span className="text-xs font-semibold">No se encontraron docentes de aula.</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
