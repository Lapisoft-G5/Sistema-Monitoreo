export const BREADCRUMBS_MAP: Record<string, string> = {
  '/dashboard': 'Panel de Control',
  '/monitoreo/plan': 'Plan de Monitoreo',
  '/monitoreo/gestion': 'Gestión de Monitoreo',
  '/instituciones/docentes': 'Padrón de Docentes', // Más específico primero
  '/instituciones': 'Padrón de Instituciones',
  '/especialistas': 'Especialistas',
  '/reportes': 'Reportes',
  '/configuracion': 'Configuración',
};

export const getPageTitle = (pathname: string): string => {
  // 1. Búsqueda exacta
  if (BREADCRUMBS_MAP[pathname]) return BREADCRUMBS_MAP[pathname];
  
  // 2. Búsqueda parcial (útil para rutas como /docentes/123/editar)
  // Ordenamos por longitud para que coincida primero con la ruta más larga
  const matchedKey = Object.keys(BREADCRUMBS_MAP)
    .sort((a, b) => b.length - a.length)
    .find((key) => pathname.startsWith(key));
    
  return matchedKey ? BREADCRUMBS_MAP[matchedKey] : 'UGEL Lampa';
};