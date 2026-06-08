export interface IChangePasswordRequest {
  newPassword: string;
}

export interface IChangePasswordResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
}
