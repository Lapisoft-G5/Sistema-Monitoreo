import type { ICreateInstitucionRequest } from './create-institucion.contract.js';

export type IUpdateInstitucionRequest = Partial<Omit<ICreateInstitucionRequest, 'codigoModular'>>;

export interface IUpdateInstitucionResponse {
  success: boolean;
  message: string;
}
