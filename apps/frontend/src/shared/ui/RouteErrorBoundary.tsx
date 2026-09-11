import { useEffect } from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import { isChunkLoadError, reloadForNewVersion } from '@shared/lib/chunk-reload';
import { Button } from './button';
import { Card, CardContent } from './card';

export const RouteErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const isChunkError = isChunkLoadError(error);

  useEffect(() => {
    if (isChunkError) {
      reloadForNewVersion();
    }
  }, [isChunkError]);

  const errorMessage =
    error instanceof Error
      ? error.message
      : isRouteErrorResponse(error)
        ? `${error.status} ${error.statusText}`
        : 'Ocurrió un error inesperado al procesar la solicitud.';

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center p-4">
      <Card className="max-w-md w-full border border-border shadow-md">
        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-text">
              {isChunkError ? 'Actualización del Sistema' : 'Ocurrió un problema'}
            </h2>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">
              {isChunkError
                ? 'Se ha detectado una nueva versión del sistema tras un despliegue reciente. Por favor, recargue la página para sincronizar los cambios.'
                : errorMessage}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-2">
            {!isChunkError && (
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Ir al Inicio</span>
              </Button>
            )}
            <Button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 text-xs font-semibold px-5 py-2.5 bg-primary text-white hover:bg-primary/90 cursor-pointer rounded-xl shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recargar Página</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
