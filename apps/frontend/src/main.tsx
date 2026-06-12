import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AppConfig } from './app/config';
import { router } from './app/routers';
import './index.css'; // Tus estilos globales de Tailwind

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppConfig>
      <RouterProvider router={router} />
    </AppConfig>
  </React.StrictMode>
);