import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@shared/ui/pageHeader';
import { EditarPlantillaForm } from '@widgets/plantillas';
import type { PlantillaFormState } from '@widgets/plantillas';
import { usePlantillas } from '@entities/model-plantillas'; 

export const PlantillaEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { plantillas, updatePlantilla } = usePlantillas();
  
  const [initialData, setInitialData] = useState<PlantillaFormState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Buscar la plantilla simulada usando el ID que viene en la URL
    const plantilla = plantillas.find((p) => p.id === id);

    if (plantilla) {
      setInitialData({
        tipoMonitoreo: plantilla.tipoMonitoreo,
        anioAcademico: plantilla.anioAcademico,
        baremo: plantilla.baremo,
        niveles: plantilla.niveles,
        desempenos: plantilla.desempenos,
      });
    } else {
      setError('No se encontró la plantilla de monitoreo solicitada.');
    }
  }, [id, plantillas]);

  const handleSubmit = (data: PlantillaFormState) => {
    if (!id) return;
    setIsSaving(true);
    
    // Actualizar la plantilla en el contexto
    updatePlantilla(id, {
      tipoMonitoreo: data.tipoMonitoreo,
      anioAcademico: Number(data.anioAcademico),
      baremo: data.baremo,
      niveles: data.niveles,
      desempenos: data.desempenos,
    });
    
    setIsSaving(false);
    navigate(-1);
  };

  if (error) {
    return <div className="p-6 text-destructive font-semibold">{error}</div>;
  }

  if (!initialData) {
    return <div className="p-6 text-text-muted text-sm">Cargando datos de la rúbrica...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1100px] mx-auto w-full animate-in fade-in-0 duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl bg-surface border border-border text-text-muted hover:text-text hover:bg-bg transition-colors cursor-pointer shadow-sm animate-in zoom-in-95 duration-200"
        >
          <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2.5} />
        </button>
        <div className="flex-1">
          <PageHeader
            title="Modificar Plantilla Establecida"
            description="Modifique las secciones, aspectos de control o puntajes de la ficha seleccionada."
          />
        </div>
      </div>

      <EditarPlantillaForm 
        initialData={initialData} 
        onCancel={() => navigate(-1)} 
        onSubmit={handleSubmit}
        isLoading={isSaving}
      />
    </div>
  );
};