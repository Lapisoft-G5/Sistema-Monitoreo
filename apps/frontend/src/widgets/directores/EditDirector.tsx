import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@shared/ui/card';
import { DirectorFormBase } from '@features/directores';
import type { DirectorFormData } from '@entities/model-docentes/validator';
import { MOCK_DOCENTES } from '@entities/model-docentes';
import { MOCK_INSTITUCIONES } from '@entities/model-instituciones';

export const EditDirectorCard = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const director = MOCK_DOCENTES.find((d) => d.id === id && d.cargo === 'Director');

  if (!director) {
    return (
      <div className="p-6 text-center text-text-muted font-medium bg-surface border border-border rounded-2xl">
        No se encontró el director especificado.
      </div>
    );
  }

  // Precarga del mismo formulario base usado en el registro.
  const initialData: DirectorFormData = {
    nombres: director.nombres,
    apellidos: director.apellidos,
    dni: director.dni,
    correo: director.correo,
    celular: director.celular,
    condicion: director.condicion as DirectorFormData['condicion'],
    escala: director.escala,
    institucionId: director.institucionId,
  };

  // IEs ofrecidas: las que no tienen director + la actual de este director.
  const iesDisponibles = MOCK_INSTITUCIONES.filter(
    (i) => !i.director || i.id === director.institucionId,
  );

  const handleSubmit = (data: DirectorFormData) => {
    const idx = MOCK_DOCENTES.findIndex((d) => d.id === id);
    if (idx === -1) return;
    const ie = MOCK_INSTITUCIONES.find((i) => i.id === data.institucionId);
    MOCK_DOCENTES[idx] = {
      ...MOCK_DOCENTES[idx],
      nombres: data.nombres,
      apellidos: data.apellidos,
      correo: data.correo,
      celular: data.celular,
      condicion: data.condicion,
      escala: data.escala,
      institucionId: data.institucionId,
      nivelEducativo: ie?.nivel ?? MOCK_DOCENTES[idx].nivelEducativo, // el nivel sigue al de la I.E.
    };
    navigate('/instituciones/docentes');
  };

  return (
    <Card className="w-full bg-surface border border-border rounded-2xl shadow-sm overflow-hidden p-6 sm:p-8">
      <DirectorFormBase
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/instituciones/docentes')}
        isLoading={false}
        instituciones={iesDisponibles}
        submitLabel="Actualizar Datos"
      />
    </Card>
  );
};
