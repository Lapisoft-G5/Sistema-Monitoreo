/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { LazyLoader } from '@shared/ui/LazyLoader';
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
  import('./DirectoresPage').then((m) => ({ default: m.DirectoresPage })),
);
const DocenteCreatePage = lazy(() =>
  import('./DocenteCreatePage').then((m) => ({ default: m.DocenteCreatePage })),
);
const DocenteEditPage = lazy(() =>
  import('./DocenteEditPage').then((m) => ({ default: m.DocenteEditPage })),
);
const DocenteDetailPage = lazy(() =>
  import('./DocenteDetailPage').then((m) => ({ default: m.DocenteDetailPage })),
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
  // 🚀 2. Declaramos la ruta base para el Padrón de Instituciones
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
  // 🚀 3. Declaramos las rutas para el Padrón de Directores/Docentes
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
  // 🚀 4. Declaramos las rutas para el Padrón de Jefes de Gestión (Coordinadores)
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
];
