import { useState } from 'react';
import type { JefeArea } from '@entities/model-jefes-area';
import { MOCK_JEFES_AREA } from '@entities/model-jefes-area';
import type { JefeAreaFormData } from '@entities/model-jefes-area/validator';
import { jefesAreaApi } from '@shared/api/jefes-area.api';
import type { IEspecialistaResponse as IJefeAreaResponse } from '@sistema-monitoreo/shared-contracts';

export const mapApiJefeAreaToFrontend = (apiJefe: IJefeAreaResponse): JefeArea => {
  return {
    id: apiJefe.id,
    personaId: apiJefe.personaId,
    nombres: apiJefe.persona.nombres,
    apellidos: apiJefe.persona.apellidos,
    dni: apiJefe.persona.dni,
    correo: apiJefe.persona.correo || '',
    celular: apiJefe.persona.telefono || '',
    cargaHoraria: apiJefe.cargaLaboral || 40,
    nivelEducativo: apiJefe.nivelEducativo || 'SECUNDARIA',
    activo: apiJefe.estado === 'Activo',
    fechaCreacion: apiJefe.createdAt
      ? new Date(apiJefe.createdAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  };
};

export const useJefeAreaService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createJefeArea = async (
    formData: JefeAreaFormData,
    rolCode: string = 'jefe_area',
  ) => {
    setLoading(true);
    setError(null);

    try {
      const dto = {
        dni: formData.dni,
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        correo: formData.correo.trim() || undefined,
        telefono: formData.celular.trim() || undefined,
        cargaHoraria: formData.cargaHoraria,
        nivelEducativo: formData.nivelEducativo,
        rolCode,
      };

      const res = await jefesAreaApi.create(dto);
      if (res.ok && res.data) {
        const mapped = mapApiJefeAreaToFrontend(res.data);
        MOCK_JEFES_AREA.push(mapped);
        return { success: true, data: mapped };
      } else {
        const errMsg = (res.error as { message?: string })?.message || 'Error al registrar el jefe de área.';
        setError(errMsg);
        return { success: false, error: res.error };
      }
    } catch (err) {
      setError('Error al registrar el jefe de área.');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateJefeArea = async (
    id: string,
    formData: JefeAreaFormData,
    rolCode: string = 'jefe_area',
  ) => {
    setLoading(true);
    setError(null);

    try {
      const dto = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        correo: formData.correo.trim() || undefined,
        telefono: formData.celular.trim() || undefined,
        cargaHoraria: formData.cargaHoraria,
        nivelEducativo: formData.nivelEducativo,
        estado: formData.activo ?? true ? 'Activo' : 'Inactivo',
        rolCode,
      };

      const res = await jefesAreaApi.update(id, dto);
      if (res.ok && res.data) {
        const mapped = mapApiJefeAreaToFrontend(res.data);
        const index = MOCK_JEFES_AREA.findIndex((e) => e.id === id);
        if (index !== -1) {
          MOCK_JEFES_AREA[index] = mapped;
        }
        return { success: true, data: mapped };
      } else {
        const errMsg = (res.error as { message?: string })?.message || 'Error al actualizar el jefe de área.';
        setError(errMsg);
        return { success: false, error: res.error };
      }
    } catch (err) {
      setError('Error al actualizar el jefe de área.');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { createJefeArea, updateJefeArea, loading, error };
};
