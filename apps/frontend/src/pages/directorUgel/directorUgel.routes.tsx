/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { LazyLoader } from '@shared/ui/LazyLoader';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';

const DashboardEntry = lazy(() =>
  import('../DashboardEntry').then((m) => ({ default: m.DashboardEntry })),
);

const SemaforoInstitucionalPage = lazy(() =>
  import('./SemaforoInstitucionalPage').then((m) => ({ default: m.SemaforoInstitucionalPage })),
);

export const directorUgelRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute permission="dashboard" />,
    children: [
      {
        path: 'dashboard',
        element: (
          <LazyLoader>
            <DashboardEntry />
          </LazyLoader>
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute permission="instituciones_semaforo" />,
    children: [
      {
        path: 'instituciones/semaforo',
        element: (
          <LazyLoader>
            <SemaforoInstitucionalPage />
          </LazyLoader>
        ),
      },
    ],
  },
];
