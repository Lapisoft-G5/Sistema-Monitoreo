import { useState } from 'react';
import type { Docente } from '@entities/model-docentes';
import { MOCK_DOCENTES } from '@entities/model-docentes';
import type { DocenteFormData } from '@entities/model-docentes/validator';

export const useDocenteService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDocente = async (formData: DocenteFormData) => {
    setLoading(true);
    setError(null);

    try {
      // Simulamos latencia de red
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newDocente: Docente = {
        id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        dni: formData.dni,
        correo: formData.correo.trim(),
        celular: formData.celular,
        nivelEducativo: formData.nivelEducativo,
        condicion: formData.condicion,
        especialidad: formData.especialidad.trim(),
        cargaHoraria: Number(formData.cargaHoraria),
        secciones: formData.secciones.map((s) => ({
          id: s.id || (globalThis.crypto?.randomUUID?.() ?? String(Math.random())),
          grado: s.grado.trim(),
        })),
        escala: formData.escala,
        institucionId: formData.institucionId,
        activo: formData.activo ?? true,
        fechaCreacion: new Date().toISOString().split('T')[0],
        cargo: formData.cargo,
      };

      // Persistencia en memoria mutando la lista mock
      MOCK_DOCENTES.push(newDocente);

      return { success: true, data: newDocente };
    } catch (err) {
      setError('Error al registrar el docente.');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateDocente = async (id: string, formData: DocenteFormData) => {
    setLoading(true);
    setError(null);

    try {
      // Simulamos latencia de red
      await new Promise((resolve) => setTimeout(resolve, 800));

      const updatedDocente: Docente = {
        id,
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        dni: formData.dni,
        correo: formData.correo.trim(),
        celular: formData.celular,
        nivelEducativo: formData.nivelEducativo,
        condicion: formData.condicion,
        especialidad: formData.especialidad.trim(),
        cargaHoraria: Number(formData.cargaHoraria),
        secciones: formData.secciones.map((s) => ({
          id: s.id || (globalThis.crypto?.randomUUID?.() ?? String(Math.random())),
          grado: s.grado.trim(),
        })),
        escala: formData.escala,
        institucionId: formData.institucionId,
        activo: formData.activo ?? true,
        fechaCreacion: new Date().toISOString().split('T')[0], // Mantiene la actual en escenario real
        cargo: formData.cargo,
      };

      // Persistencia en memoria mutando la lista mock
      const index = MOCK_DOCENTES.findIndex((d) => d.id === id);
      if (index !== -1) {
        MOCK_DOCENTES[index] = updatedDocente;
      }

      return { success: true, data: updatedDocente };
    } catch (err) {
      setError('Error al actualizar el registro del docente.');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { createDocente, updateDocente, loading, error };
};
