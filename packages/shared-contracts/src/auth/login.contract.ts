export interface ILoginRequest {
  dni: string;
  password: string;
}

export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    dni: string;
    nombres: string;
    apellidos: string;
    role: string;
    institucion?: string;
    distrito?: string;
    firstLogin: boolean;
  };
}

export interface ILoginError {
  message?: string;
  failedLoginAttempts?: number;
  lockedUntil?: string;
  failedAttempts?: number;
  remainingAttempts?: number;
}

