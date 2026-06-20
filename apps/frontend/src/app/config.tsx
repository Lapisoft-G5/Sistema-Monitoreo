import { type ReactNode } from 'react';
import { UserProvider } from '@entities/model-user';
import { CronogramaProvider } from '@entities/model-cronogramas';
import { PlantillasProvider } from '@entities/model-plantillas';
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
      <CronogramaProvider>
        <PlantillasProvider>
          {/* Si a futuro agregas proveedores de temas (Shadcn) o de caché (React Query), irían aquí */}
          {children}
        </PlantillasProvider>
      </CronogramaProvider>
    </UserProvider>
  );
};

