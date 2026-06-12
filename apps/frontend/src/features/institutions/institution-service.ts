import { useState } from 'react';
import type { Institucion, Nivel } from '@entities/model-instituciones';
import { MOCK_INSTITUCIONES } from '@entities/model-instituciones';
import type { InstitutionRawInput } from './ui/CreateInstitutionFormBase';
import { institutionsApi } from '@shared/api/institutions.api';
import type { IInstitucionResponse } from '@sistema-monitoreo/shared-contracts';

const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const mapApiInstitucionToFrontend = (apiInst: IInstitucionResponse): Institucion => {
  return {
    id: apiInst.id,
    codigoModular: apiInst.codigoModular,
    codigoLocal: apiInst.codigoLocal,
    nombre: apiInst.nombre,
    direccion: apiInst.direccion,
    nivel: (apiInst.nivelEducativo || '').toUpperCase() as Nivel,
    distrito: apiInst.distrito,
    provincia: apiInst.provincia,
    zona: apiInst.zona,
    modalidad: apiInst.modalidad || 'Regular',
    director: apiInst.director || null,
    directorTelefono: apiInst.directorTelefono || undefined,
    directorCorreo: apiInst.directorCorreo || undefined,
    directorDni: apiInst.directorDni || undefined,
    activo: apiInst.estado === 'Activa',
    estado: apiInst.estado === 'Activa' ? 'Activa' : 'Inactiva',
  };
};

export const useInstitutionService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInstitution = async (formData: InstitutionRawInput) => {
    setLoading(true);
    setError(null);

    try {
      const dto = {
        codigoModular: formData.codigoModular,
        codigoLocal: formData.codigoLocal,
        nombre: formData.nombre.trim(),
        nivelEducativo: toTitleCase(formData.nivel),
        departamento: 'Puno',
        provincia: formData.provincia,
        distrito: formData.distrito,
        direccion: formData.direccion,
        zona: formData.zona,
        estado: 'Activa',
        modalidad: formData.modalidad || 'Regular',
      };

      const res = await institutionsApi.create(dto);
      if (res.ok && res.data) {
        const mapped = mapApiInstitucionToFrontend(res.data);
        MOCK_INSTITUCIONES.push(mapped);
        return { success: true, data: mapped };
      } else {
        const errMsg = (res.error as { message?: string })?.message || 'Error al crear la institución.';
        setError(errMsg);
        return { success: false, error: res.error };
      }
    } catch (err) {
      setError('Error de conexión al guardar el registro.');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateInstitution = async (id: string, formData: InstitutionRawInput) => {
    setLoading(true);
    setError(null);

    try {
      const dto = {
        codigoLocal: formData.codigoLocal,
        nombre: formData.nombre.trim(),
        nivelEducativo: toTitleCase(formData.nivel),
        provincia: formData.provincia,
        distrito: formData.distrito,
        direccion: formData.direccion,
        zona: formData.zona,
        modalidad: formData.modalidad || 'Regular',
      };

      const res = await institutionsApi.update(id, dto);
      if (res.ok && res.data) {
        const mapped = mapApiInstitucionToFrontend(res.data);
        const index = MOCK_INSTITUCIONES.findIndex((i) => i.id === id);
        if (index !== -1) {
          MOCK_INSTITUCIONES[index] = mapped;
        }
        return { success: true, data: mapped };
      } else {
        const errMsg = (res.error as { message?: string })?.message || 'Error al actualizar la institución.';
        setError(errMsg);
        return { success: false, error: res.error };
      }
    } catch (err) {
      setError('Error de conexión al actualizar el registro.');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { createInstitution, updateInstitution, loading, error };
};
