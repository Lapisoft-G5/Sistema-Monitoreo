export interface IResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface IResetPasswordResponse {
  success: boolean;
  message: string;
}
