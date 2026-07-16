/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { LazyLoader } from '@shared/ui/LazyLoader';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';

const DashboardPage = lazy(() =>
  import('./DashboardPage').then((m) => ({ default: m.DashboardPage })),
);

const InstitucionesPadronPage = lazy(() =>
  import('./InstitucionesPadronPage').then((m) => ({ default: m.InstitucionesPadronPage })),
);

export const directorUgelRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute permission="dashboard" />,
    children: [
      {
        path: 'dashboard',
        element: (
          <LazyLoader>
            <DashboardPage />
          </LazyLoader>
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute permission="instituciones_padron" />,
    children: [
      {
        path: 'instituciones/padron',
        element: (
          <LazyLoader>
            <InstitucionesPadronPage />
          </LazyLoader>
        ),
      },
    ],
  },
];
