import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@shared/ui/pageHeader';
import { PlantillaForm, type PlantillaFormState } from '@widgets/plantillas';
import { usePlantillas } from '@entities/model-plantillas';
import { useUser } from '@entities/model-user';
import { plantillasApi } from '@entities/model-plantillas/api/plantillas.api';
import { useQueryClient } from '@tanstack/react-query';

const toBackendTipo = (tipo: string): 'DOCENTE' | 'DIRECTIVO' =>
  tipo.toUpperCase().includes('DIRECTIVO') ? 'DIRECTIVO' : 'DOCENTE';

export const PlantillaCreatePage = () => {
  const navigate = useNavigate();
  const { addPlantilla } = usePlantillas();
  const { user } = useUser();
  const qc = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (data: PlantillaFormState) => {
    setIsSaving(true);
    const role: 'director_institucion' | 'jefe_gestion' =
      user?.role === 'director_institucion' ? 'director_institucion' : 'jefe_gestion';

    const backendTipo = toBackendTipo(data.tipoMonitoreo);

    try {
      // 0. Si ya existe una plantilla Vigente del mismo tipo+año, archivarla primero
      const existing = await plantillasApi.findAll({
        tipoMonitoreo: backendTipo,
        anioAcademico: Number(data.anioAcademico),
        estado: 'Vigente',
      });
      if (existing && existing.length > 0) {
        for (const old of existing) {
          await plantillasApi.cambiarEstado(old.id, 'Historico');
        }
      }

      // 1. Crear en backend via API directa
      // Filtrar aspectos vacíos (sin descripción) antes de enviar
      const created = await plantillasApi.create({
        tipoMonitoreo: backendTipo,
        anioAcademico: Number(data.anioAcademico),
        baremo: data.baremo,
        descripcion: `Plantilla registrada el ${new Date().toLocaleDateString('es-ES')}. Contiene ${data.desempenos.length} desempeños de evaluación.`,
        niveles: data.niveles.map((n, i) => ({
          nivelRomano: n.nivel,
          denominacion: n.denominacion,
          rangoMin: n.rangoMin,
          color: n.color,
          orden: i + 1,
        })),
        desempenos: data.desempenos
          .map((d, i) => ({
            id: d.id,
            nombre: d.nombre,
            descripcionCorta: d.descripcionCorta,
            preguntaExtra: d.preguntaExtra || undefined,
            orden: i + 1,
            aspectos: d.aspectos
              .filter((a) => a.descripcion.trim() !== '')
              .map((a, ai) => ({
                id: a.id,
                descripcion: a.descripcion,
                orden: ai + 1,
              })),
            rubrica: (d.rubrica ?? []).map((r) => ({
              nivelRomano: r.nivel,
              descripcion: r.descripcion,
            })),
          }))
          // Solo incluir desempeños que tengan al menos 1 aspecto con contenido
          .filter((d) => d.aspectos.length > 0 || true),
        ejeItems: (data.ejeItems ?? []).map((item) => ({
          numero: item.numero,
          descripcion: item.descripcion,
        })),
      });

      // 2. Cambiar estado a Vigente
      await plantillasApi.cambiarEstado(created.id, 'Vigente');

      // 3. Agregar al contexto local con el ID real del backend
      addPlantilla({
        id: created.id,
        tipoMonitoreo: data.tipoMonitoreo,
        anioAcademico: Number(data.anioAcademico),
        baremo: data.baremo,
        niveles: data.niveles,
        desempenos: data.desempenos,
        ejesItems: data.ejeItems,
        fechaCreacion: new Date().toISOString().split('T')[0],
        estado: 'Vigente',
        descripcion: `Plantilla registrada el ${new Date().toLocaleDateString('es-ES')}. Contiene ${data.desempenos.length} desempeños de evaluación.`,
        creadoPorRole: role,
        creadoPorId: user?.id,
        ieId: user?.institucion,
      });

      // 4. Invalidar cache de TanStack Query
      qc.invalidateQueries({ queryKey: ['plantillas'] });

      navigate(-1);
    } catch (err) {
      console.error('[plantilla] Error al crear:', err);
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      alert(`Error al crear la plantilla:\n${msg}`);
      setIsSaving(false);
    }
  };

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
            title="Registrar Nueva Plantilla"
            description="Complete los campos para dar de alta una plantilla de ficha de monitoreo."
          />
        </div>
      </div>

      <PlantillaForm onCancel={() => navigate(-1)} onSubmit={handleSubmit} isSaving={isSaving} />
    </div>
  );
};
