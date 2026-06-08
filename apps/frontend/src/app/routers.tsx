import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@widgets/layouts/';
import { LoginPage } from '@/pages/login/login';
import { adminRoutes } from '@/pages/jefeArea/jefeArea.routes';
import { coordinatorRoutes } from '@/pages/coordinador/coordinador.routes';
import { especialistaRoutes } from '@/pages/especialista/especialista.routes';
import { directorUgelRoutes } from '@/pages/directorUgel/directorUgel.routes';
import { RootRedirect } from './RootRedirect';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />, 
    children: [
      { index: true, element: <RootRedirect /> },
      
      ...directorUgelRoutes,
      ...adminRoutes, 
      ...coordinatorRoutes,
      ...especialistaRoutes,
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);