import { useState, useCallback } from 'react';
import { planesMonitoreoApi } from '@shared/api/planes-monitoreo.api';
import type { IMonitoringPlanResponse } from '@sistema-monitoreo/shared-contracts';

export const getArchivoPlanUrl = (planId: string): string => {
  return planesMonitoreoApi.archivoUrl(planId);
};

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
      const data = await planesMonitoreoApi.findAll(filters);
      setPlanes(data);
    } catch (err) {
      setError('Error al cargar los planes de monitoreo.');
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
    estado?: 'Activo' | 'Inactivo';
  }) => {
    setActionLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('titulo', data.titulo);
      formData.append('anioAcademico', String(data.anioAcademico));
      formData.append('tipoEntidad', data.tipoEntidad);
      if (data.estado) {
        formData.append('estado', data.estado);
      }

      const plan = await planesMonitoreoApi.create(formData);
      setPlanes((prev) => [plan, ...prev]);
      return { success: true, data: plan };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Error al registrar el plan de monitoreo.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setActionLoading(false);
    }
  };

  const toggleEstado = async (id: string) => {
    setActionLoading(true);
    setError(null);
    try {
      const plan = await planesMonitoreoApi.toggleEstado(id);
      setPlanes((prev) => prev.map((p) => (p.id === id ? plan : p)));
      return { success: true, data: plan };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Error al cambiar el estado del plan.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setActionLoading(false);
    }
  };

  const hardDeletePlan = async (id: string) => {
    setActionLoading(true);
    setError(null);
    try {
      await planesMonitoreoApi.hardDelete(id);
      setPlanes((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Error al eliminar el plan.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setActionLoading(false);
    }
  };

  const viewPlanPdf = async (id: string) => {
    setActionLoading(true);
    setError(null);
    try {
      const blob = await planesMonitoreoApi.downloadArchivo(id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      // No revoke the URL immediately because the new tab needs to load it
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Error al obtener el documento.';
      setError(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  return { planes, loading, error, actionLoading, fetchPlanes, uploadPlan, toggleEstado, hardDeletePlan, viewPlanPdf };
};
