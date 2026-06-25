import { useState, useEffect, useCallback } from 'react';
import { VALIDATION } from '@shared/config/constants';
import { useDniAutocomplete } from '@features/docentes/hooks/useDniAutocomplete';
import { checkRoleConflict, type RolObjetivo } from '@shared/constants/roleValidation';
import type { PersonaAutocompleteData } from '@features/docentes/hooks/useDniAutocomplete';
import type { ZodError } from 'zod';

export function extractErrors(
  result: { success: boolean; error?: ZodError<unknown> },
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!result.success && result.error) {
    result.error.issues.forEach((issue) => {
      const path = String(issue.path[0]);
      if (!errors[path]) {
        errors[path] = issue.message;
      }
    });
  }
  return errors;
}

interface UsePersonFormOptions {
  dni: string;
  isNew: boolean;
  rolObjetivo: RolObjetivo;
  cargoObjetivo?: string;
  onValidSubmit: () => void;
  isLoading?: boolean;
  errors: Record<string, string>;
  setPersonaFields: (persona: PersonaAutocompleteData) => void;
  clearPersonaFields: () => void;
}

export interface UsePersonFormReturn {
  submitted: boolean;
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  persona: PersonaAutocompleteData | null;
  searchingDni: boolean;
  isDniLocked: boolean;
  dniMessage: string;
  dniBloqueadoPorRol: boolean;
  showRoleConfirm: boolean;
  setShowRoleConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: () => void;
  handleConfirmRole: () => void;
  dniOk: boolean;
  roleCheck: ReturnType<typeof checkRoleConflict>;
}

export function usePersonForm({
  dni,
  isNew,
  rolObjetivo,
  cargoObjetivo,
  onValidSubmit,
  isLoading = false,
  errors,
  setPersonaFields,
  clearPersonaFields,
}: UsePersonFormOptions): UsePersonFormReturn {
  const [submitted, setSubmitted] = useState(false);
  const [showRoleConfirm, setShowRoleConfirm] = useState(false);

  const { data: persona, isLoading: searchingDni, isLocked: isDniLocked, message: dniMessage } =
    useDniAutocomplete(dni, isNew);

  const roleCheck = checkRoleConflict(persona, rolObjetivo, cargoObjetivo);
  const dniBloqueadoPorRol = roleCheck.bloquea;

  useEffect(() => {
    if (persona) {
      const t = setTimeout(() => {
        setPersonaFields(persona);
      }, 0);
      return () => clearTimeout(t);
    }
    if (!searchingDni && dni.length === VALIDATION.DNI_LENGTH && !persona) {
      const t = setTimeout(() => {
        clearPersonaFields();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [persona, searchingDni, dni, setPersonaFields, clearPersonaFields]);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0 || isLoading) return;
    if (dniBloqueadoPorRol) return;
    if (roleCheck.advierte && !dniBloqueadoPorRol) {
      setShowRoleConfirm(true);
      return;
    }
    onValidSubmit();
  }, [errors, isLoading, dniBloqueadoPorRol, roleCheck, onValidSubmit]);

  const handleConfirmRole = useCallback(() => {
    setShowRoleConfirm(false);
    onValidSubmit();
  }, [onValidSubmit]);

  const dniOk = dni.length === VALIDATION.DNI_LENGTH && /^\d+$/.test(dni);

  return {
    submitted,
    setSubmitted,
    persona,
    searchingDni,
    isDniLocked,
    dniMessage,
    dniBloqueadoPorRol,
    showRoleConfirm,
    setShowRoleConfirm,
    handleSubmit,
    handleConfirmRole,
    dniOk,
    roleCheck,
  };
}
