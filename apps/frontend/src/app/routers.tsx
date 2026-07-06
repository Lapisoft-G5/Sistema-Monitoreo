import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@widgets/layouts/';
import { LoginPage } from '@/pages/login/login';
import { ForgotPasswordPage } from '@/pages/login/passwordForgotte';
import { ResetPasswordPage } from '@/pages/login/resetPassword';

import { adminRoutes } from '@/pages/jefeArea/jefeArea.routes';
import { jefeGestionRoutes } from '@/pages/jefeGestion/jefeGestion.routes';
import { especialistaRoutes } from '@/pages/especialista/especialista.routes';
import { directorUgelRoutes } from '@/pages/directorUgel/directorUgel.routes';
import { RootRedirect } from './RootRedirect';
import { SuperadminPanel } from '@/pages/superadmin/SuperadminPanel';
import { SuperadminCreatePage } from '@/pages/superadmin/SuperadminCreatePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <RootRedirect /> },

      ...directorUgelRoutes,
      ...adminRoutes,
      ...jefeGestionRoutes,
      ...especialistaRoutes,
      {
        path: 'superadmin',
        children: [
          { path: 'director', element: <SuperadminPanel targetRole="director_ugel" /> },
          { path: 'director/nuevo', element: <SuperadminCreatePage targetRole="director_ugel" /> },
          { path: 'jefe', element: <SuperadminPanel targetRole="jefe_gestion" /> },
        ]
      }
    ],
  },

  { path: '/login', element: <LoginPage /> },
  { path: '/recuperar-password', element: <ForgotPasswordPage /> },
  { path: '/restablecer-password', element: <ResetPasswordPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);
