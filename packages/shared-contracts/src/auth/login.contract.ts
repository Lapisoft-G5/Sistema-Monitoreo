export interface ILoginRequest {
  dni: string;
  password: string;
}

export interface ILoginResponse {
  accessToken: string;
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

