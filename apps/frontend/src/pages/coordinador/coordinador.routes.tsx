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
const ReportesPage = lazy(() =>
  import('./ReportesPage').then((m) => ({ default: m.ReportesPage })),
);

export const coordinatorRoutes: RouteObject[] = [
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
