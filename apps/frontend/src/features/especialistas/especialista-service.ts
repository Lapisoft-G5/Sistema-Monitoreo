import { useState } from 'react';
import type { Especialista, NivelInstitucion, CondicionLaboral } from '@entities/model-especialistas';
import { MOCK_ESPECIALISTAS } from '@entities/model-especialistas';
import type { EspecialistaFormData } from '@entities/model-especialistas/validator';
import { especialistasApi } from '@shared/api/especialistas.api';

import type { IEspecialistaResponse } from '@sistema-monitoreo/shared-contracts';

export const mapApiEspecialistaToFrontend = (apiEsp: IEspecialistaResponse): Especialista => {
  return {
    id: apiEsp.id,
    nombres: apiEsp.persona.nombres,
    apellidos: apiEsp.persona.apellidos,
    dni: apiEsp.persona.dni,
    correo: apiEsp.persona.correo || '',
    celular: apiEsp.persona.telefono || '',
    especialidad: apiEsp.especialidad || '',
    niveles: apiEsp.nivelEducativo
      ? (apiEsp.nivelEducativo.split(',').map((s: string) => s.trim()) as NivelInstitucion[])
      : [],
    activo: apiEsp.estado === 'Activo',
    fechaCreacion: apiEsp.createdAt
      ? new Date(apiEsp.createdAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    condicionLaboral: (apiEsp.condicionLaboral as unknown as CondicionLaboral) || 'Contratado',
    cargaLaboral: apiEsp.cargaLaboral || 40,
    escalaMagisterial: apiEsp.escalaMagisterial ?? undefined,
    cargo: apiEsp.cargo,
    rolCode: apiEsp.user?.role?.code,
  };
};

export const useEspecialistaService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEspecialista = async (
    formData: EspecialistaFormData,
    rolCode: string = 'especialista',
    cargo: string = 'Especialista',
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
        especialidad: formData.especialidad?.trim() || undefined,
        nivelEducativo: formData.niveles.join(', '),
        modalidad: 'EBR',
        rolCode,
        cargo,
        condicionLaboral: formData.condicionLaboral,
        cargaLaboral: formData.cargaLaboral,
        escalaMagisterial: formData.escalaMagisterial,
      };

      const res = await especialistasApi.create(dto);
      if (res.ok && res.data) {
        const mapped = mapApiEspecialistaToFrontend(res.data);
        MOCK_ESPECIALISTAS.push(mapped);
        return { success: true, data: mapped };
      } else {
        const errMsg = (res.error as { message?: string })?.message || 'Error al registrar el especialista.';
        setError(errMsg);
        return { success: false, error: res.error };
      }
    } catch (err) {
      setError('Error al registrar el especialista.');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateEspecialista = async (
    id: string,
    formData: EspecialistaFormData,
    rolCode: string = 'especialista',
    cargo: string = 'Especialista',
  ) => {
    setLoading(true);
    setError(null);

    try {
      const dto = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        correo: formData.correo.trim() || undefined,
        telefono: formData.celular.trim() || undefined,
        especialidad: formData.especialidad?.trim() || undefined,
        nivelEducativo: formData.niveles.join(', '),
        modalidad: 'EBR',
        estado: formData.activo ?? true ? 'Activo' : 'Inactivo',
        rolCode,
        cargo,
        condicionLaboral: formData.condicionLaboral,
        cargaLaboral: formData.cargaLaboral,
        escalaMagisterial: formData.escalaMagisterial,
      };

      const res = await especialistasApi.update(id, dto);
      if (res.ok && res.data) {
        const mapped = mapApiEspecialistaToFrontend(res.data);
        const index = MOCK_ESPECIALISTAS.findIndex((e) => e.id === id);
        if (index !== -1) {
          MOCK_ESPECIALISTAS[index] = mapped;
        }
        return { success: true, data: mapped };
      } else {
        const errMsg = (res.error as { message?: string })?.message || 'Error al actualizar el especialista.';
        setError(errMsg);
        return { success: false, error: res.error };
      }
    } catch (err) {
      setError('Error al actualizar el especialista.');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { createEspecialista, updateEspecialista, loading, error };
};
