/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { LazyLoader } from '@shared/ui/LazyLoader';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';
import { InstitucionEditPage } from './InstitutionEditPage';
import { InstitutionDetailPage } from './InstitutionDetailPage';

// 🚀 1. Agregamos la importación perezosa (lazy) de la página de instituciones
const InstitucionesPage = lazy(() =>
  import('./institucionesPage').then((m) => ({ default: m.InstitucionesPage })),
);
const InstitucionCreatePage = lazy(() =>
  import('./InstitutionCreatePage').then((m) => ({ default: m.InstitucionCreatePage })),
);

const DirectoresPage = lazy(() =>
  import('../director/DocenteSwitchers').then((m) => ({ default: m.DocenteListSwitcher })),
);
const DocenteCreatePage = lazy(() =>
  import('../director/DocenteSwitchers').then((m) => ({ default: m.DocenteCreateSwitcher })),
);
const DocenteEditPage = lazy(() =>
  import('../director/DocenteSwitchers').then((m) => ({ default: m.DocenteEditSwitcher })),
);
const DocenteDetailPage = lazy(() =>
  import('../director/DocenteSwitchers').then((m) => ({ default: m.DocenteDetailSwitcher })),
);

const JefesGestionPage = lazy(() =>
  import('./JefesGestionPage').then((m) => ({ default: m.JefesGestionPage })),
);
const JefeGestionCreatePage = lazy(() =>
  import('./JefeGestionCreatePage').then((m) => ({ default: m.JefeGestionCreatePage })),
);
const JefeGestionEditPage = lazy(() =>
  import('./JefeGestionEditPage').then((m) => ({ default: m.JefeGestionEditPage })),
);
const JefeGestionDetailPage = lazy(() =>
  import('./JefeGestionDetailPage').then((m) => ({ default: m.JefeGestionDetailPage })),
);

export const adminRoutes: RouteObject[] = [
  // 🚀 2. Padrón de Instituciones
  {
    element: <ProtectedRoute permission="instituciones_padron" />,
    children: [
      {
        path: 'instituciones/padron',
        element: (
          <LazyLoader>
            <InstitucionesPage />
          </LazyLoader>
        ),
      },
      {
        path: 'instituciones/nuevo',
        element: (
          <LazyLoader>
            <InstitucionCreatePage />
          </LazyLoader>
        ),
      },
      {
        path: 'instituciones/:id/editar',
        element: (
          <LazyLoader>
            <InstitucionEditPage />
          </LazyLoader>
        ),
      },
      {
        path: 'instituciones/:id',
        element: (
          <LazyLoader>
            <InstitutionDetailPage />
          </LazyLoader>
        ),
      },
    ],
  },
  // 🚀 3. Padrón de Directores/Docentes
  {
    element: <ProtectedRoute permission="instituciones_docentes" />,
    children: [
      {
        path: 'instituciones/docentes',
        element: (
          <LazyLoader>
            <DirectoresPage />
          </LazyLoader>
        ),
      },
      {
        path: 'instituciones/docentes/nuevo',
        element: (
          <LazyLoader>
            <DocenteCreatePage />
          </LazyLoader>
        ),
      },
      {
        path: 'instituciones/docentes/:id/editar',
        element: (
          <LazyLoader>
            <DocenteEditPage />
          </LazyLoader>
        ),
      },
      {
        path: 'instituciones/docentes/:id',
        element: (
          <LazyLoader>
            <DocenteDetailPage />
          </LazyLoader>
        ),
      },
    ],
  },
  // 🚀 4. Padrón de Jefes de Gestión (Coordinadores)
  {
    element: <ProtectedRoute permission="instituciones_coordinadores" />,
    children: [
      {
        path: 'instituciones/coordinadores',
        element: (
          <LazyLoader>
            <JefesGestionPage />
          </LazyLoader>
        ),
      },
      {
        path: 'instituciones/coordinadores/nuevo',
        element: (
          <LazyLoader>
            <JefeGestionCreatePage />
          </LazyLoader>
        ),
      },
      {
        path: 'instituciones/coordinadores/:id/editar',
        element: (
          <LazyLoader>
            <JefeGestionEditPage />
          </LazyLoader>
        ),
      },
      {
        path: 'instituciones/coordinadores/:id',
        element: (
          <LazyLoader>
            <JefeGestionDetailPage />
          </LazyLoader>
        ),
      },
    ],
  },
];
