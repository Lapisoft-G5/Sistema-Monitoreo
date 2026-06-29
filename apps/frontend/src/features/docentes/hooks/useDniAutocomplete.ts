import { useEffect, useState } from 'react';
import { VALIDATION } from '@shared/config/constants';
import { teachersApi } from '@shared/api/teachers.api';

export interface PersonaRoles {
  esDocente: boolean;
  docenteInstitucionId: string | null;
  docenteNivelEducativo: string | null;
  docenteCargosActivos: string[];
  esDirector: boolean;
  esCoordinadorPedagogico: boolean;
  esJefeTaller: boolean;
  esDocenteAula: boolean;
  esEspecialista: boolean;
  especialistaCargoActivo: string | null;
  especialistaNivelEducativo: string | null;
  especialistaModalidad: string | null;
  especialistaEstado: string | null;
}

export interface PersonaAutocompleteData {
  id: string;
  dni: string;
  nombres: string;
  apellidos: string;
  correo: string | null;
  telefono: string | null;
  tieneUsuario: boolean;
  roles: PersonaRoles;
  docente?: {
    id: string;
    institucionId: string | null;
    nivelEducativo: string | null;
    condicionLaboral: string | null;
    escalaMagisterial: number | null;
    cargosActivos: string[];
    cursoAsignado?: string | null;
    especialidad?: string | null;
    institucion?: {
      id: string;
      nombre: string;
      codigoModular: string;
      nivel: string;
    };
  } | null;
}

export interface UseDniAutocompleteResult {
  data: PersonaAutocompleteData | null;
  isLoading: boolean;
  isFound: boolean;
  isLocked: boolean;
  message: string;
}

export const useDniAutocomplete = (dni: string, enabled = true): UseDniAutocompleteResult => {
  const [data, setData] = useState<PersonaAutocompleteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFound, setIsFound] = useState(false);

  useEffect(() => {
    if (!enabled) {
      const t = setTimeout(() => {
        setData(null);
        setIsFound(false);
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(t);
    }
    if (dni.length !== VALIDATION.DNI_LENGTH) {
      const t = setTimeout(() => {
        setData(null);
        setIsFound(false);
      }, 0);
      return () => clearTimeout(t);
    }

    let cancelled = false;
    setTimeout(() => setIsLoading(true), 0);
    (async () => {
      try {
        const res = await teachersApi.findByDni(dni);
        if (cancelled) return;
        if (res.ok && res.data) {
          const persona = res.data as PersonaAutocompleteData;
          setData(persona);
          setIsFound(true);
        } else {
          setData(null);
          setIsFound(false);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('[useDniAutocomplete] Error:', err);
        setData(null);
        setIsFound(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dni, enabled]);

  const isLocked = isFound;
  const message = isLoading
    ? 'Buscando...'
    : isFound && data
      ? 'Persona encontrada en el sistema. Datos personales autocompletados.'
      : '';

  return { data, isLoading, isFound, isLocked, message };
};
