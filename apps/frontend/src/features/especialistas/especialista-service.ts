import { useState } from 'react';
import type { Especialista } from '@entities/model-especialistas';
import { MOCK_ESPECIALISTAS } from '@entities/model-especialistas';
import type { EspecialistaFormData } from '@entities/model-especialistas/validator';

export const useEspecialistaService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEspecialista = async (formData: EspecialistaFormData) => {
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newEspecialista: Especialista = {
        id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        dni: formData.dni,
        correo: formData.correo.trim(),
        celular: formData.celular,
        especialidad: formData.especialidad?.trim() || '',
        rol: formData.rol,
        niveles: formData.niveles,
        activo: formData.activo ?? true,
        fechaCreacion: new Date().toISOString().split('T')[0],
        cargaLaboral: formData.cargaLaboral,
      };

      MOCK_ESPECIALISTAS.push(newEspecialista);

      return { success: true, data: newEspecialista };
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
      await new Promise((resolve) => setTimeout(resolve, 800));

      const updatedEspecialista: Especialista = {
        id,
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        dni: formData.dni,
        correo: formData.correo.trim(),
        celular: formData.celular,
        especialidad: formData.especialidad?.trim() || '',
        rol: formData.rol,
        niveles: formData.niveles,
        activo: formData.activo ?? true,
        fechaCreacion: new Date().toISOString().split('T')[0],
        cargaLaboral: formData.cargaLaboral,
      };

      const index = MOCK_ESPECIALISTAS.findIndex((e) => e.id === id);
      if (index !== -1) {
        MOCK_ESPECIALISTAS[index] = updatedEspecialista;
      }

      return { success: true, data: updatedEspecialista };
    } catch (err) {
      setError('Error al actualizar el especialista.');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { createEspecialista, updateEspecialista, loading, error };
};
