import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@widgets/layouts/';
import { LoginPage } from '@/pages/login/login';
import { adminRoutes } from '@/pages/jefeArea/jefeArea.routes';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />, 
    children: [
      { index: true, element: <Navigate to="/instituciones/padron" replace /> },
      
      ...adminRoutes, 
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);