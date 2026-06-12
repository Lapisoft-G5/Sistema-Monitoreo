import { useState } from 'react';
import type { Especialista, EspecialistaRol, NivelInstitucion } from '@entities/model-especialistas';
import { MOCK_ESPECIALISTAS } from '@entities/model-especialistas';
import type { EspecialistaFormData } from '@entities/model-especialistas/validator';
import { especialistasApi } from '@shared/api/especialistas.api';

import type { IEspecialistaResponse } from '@sistema-monitoreo/shared-contracts';

export const mapApiEspecialistaToFrontend = (apiEsp: IEspecialistaResponse): Especialista => {
  let rol: EspecialistaRol;
  const roleCode = apiEsp.user?.role?.code;
  if (roleCode === 'jefe_gestion') {
    rol = 'especialista_admin';
  } else if (roleCode === 'jefe_area') {
    rol = 'especialista_bajo';
  } else {
    rol = 'especialista_medio';
  }

  return {
    id: apiEsp.id,
    nombres: apiEsp.persona.nombres,
    apellidos: apiEsp.persona.apellidos,
    dni: apiEsp.persona.dni,
    correo: apiEsp.persona.correo || '',
    celular: apiEsp.persona.telefono || '',
    especialidad: apiEsp.especialidad || '',
    rol,
    niveles: apiEsp.nivelEducativo
      ? (apiEsp.nivelEducativo.split(',').map((s: string) => s.trim()) as NivelInstitucion[])
      : [],
    activo: apiEsp.estado === 'Activo',
    fechaCreacion: apiEsp.createdAt
      ? new Date(apiEsp.createdAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    cargaLaboral: apiEsp.cargaLaboral || 40,
  };
};

export const useEspecialistaService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEspecialista = async (formData: EspecialistaFormData) => {
    setLoading(true);
    setError(null);

    try {
      let rolCode = 'especialista';
      let cargo = 'Especialista';
      if (formData.rol === 'especialista_admin') {
        rolCode = 'jefe_gestion';
        cargo = 'Jefe de Gestión';
      } else if (formData.rol === 'especialista_bajo') {
        rolCode = 'jefe_area';
        cargo = 'Jefe de Área';
      }

      // 'Jefe de Gestión' must have conditionLaboral set as 'Nombrado' to comply with backend business rules
      const condicionLaboral = 'Nombrado';

      const dto = {
        dni: formData.dni,
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        correo: formData.correo.trim() || undefined,
        telefono: formData.celular.trim() || undefined,
        especialidad: formData.especialidad?.trim() || 'General',
        nivelEducativo: formData.niveles.join(', '),
        rolCode,
        cargo,
        condicionLaboral,
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

  const updateEspecialista = async (id: string, formData: EspecialistaFormData) => {
    setLoading(true);
    setError(null);

    try {
      let rolCode = 'especialista';
      let cargo = 'Especialista';
      if (formData.rol === 'especialista_admin') {
        rolCode = 'jefe_gestion';
        cargo = 'Jefe de Gestión';
      } else if (formData.rol === 'especialista_bajo') {
        rolCode = 'jefe_area';
        cargo = 'Jefe de Área';
      }

      const condicionLaboral = 'Nombrado';

      const dto = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        correo: formData.correo.trim() || undefined,
        telefono: formData.celular.trim() || undefined,
        especialidad: formData.especialidad?.trim() || 'General',
        nivelEducativo: formData.niveles.join(', '),
        estado: formData.activo ?? true ? 'Activo' : 'Inactivo',
        rolCode,
        cargo,
        condicionLaboral,
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
