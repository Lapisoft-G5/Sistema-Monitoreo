import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { PageHeader } from '@shared/ui/pageHeader';
import { useEspecialistaService } from '@features/especialistas';
import { EspecialistaFormBase } from '@features/especialistas';
import { Card } from '@shared/ui/card';
import type { EspecialistaFormData } from '@entities/model-especialistas/validator';

interface SuperadminCreatePageProps {
  targetRole: 'director_ugel' | 'jefe_gestion';
}

export const SuperadminCreatePage = ({ targetRole }: SuperadminCreatePageProps) => {
  const navigate = useNavigate();
  const { createEspecialista, loading, error } = useEspecialistaService();

  const handleFormSubmit = async (formData: EspecialistaFormData) => {
    // Registramos directamente con el rol y cargo destino.
    const roleCode = targetRole === 'director_ugel' ? 'director_ugel' : 'jefe_gestion';
    const cargo = targetRole === 'director_ugel' ? 'Especialista' : 'Jefe de Gestión';
    const result = await createEspecialista(formData, roleCode, cargo);
    if (result.success) {
      navigate(targetRole === 'director_ugel' ? '/superadmin/director' : '/superadmin/jefe');
    }
  };

  const esErrorCelular = error?.toLowerCase().includes('celular') || error?.toLowerCase().includes('teléfono');

  const title = 'Registrar Nuevo Especialista';
  const description = 'Complete los datos para registrar un nuevo especialista en el sistema.';
  const backPath = targetRole === 'director_ugel' ? '/superadmin/director' : '/superadmin/jefe';

  const initialData: EspecialistaFormData = {
    nombres: '',
    apellidos: '',
    dni: '',
    correo: '',
    celular: '',
    especialidades: [],
    especialidad: '',
    especialidadesExtras: [],
    nivelEducativo: 'Primaria',
    modalidad: 'EBR',
    cargo: targetRole === 'jefe_gestion' ? ('Jefe de Gestión' as const) : ('Especialista' as const),
    activo: true,
    condicionLaboral: targetRole === 'jefe_gestion' ? ('Nombrado' as const) : ('Encargado' as const),
    cargaLaboral: 40,
    escalaMagisterial: undefined,
  };

  return (
    <div className="flex flex-col gap-6 max-w-[820px] mx-auto w-full animate-in fade-in-0 duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(backPath)}
          className="p-2.5 rounded-xl bg-surface border border-border text-text-muted hover:text-text hover:bg-bg transition-colors cursor-pointer shadow-sm"
        >
          <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2.5} />
        </button>
        <div className="flex-1">
          <PageHeader
            title={title}
            description={description}
          />
        </div>
      </div>

      <Card className="w-full bg-surface border border-border rounded-2xl shadow-sm overflow-hidden p-6 sm:p-8">
        {error && !esErrorCelular && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-sm font-medium mb-5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <EspecialistaFormBase
          onSubmit={handleFormSubmit}
          onCancel={() => navigate(backPath)}
          isLoading={loading}
          initialData={initialData}
          serverError={error}
          isSuperadminCreate={true}
          targetRole={targetRole}
        />
      </Card>
    </div>
  );
};
