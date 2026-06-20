import { useState, useCallback } from 'react';
import { planesMonitoreoApi } from '@shared/api/planes-monitoreo.api';
import type { IMonitoringPlanResponse } from '@sistema-monitoreo/shared-contracts';

export const usePlanesMonitoreo = () => {
  const [planes, setPlanes] = useState<IMonitoringPlanResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPlanes = useCallback(async (filters?: {
    search?: string;
    anioAcademico?: number;
    tipoEntidad?: string;
    estado?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await planesMonitoreoApi.findAll(filters);
      if (res.ok && res.data) {
        setPlanes(res.data);
      } else {
        setError('Error al cargar los planes de monitoreo.');
      }
    } catch (err) {
      setError('Error de conexión al cargar los planes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadPlan = async (data: {
    file: File;
    titulo: string;
    anioAcademico: number;
    tipoEntidad: 'UGEL' | 'IE';
  }) => {
    setActionLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('titulo', data.titulo);
      formData.append('anioAcademico', String(data.anioAcademico));
      formData.append('tipoEntidad', data.tipoEntidad);

      const res = await planesMonitoreoApi.create(formData);
      if (res.ok && res.data) {
        setPlanes((prev) => [res.data!, ...prev]);
        return { success: true, data: res.data };
      } else {
        const errMsg = (res.error as { message?: string })?.message || 'Error al registrar el plan de monitoreo.';
        setError(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (err) {
      setError('Error de conexión al subir el plan.');
      return { success: false, error: err };
    } finally {
      setActionLoading(false);
    }
  };

  const deletePlan = async (id: string) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await planesMonitoreoApi.delete(id);
      if (res.ok) {
        setPlanes((prev) => prev.filter((p) => p.id !== id));
        return { success: true };
      } else {
        const errMsg = (res.error as { message?: string })?.message || 'Error al eliminar el plan de monitoreo.';
        setError(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (err) {
      setError('Error de conexión al eliminar el plan.');
      return { success: false, error: err };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    planes,
    loading,
    error,
    actionLoading,
    fetchPlanes,
    uploadPlan,
    deletePlan,
  };
};
