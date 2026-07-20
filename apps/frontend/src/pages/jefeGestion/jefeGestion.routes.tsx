/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { LazyLoader } from '@shared/ui/LazyLoader';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';

const PlanMonitoreoPage = lazy(() =>
  import('./PlanMonitoreoPage').then((m) => ({ default: m.PlanMonitoreoPage })),
);
const PlanMonitoreoAnualPage = lazy(() =>
  import('./PlanMonitoreoAnualPage').then((m) => ({ default: m.PlanMonitoreoAnualPage })),
);
const CronogramaPage = lazy(() =>
  import('./CronogramaPage').then((m) => ({ default: m.CronogramaPage })),
);
const CalendarioPage = lazy(() =>
  import('./CalendarioPage').then((m) => ({ default: m.CalendarioPage })),
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
const SolicitudesVisitaPage = lazy(() =>
  import('./SolicitudesVisitaPage').then((m) => ({ default: m.SolicitudesVisitaPage })),
);
const GestionMonitoreoPage = lazy(() =>
  import('../director/GestionMonitoreoPage').then((m) => ({ default: m.GestionMonitoreoPage })),
);
const PlantillasPage = lazy(() =>
  import('./PlantillasPage').then((m) => ({ default: m.PlantillasPage })),
);
const PlantillaCreatePage = lazy(() =>
  import('./PlantillaCreatePage').then((m) => ({ default: m.PlantillaCreatePage })),
);
const PlantillaEditPage = lazy(() =>
  import('./PlantillaEditPage').then((m) => ({ default: m.PlantillaEditPage })),
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
    element: <ProtectedRoute permission="monitoreo_plan_anual" />,
    children: [
      {
        path: 'monitoreo/plan-anual',
        element: (
          <LazyLoader>
            <PlanMonitoreoAnualPage />
          </LazyLoader>
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute permission="monitoreo_cronograma" />,
    children: [
      {
        path: 'monitoreo/cronograma',
        element: (
          <LazyLoader>
            <CronogramaPage />
          </LazyLoader>
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute permission="monitoreo_calendario" />,
    children: [
      {
        path: 'monitoreo/calendario',
        element: (
          <LazyLoader>
            <CalendarioPage />
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
    element: <ProtectedRoute permission="solicitudes_visita" />,
    children: [
      {
        path: 'monitoreo/solicitudes-visita',
        element: (
          <LazyLoader>
            <SolicitudesVisitaPage />
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
  // Plantillas de Monitoreo (Jefe de Gestión)
  {
    element: <ProtectedRoute permission="plantillas" />,
    children: [
      {
        path: 'plantillas',
        element: (
          <LazyLoader>
            <PlantillasPage />
          </LazyLoader>
        ),
      },
      {
        path: 'plantillas/nuevo',
        element: (
          <LazyLoader>
            <PlantillaCreatePage />
          </LazyLoader>
        ),
      },
      {
        path: 'plantillas/:id/editar',
        element: (
          <LazyLoader>
            <PlantillaEditPage />
          </LazyLoader>
        ),
      },
    ],
  },
];
