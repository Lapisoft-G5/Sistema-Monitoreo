/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { LazyLoader } from '@shared/ui/LazyLoader';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';

const PlanMonitoreoPage = lazy(() =>
  import('./PlanMonitoreoPage').then((m) => ({ default: m.PlanMonitoreoPage })),
);
const EspecialistasPage = lazy(() =>
  import('./EspecialistasPage').then((m) => ({ default: m.EspecialistasPage })),
);
const EspecialistaCreatePage = lazy(() =>
  import('./EspecialistaCreatePage').then((m) => ({ default: m.EspecialistaCreatePage })),
);
const EspecialistaEditPage = lazy(() =>
  import('./EspecialistaEditPage').then((m) => ({ default: m.EspecialistaEditPage })),
);
const EspecialistaDetailPage = lazy(() =>
  import('./EspecialistaDetailPage').then((m) => ({ default: m.EspecialistaDetailPage })),
);
const ReportesPage = lazy(() =>
  import('./ReportesPage').then((m) => ({ default: m.ReportesPage })),
);
const GestionMonitoreoPage = lazy(() =>
  import('../director/GestionMonitoreoPage').then((m) => ({ default: m.GestionMonitoreoPage })),
);

export const jefeGestionRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute permission="monitoreo_plan" />,
    children: [
      {
        path: 'monitoreo/plan',
        element: (
          <LazyLoader>
            <PlanMonitoreoPage />
          </LazyLoader>
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute permission="monitoreo_gestion" />,
    children: [
      {
        path: 'monitoreo/gestion',
        element: (
          <LazyLoader>
            <GestionMonitoreoPage />
          </LazyLoader>
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute permission="especialistas" />,
    children: [
      {
        path: 'especialistas',
        element: (
          <LazyLoader>
            <EspecialistasPage />
          </LazyLoader>
        ),
      },
      {
        path: 'especialistas/nuevo',
        element: (
          <LazyLoader>
            <EspecialistaCreatePage />
          </LazyLoader>
        ),
      },
      {
        path: 'especialistas/:id/editar',
        element: (
          <LazyLoader>
            <EspecialistaEditPage />
          </LazyLoader>
        ),
      },
      {
        path: 'especialistas/:id',
        element: (
          <LazyLoader>
            <EspecialistaDetailPage />
          </LazyLoader>
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute permission="reportes" />,
    children: [
      {
        path: 'reportes',
        element: (
          <LazyLoader>
            <ReportesPage />
          </LazyLoader>
        ),
      },
    ],
  },
];
