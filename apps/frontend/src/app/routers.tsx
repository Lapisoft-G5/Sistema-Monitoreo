import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@widgets/layouts/';
import { LoginPage } from '@/pages/login/login';
import { adminRoutes } from '@/pages/jefeArea/jefeArea.routes';
import { coordinatorRoutes } from '@/pages/coordinador/coordinador.routes';
import { RootRedirect } from './RootRedirect';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />, 
    children: [
      { index: true, element: <RootRedirect /> },
      
      ...adminRoutes, 
      ...coordinatorRoutes,
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);