/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { LazyLoader } from '@shared/ui/LazyLoader';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';
import { InstitucionEditPage } from './InstitutionEditPage';
import { InstitutionDetailPage } from './InstitutionDetailPage';

// ── Instituciones ──
const InstitucionesPage = lazy(() =>
  import('./institucionesPage').then((m) => ({ default: m.InstitucionesPage })),
);
const InstitucionCreatePage = lazy(() =>
  import('./InstitutionCreatePage').then((m) => ({ default: m.InstitucionCreatePage })),
);

// ── Directores (Jefe de Área) → /instituciones/directores ──
const DirectoresPage = lazy(() =>
  import('./DirectoresPage').then((m) => ({ default: m.DirectoresPage })),
);
const DirectorCreatePage = lazy(() =>
  import('./DirectorCreatePage').then((m) => ({ default: m.DirectorCreatePage })),
);
const DirectorEditPage = lazy(() =>
  import('./DirectorEditPage').then((m) => ({ default: m.DirectorEditPage })),
);
const DirectorDetailPage = lazy(() =>
  import('./DirectorDetailPage').then((m) => ({ default: m.DirectorDetailPage })),
);

export const adminRoutes: RouteObject[] = [
  // Padrón de Instituciones
  {
    element: <ProtectedRoute permission="instituciones_padron" />,
    children: [
      { path: 'instituciones/padron', element: (<LazyLoader><InstitucionesPage /></LazyLoader>) },
      { path: 'instituciones/nuevo', element: (<LazyLoader><InstitucionCreatePage /></LazyLoader>) },
      { path: 'instituciones/:id/editar', element: (<LazyLoader><InstitucionEditPage /></LazyLoader>) },
      { path: 'instituciones/:id', element: (<LazyLoader><InstitutionDetailPage /></LazyLoader>) },
    ],
  },
  // Padrón de Directores (Jefe de Área)
  {
    element: <ProtectedRoute permission="instituciones_docentes" />,
    children: [
      { path: 'instituciones/directores', element: (<LazyLoader><DirectoresPage /></LazyLoader>) },
      { path: 'instituciones/directores/nuevo', element: (<LazyLoader><DirectorCreatePage /></LazyLoader>) },
      { path: 'instituciones/directores/:id/editar', element: (<LazyLoader><DirectorEditPage /></LazyLoader>) },
      { path: 'instituciones/directores/:id', element: (<LazyLoader><DirectorDetailPage /></LazyLoader>) },
    ],
  },
];
