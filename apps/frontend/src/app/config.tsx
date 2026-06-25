import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from '@entities/model-user';
import { setupFetchInterceptor } from '@shared/api/fetchInterceptor';

// 1. Activamos el interceptor global de red de la capa shared
setupFetchInterceptor();

// 2. Cliente de TanStack Query (cache, retries, deduplicacion de requests)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

interface AppConfigProps {
  children: ReactNode;
}

// 3. Creamos el contenedor de configuración y proveedores globales
export const AppConfig = ({ children }: AppConfigProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        {children}
      </UserProvider>
    </QueryClientProvider>
  );
};
