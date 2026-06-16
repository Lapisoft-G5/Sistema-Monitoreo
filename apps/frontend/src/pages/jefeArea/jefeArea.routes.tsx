/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { LazyLoader } from '@shared/ui/LazyLoader';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';

// ── Instituciones ──
const InstitucionesPage = lazy(() =>
  import('./institucionesPage').then((m) => ({ default: m.InstitucionesPage })),
);
const InstitucionCreatePage = lazy(() =>
  import('./InstitutionCreatePage').then((m) => ({ default: m.InstitucionCreatePage })),
);
const InstitucionEditPage = lazy(() =>
  import('./InstitutionEditPage').then((m) => ({ default: m.InstitucionEditPage })),
);
const InstitutionDetailPage = lazy(() =>
  import('./InstitutionDetailPage').then((m) => ({ default: m.InstitutionDetailPage })),
);

// ── Directores / Docentes (Usando Switchers para soportar tanto Jefe de Área como Director de IE) ──
const DocenteListPage = lazy(() =>
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
const CoordinadorListPage = lazy(() =>
  import('../director/DocenteSwitchers').then((m) => ({ default: m.CoordinadorSwitcher })),
);
const CoordinadorCreatePage = lazy(() =>
  import('../director/DocenteSwitchers').then((m) => ({ default: m.CoordinadorCreateSwitcher })),
);
const JefesTallerPage = lazy(() =>
  import('../director/JefesTallerPage').then((m) => ({ default: m.JefesTallerPage })),
);
const JefeTallerAssignPage = lazy(() =>
  import('../director/JefeTallerAssignPage').then((m) => ({ default: m.JefeTallerAssignPage })),
);

// ── Jefes de Área (Tus nuevas páginas creadas) ──
const JefesAreaPage = lazy(() =>
  import('../jefeGestion/JefesAreaPage').then((m) => ({ default: m.JefesAreaPage })),
);
const JefeAreaCreatePage = lazy(() =>
  import('../jefeGestion/JefeAreaCreatePage').then((m) => ({ default: m.JefeAreaCreatePage })),
);
const JefeAreaEditPage = lazy(() =>
  import('../jefeGestion/JefeAreaEditPage').then((m) => ({ default: m.JefeAreaEditPage })),
);
const JefeAreaDetailPage = lazy(() =>
  import('../jefeGestion/JefeAreaDetailPage').then((m) => ({ default: m.JefeAreaDetailPage })),
);

export const adminRoutes: RouteObject[] = [
  // Padrón de Instituciones
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
  // Padrón de Directores / Docentes
  {
    element: <ProtectedRoute permission="instituciones_docentes" />,
    children: [
      {
        path: 'instituciones/docentes',
        element: (
          <LazyLoader>
            <DocenteListPage />
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
  // Padrón de Jefes de Gestión (Coordinadores) apuntados temporalmente a JefesArea para que compile sin archivos perdidos
  {
    element: <ProtectedRoute permission="instituciones_coordinadores" />,
    children: [
      {
        path: 'instituciones/coordinadores',
        element: (
          <LazyLoader>
            <CoordinadorListPage />
          </LazyLoader>
        ),
      },
      {
        path: 'instituciones/coordinadores/nuevo',
        element: (
          <LazyLoader>
            <CoordinadorCreatePage />
          </LazyLoader>
        ),
      },
      {
        path: 'instituciones/coordinadores/:id/editar',
        element: (
          <LazyLoader>
            <JefeAreaEditPage />
          </LazyLoader>
        ),
      },
      {
        path: 'instituciones/coordinadores/:id',
        element: (
          <LazyLoader>
            <JefeAreaDetailPage />
          </LazyLoader>
        ),
      },
    ],
  },
  // Padrón de Jefes de Taller
  {
    element: <ProtectedRoute permission="instituciones_jefes_taller" />,
    children: [
      {
        path: 'instituciones/jefes-taller',
        element: (
          <LazyLoader>
            <JefesTallerPage />
          </LazyLoader>
        ),
      },
      {
        path: 'instituciones/jefes-taller/nuevo',
        element: (
          <LazyLoader>
            <JefeTallerAssignPage />
          </LazyLoader>
        ),
      },
    ],
  },
  // Bloque de Jefes de Área con CRUD Completo
  {
    element: <ProtectedRoute permission="jefes_area" />,
    children: [
      {
        path: 'jefes-area',
        element: (
          <LazyLoader>
            <JefesAreaPage />
          </LazyLoader>
        ),
      },
      {
        path: 'jefes-area/nuevo',
        element: (
          <LazyLoader>
            <JefeAreaCreatePage />
          </LazyLoader>
        ),
      },
      {
        path: 'jefes-area/:id/editar',
        element: (
          <LazyLoader>
            <JefeAreaEditPage />
          </LazyLoader>
        ),
      },
      {
        path: 'jefes-area/:id',
        element: (
          <LazyLoader>
            <JefeAreaDetailPage />
          </LazyLoader>
        ),
      },
    ],
  },
];
