import { useState } from 'react';
import type { Institucion } from '@entities/model-instituciones';
import { MOCK_INSTITUCIONES } from '@entities/model-instituciones';
import type { InstitutionRawInput } from './ui/CreateInstitutionFormBase';

export const useInstitutionService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInstitution = async (formData: InstitutionRawInput) => {
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newInstitution: Institucion = {
        id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
        codigoModular: formData.codigoModular,
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim(),
        nivel: formData.nivel as any,
        provincia: formData.provincia,
        distrito: formData.distrito,
        zona: formData.zona,
        director: formData.director.trim() || null,
        directorTelefono: formData.directorTelefono.trim() || undefined,
        directorCorreo: formData.directorCorreo.trim() || undefined,
        estado: 'Satisfactorio',
      };

      // Persistencia en memoria mutando la lista mock
      MOCK_INSTITUCIONES.push(newInstitution);

      return { success: true, data: newInstitution };
    } catch (err) {
      setError('Error institucional al guardar el registro.');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateInstitution = async (id: string, formData: InstitutionRawInput) => {
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedInstitution: Institucion = {
        id,
        codigoModular: formData.codigoModular,
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim(),
        nivel: formData.nivel as any,
        provincia: formData.provincia,
        distrito: formData.distrito,
        zona: formData.zona,
        director: formData.director.trim() || null,
        directorTelefono: formData.directorTelefono.trim() || undefined,
        directorCorreo: formData.directorCorreo.trim() || undefined,
        estado: 'Satisfactorio', // O el estado que ya tenía
      };

      // Persistencia en memoria mutando la lista mock
      const index = MOCK_INSTITUCIONES.findIndex((i) => i.id === id);
      if (index !== -1) {
        MOCK_INSTITUCIONES[index] = updatedInstitution;
      }

      return { success: true, data: updatedInstitution };
    } catch (err) {
      setError('Error al actualizar el registro de la institución.');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { createInstitution, updateInstitution, loading, error };
};
