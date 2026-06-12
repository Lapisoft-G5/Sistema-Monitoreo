import { type ReactNode } from 'react';
import { UserProvider } from '@entities/model-user';
import { setupFetchInterceptor } from '@shared/api/fetchInterceptor';

// 1. Activamos el interceptor global de red de la capa shared
setupFetchInterceptor();

interface AppConfigProps {
  children: ReactNode;
}

// 2. Creamos el contenedor de configuración y proveedores globales
export const AppConfig = ({ children }: AppConfigProps) => {
  return (
    <UserProvider>
      {/* Si a futuro agregas proveedores de temas (Shadcn) o de caché (React Query), irían aquí */}
      {children}
    </UserProvider>
  );
};