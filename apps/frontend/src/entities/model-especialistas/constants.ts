import {
  CargoEspecialista,
  CondicionLaboralEspecialista,
  ModalidadEducativa,
  NivelEducativoEBR,
} from '@sistema-monitoreo/shared-contracts';

export const CARGOS_ESPECIALISTA = Object.values(CargoEspecialista);

export const CONDICIONES_ESPECIALISTA = CondicionLaboralEspecialista;

export const MODALIDADES_ESPECIALISTA = Object.values(ModalidadEducativa);

export const NIVELES_EBR = Object.values(NivelEducativoEBR);

export const NIVELES_INSTITUCION = NIVELES_EBR;

export const CARGO_COLORS: Record<string, string> = {
  'Jefe de Gestión': '#990537', // UGEL Primary Red
  Especialista: '#3b82f6', // Blue
  'Jefe de Área': '#22c55e', // Green
};
