import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Card } from '@shared/ui/card';
import { DirectorFormBase } from '@features/directores';
import type { DirectorFormData } from '@entities/model-docentes/validator';
import type { Docente } from '@entities/model-docentes';
import { MOCK_DOCENTES } from '@entities/model-docentes';
import { MOCK_INSTITUCIONES } from '@entities/model-instituciones';

export const CreateDirectorCard = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // Relación 1:1 → solo se ofrecen IEs que aún no tienen director.
  const iesDisponibles = MOCK_INSTITUCIONES.filter((i) => !i.director);

  const handleSubmit = (data: DirectorFormData) => {
    const ie = MOCK_INSTITUCIONES.find((i) => i.id === data.institucionId);
    if (!ie) {
      setError('La institución seleccionada no existe.');
      return;
    }

    const nuevo: Docente = {
      id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
      nombres: data.nombres,
      apellidos: data.apellidos,
      dni: data.dni,
      correo: data.correo,
      celular: data.celular,
      nivelEducativo: ie.nivel, // el nivel del director sale de su IE
      condicion: data.condicion,
      especialidad: 'Gestión Escolar', // no se pide para director; valor por defecto
      cargaHoraria: 40,
      secciones: [],
      escala: data.escala,
      institucionId: data.institucionId,
      activo: true,
      fechaCreacion: new Date().toISOString().slice(0, 10),
      cargo: 'Director',
    };

    MOCK_DOCENTES.push(nuevo);
    ie.director = `${data.nombres} ${data.apellidos}`; // marca la IE con su director (1:1)
    navigate('/instituciones/docentes');
  };

  return (
    <Card className="w-full bg-surface border border-border rounded-2xl shadow-sm overflow-hidden p-6 sm:p-8">
      {error && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-sm font-medium mb-5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <DirectorFormBase
        onSubmit={handleSubmit}
        onCancel={() => navigate('/instituciones/docentes')}
        isLoading={false}
        instituciones={iesDisponibles}
      />
    </Card>
  );
};
