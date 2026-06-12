/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { LazyLoader } from '@shared/ui/LazyLoader';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';

const ReportesMonitoreoPage = lazy(() =>
  import('./ReportesMonitoreoPage').then((m) => ({ default: m.ReportesMonitoreoPage })),
);

export const especialistaRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute permission="monitoreo_reportes" />,
    children: [
      {
        path: 'monitoreo/reportes',
        element: (
          <LazyLoader>
            <ReportesMonitoreoPage />
          </LazyLoader>
        ),
      },
    ],
  },
];
