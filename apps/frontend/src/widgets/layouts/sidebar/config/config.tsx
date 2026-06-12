import {
  LayoutDashboard,
  Compass,
  School,
  GraduationCap,
  Users,
  Briefcase,
  BarChart3,
  Settings, 
} from 'lucide-react';
import type { MenuItem } from '@shared/constants/roles';

export interface MenuChild {
  id: MenuItem | string;
  label: string;
  path: string;
}

export interface MenuCategory {
  id: MenuItem | string;
  label: string;
  icon: React.ReactNode;
  path?: string; // Opcional si solo es un contenedor de hijos
  children: MenuChild[];
}

// Toda tu estructura de navegación centralizada
export const SIDEBAR_CONFIG: MenuCategory[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-[18px] w-[18px]" />,
    path: '/dashboard',
    children: [],
  },
  {
    id: 'monitoreo',
    label: 'Monitoreo',
    icon: <Compass className="h-[18px] w-[18px]" />,
    children: [
      { id: 'monitoreo_plan', label: 'Plan de Monitoreo', path: '/monitoreo/plan' },
      { id: 'monitoreo_gestion', label: 'Gestión de Monitoreo', path: '/monitoreo/gestion' },
      { id: 'monitoreo_reportes', label: 'Reportes', path: '/monitoreo/reportes' },
    ],
  },
  {
    id: 'instituciones_padron',
    label: 'Instituciones',
    icon: <School className="h-[18px] w-[18px]" />,
    path: '/instituciones/padron',
    children: [],
  },
  {
    id: 'instituciones_docentes',
    label: 'Docentes',
    icon: <GraduationCap className="h-[18px] w-[18px]" />,
    path: '/instituciones/docentes',
    children: [],
  },
  {
    id: 'especialistas',
    label: 'Especialistas',
    icon: <Users className="h-[18px] w-[18px]" />,
    path: '/especialistas',
    children: [],
  },
  {
    id: 'jefes_area', 
    label: 'Jefes de Área',
    icon: <Briefcase className="h-[18px] w-[18px]" />,
    path: '/jefes-area',
    children: [],
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: <BarChart3 className="h-[18px] w-[18px]" />,
    path: '/reportes',
    children: [],
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: <Settings className="h-[18px] w-[18px]" />,
    path: '/configuracion',
    children: [],
  },
];
