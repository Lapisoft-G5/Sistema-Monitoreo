import { useState } from 'react';
import type { Institucion } from '@entities/model-instituciones';
import type { InstitutionRawInput } from './ui/CreateInstitutionFormBase';
import { institutionsApi } from '@shared/api/institutions.api';
import type { IInstitucionResponse, IQueryInstitucionRequest } from '@sistema-monitoreo/shared-contracts';

export const mapApiInstitucionToFrontend = (apiInst: IInstitucionResponse): Institucion => {
  return {
    id: apiInst.id,
    codigoModular: apiInst.codigoModular,
    codigoLocal: apiInst.codigoLocal,
    nombre: apiInst.nombre,
    direccion: apiInst.direccion,
    nivel: apiInst.nivelEducativo || '',
    distrito: apiInst.distrito,
    provincia: apiInst.provincia,
    zona: apiInst.zona,
    modalidad: apiInst.modalidad || 'EBR',
    director: apiInst.director || null,
    directorTelefono: apiInst.directorTelefono || undefined,
    directorCorreo: apiInst.directorCorreo || undefined,
    directorDni: apiInst.directorDni || undefined,
    activo: apiInst.estado === 'Activa',
    estado: apiInst.estado === 'Activa' ? 'Activa' : 'Inactiva',
  };
};

export const fetchInstituciones = async (query?: IQueryInstitucionRequest): Promise<Institucion[]> => {
  const res = await institutionsApi.findAll(query);
  if (res.ok && res.data) {
    return res.data.data.map(mapApiInstitucionToFrontend);
  }
  return [];
};

export const fetchInstitucionById = async (id: string): Promise<Institucion | null> => {
  const res = await institutionsApi.findById(id);
  if (res.ok && res.data) {
    return mapApiInstitucionToFrontend(res.data);
  }
  return null;
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
        nivelEducativo: formData.nivel,
        departamento: 'Puno',
        provincia: formData.provincia,
        distrito: formData.distrito,
        direccion: formData.direccion,
        zona: formData.zona,
        estado: 'Activa',
        modalidad: formData.modalidad || 'EBR',
      };

      const res = await institutionsApi.create(dto);
      if (res.ok && res.data) {
        const mapped = mapApiInstitucionToFrontend(res.data);
        return { success: true, data: mapped };
      } else {
        const errMsg =
          (res.error as { message?: string })?.message || 'Error al crear la institución.';
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
        nivelEducativo: formData.nivel,
        provincia: formData.provincia,
        distrito: formData.distrito,
        direccion: formData.direccion,
        zona: formData.zona,
        modalidad: formData.modalidad || 'EBR',
      };

      const res = await institutionsApi.update(id, dto);
      if (res.ok && res.data) {
        const mapped = mapApiInstitucionToFrontend(res.data);
        return { success: true, data: mapped };
      } else {
        const errMsg =
          (res.error as { message?: string })?.message || 'Error al actualizar la institución.';
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
