export interface IForgotPasswordRequest {
  dni: string;
  email: string;
}

export interface IForgotPasswordResponse {
  success: boolean;
  message: string;
}
