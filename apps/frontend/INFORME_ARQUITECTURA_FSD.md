# 🏗️ Informe de Arquitectura y Estructura FSD (Feature-Sliced Design)

Este informe proporciona una descripción concisa de cada carpeta y archivo dentro de la estructura de código del frontend (`src/`), validando el cumplimiento del estándar arquitectónico **Feature-Sliced Design (FSD)**.

---

## 🗺️ Estructura General de Capas en FSD
El proyecto se organiza estrictamente en las 6 capas definidas por FSD, ordenadas en una jerarquía de dependencia unidireccional (de arriba hacia abajo):
1. **`app`**: Inicialización del sistema, enrutadores globales, estilos generales y proveedores de contexto.
2. **`pages`**: Vistas completas del sistema. Son composiciones "delgadas" que agrupan widgets y features.
3. **`widgets`**: Componentes grandes e independientes de la UI (tablas complejas, cabeceras, barras de navegación).
4. **`features`**: Funcionalidades interactivas que aportan valor de negocio al usuario (formularios, modales interactivos).
5. **`entities`**: Unidades de negocio del dominio (Modelos de datos, Badges simples, Mocks).
6. **`shared`**: Recursos y componentes puramente tecnológicos y reutilizables sin lógica de negocio.

---

## 📂 Inventario Conciso de Archivos por Carpeta

### 1. Capa: `app/` (Aplicación)
*Configura la infraestructura global del cliente frontend.*
- **[src/app/App.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/app/App.tsx)**: Componente raíz de React que monta la aplicación y envuelve los proveedores globales (Router, AuthProvider).
- **[src/app/AppShell.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/app/AppShell.tsx)**: Layout general del panel de control. Ensambla el Sidebar y TopBar alrededor del área de visualización principal.
- **[src/app/routes.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/app/routes.tsx)**: Definición y centralización de todas las rutas del sistema, importando las páginas desde la capa `pages/`.
- **`app/providers/`**: Proveedores de contextos globales de React.
  - **[AuthProvider.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/app/providers/AuthProvider.tsx)**: Maneja el estado global de la sesión (login, logout, cookies y roles).
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/app/providers/index.ts)**: API Pública para exponer los proveedores de forma controlada.

---

### 2. Capa: `pages/` (Páginas)
*Composiciones puras y "delgadas" de interfaz. Contienen la estructura de enrutamiento y cargan widgets.*
- **`pages/administration/`**: Administración de Docentes y Especialistas.
  - **[DocenteCreatePage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/administration/DocenteCreatePage.tsx)**: Composición para registrar un docente nuevo.
  - **[DocenteDetailPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/administration/DocenteDetailPage.tsx)**: Composición para visualizar el expediente completo del docente.
  - **[DocenteEditPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/administration/DocenteEditPage.tsx)**: Composición para la edición de datos de un docente.
  - **[DocentesPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/administration/DocentesPage.tsx)**: Renderiza el listado interactivo de docentes.
  - **[EspecialistaCreatePage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/administration/EspecialistaCreatePage.tsx)**: Composición para registrar un especialista pedagógico.
  - **[EspecialistaDetailPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/administration/EspecialistaDetailPage.tsx)**: Composición para ver la ficha detallada del especialista.
  - **[EspecialistaEditPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/administration/EspecialistaEditPage.tsx)**: Composición para la modificación de especialistas.
  - **[EspecialistasPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/administration/EspecialistasPage.tsx)**: Renderiza la tabla completa de especialistas de la UGEL.
  - **[admin.routes.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/administration/admin.routes.tsx)**: Definición de rutas del módulo administrativo con guardas de rol.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/administration/index.ts)**: API Pública que exporta las rutas del módulo.
- **`pages/auth/`**: Flujo de Autenticación y Credenciales.
  - **[LoginPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/auth/LoginPage.tsx)**: Página de inicio de sesión de usuario.
  - **[ForgotPasswordPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/auth/ForgotPasswordPage.tsx)**: Solicitud de recuperación de contraseña por correo.
  - **[ResetPasswordPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/auth/ResetPasswordPage.tsx)**: Establecimiento de nueva contraseña vía token.
  - **[ChangePasswordPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/auth/ChangePasswordPage.tsx)**: Obliga al usuario a cambiar su contraseña genérica en su primer inicio de sesión.
  - **[AuthRouter.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/auth/AuthRouter.tsx)**: Enrutador del flujo de login y recuperación.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/auth/index.ts)**: API Pública de autenticación.
- **`pages/dashboard/`**: Panel de Control Principal.
  - **[DashboardPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/dashboard/DashboardPage.tsx)**: Ensamblador de los widgets del panel principal (estadísticas, mapa interactivo, feed).
  - **[dashboard.routes.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/dashboard/dashboard.routes.tsx)**: Enrutamiento del dashboard.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/dashboard/index.ts)**: API Pública.
- **`pages/institutions/`**: Gestión de Colegios (Padrón Oficial).
  - **[InstitutionsPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/institutions/InstitutionsPage.tsx)**: Renderiza el listado principal de colegios.
  - **[InstitutionCreatePage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/institutions/InstitutionCreatePage.tsx)**: Composición para añadir una nueva I.E. al padrón.
  - **[InstitutionEditPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/institutions/InstitutionEditPage.tsx)**: Composición para editar datos de una I.E.
  - **[InstitutionDetailPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/institutions/InstitutionDetailPage.tsx)**: Detalle del perfil completo de un colegio.
  - **[institutions.routes.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/institutions/institutions.routes.tsx)**: Definición de rutas del padrón escolar.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/institutions/index.ts)**: API Pública.
- **`pages/monitoring/`**: Rutas de Ejecución de Monitoreo.
  - **[monitoring.routes.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/monitoring/monitoring.routes.tsx)**: Rutas del módulo de visitas de monitoreo.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/monitoring/index.ts)**: API Pública.
- **`pages/reports/`**: Rutas de Reportes Estadísticos.
  - **[reports.routes.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/reports/reports.routes.tsx)**: Rutas de reportes y descargas.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/reports/index.ts)**: API Pública.
- **`pages/settings/`**: Configuración General del Sistema.
  - **[settings.routes.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/settings/settings.routes.tsx)**: Rutas del panel de configuración.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/settings/index.ts)**: API Pública.

---

### 3. Capa: `widgets/` (Widgets)
*Componentes autónomos complejos de la interfaz. Combinan entidades y disparan features.*
- **`widgets/sidebar/`**: Navegación de la Aplicación.
  - **[ui/Sidebar.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/sidebar/ui/Sidebar.tsx)**: Barra lateral de menús, enlaces de navegación y datos institucionales.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/sidebar/index.ts)**: API Pública.
- **`widgets/topbar/`**: Acciones Superiores.
  - **[ui/TopBar.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/topbar/ui/TopBar.tsx)**: Barra superior con menú de usuario, alertas e indicador de estado de red (online/offline).
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/topbar/index.ts)**: API Pública.
- **`widgets/institution-list/`**: Listado de Colegios.
  - **[ui/InstitutionList.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/institution-list/ui/InstitutionList.tsx)**: Tabla interactiva con filtros, buscador, paginador y tarjetas de KPIs del padrón escolar.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/institution-list/index.ts)**: API Pública.
- **`widgets/teacher-list/`**: Listado de Docentes.
  - **[ui/TeacherList.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/teacher-list/ui/TeacherList.tsx)**: Tabla con paginación, filtros de especialidad y cargos para los docentes.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/teacher-list/index.ts)**: API Pública.
- **`widgets/specialist-list/`**: Listado de Especialistas.
  - **[ui/SpecialistList.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/specialist-list/ui/SpecialistList.tsx)**: Tabla con asignaciones de nivel y estado para el personal de UGEL Lampa.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/specialist-list/index.ts)**: API Pública.
- **`widgets/institution-profile/`**: Expediente Escolar.
  - **[ui/InstitutionProfileWidget.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/institution-profile/ui/InstitutionProfileWidget.tsx)**: Compila y renderiza toda la información técnica, localización y directiva de un colegio.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/institution-profile/index.ts)**: API Pública.
- **`widgets/teacher-profile/`**: Expediente del Docente.
  - **[ui/DocenteProfileWidget.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/teacher-profile/ui/DocenteProfileWidget.tsx)**: Compila datos personales, de contrato y secciones asignadas al docente.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/teacher-profile/index.ts)**: API Pública.
- **`widgets/specialist-profile/`**: Expediente del Especialista.
  - **[ui/EspecialistaProfileWidget.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/specialist-profile/ui/EspecialistaProfileWidget.tsx)**: Compila datos informativos y niveles a cargo del especialista.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/specialist-profile/index.ts)**: API Pública.
- **`widgets/dashboard/`**: Componentes del Panel Central.
  - **[ui/DashboardStats.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/dashboard/ui/DashboardStats.tsx)**: Tarjetas de estadísticas generales de monitoreo.
  - **[ui/DashboardEvaluations.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/dashboard/ui/DashboardEvaluations.tsx)**: Gráficos e indicadores de metas de monitoreo.
  - **[ui/DashboardMap.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/dashboard/ui/DashboardMap.tsx)**: Mapa vectorial interactivo (Lampa) para monitoreo geográfico.
  - **[ui/RecentMonitorings.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/dashboard/ui/RecentMonitorings.tsx)**: Listado con las visitas pedagógicas más recientes.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/widgets/dashboard/index.ts)**: API Pública del dashboard.

---

### 4. Capa: `features/` (Funcionalidades / Features)
*Acciones interactivas del usuario con lógica de negocio y mutación de estado.*
- **`features/authentication/`**: Control de Acceso.
  - **[ui/LoginForm.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/features/authentication/ui/LoginForm.tsx)**: Formulario interactivo de login con validaciones de campos y estados de carga.
  - **[ui/ProtectedRoute.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/features/authentication/ui/ProtectedRoute.tsx)**: Componente lógico de envoltura para proteger rutas según roles de sesión activa.
  - **[ui/PenaltyTimer.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/features/authentication/ui/PenaltyTimer.tsx)**: Temporizador visual de penalización por intentos erróneos recurrentes.
  - **[model/login.schema.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/features/authentication/model/login.schema.ts)**: Esquema de validaciones de login mediante Zod.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/features/authentication/index.ts)**: API Pública del feature de autenticación.
- **`features/manage-institutions/`**: Formularios de Padrón Escolar.
  - **[ui/InstitutionForm.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/features/manage-institutions/ui/InstitutionForm.tsx)**: Formulario de alta para registrar una nueva I.E. en el padrón.
  - **[ui/InstitutionEditForm.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/features/manage-institutions/ui/InstitutionEditForm.tsx)**: Formulario de modificación de datos de la I.E.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/features/manage-institutions/index.ts)**: API Pública.
- **`features/manage-teachers/`**: Gestión de Docentes.
  - **[ui/DocenteForm.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/features/manage-teachers/ui/DocenteForm.tsx)**: Formulario unificado de creación y edición del docente.
  - **[ui/DocenteDeleteModal.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/features/manage-teachers/ui/DocenteDeleteModal.tsx)**: Modal de confirmación para eliminar un docente.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/features/manage-teachers/index.ts)**: API Pública.
- **`features/manage-specialists/`**: Gestión de Especialistas.
  - **[ui/EspecialistaForm.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/features/manage-specialists/ui/EspecialistaForm.tsx)**: Formulario unificado para registrar/editar especialistas de UGEL.
  - **[ui/EspecialistaDeleteModal.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/features/manage-specialists/ui/EspecialistaDeleteModal.tsx)**: Modal interactivo para eliminar especialistas del padrón.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/features/manage-specialists/index.ts)**: API Pública.

---

### 5. Capa: `entities/` (Entidades de Negocio)
*Dominios clave del negocio educativo. Definen modelos, badges informativos y mocks.*
- **`entities/institution/`**: Dominio de Colegios (II.EE.).
  - **[model/types.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/institution/model/types.ts)**: Tipado TypeScript oficial de instituciones.
  - **[model/mocks.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/institution/model/mocks.ts)**: Datos falsos iniciales para colegios.
  - **[model/constants.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/institution/model/constants.ts)**: Constantes de niveles escolares y distritos geográficos.
  - **[ui/NivelBadge.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/institution/ui/NivelBadge.tsx)**: Insignia visual informativa del nivel escolar (Inicial, Primaria, Secundaria).
  - **[ui/EstadoBadge.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/institution/ui/EstadoBadge.tsx)**: Insignia del estado de monitoreo.
  - **[ui/DirectorCell.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/institution/ui/DirectorCell.tsx)**: Celda visual para mostrar los datos de contacto abreviados del director.
  - **[ui/InstitutionProfileHeader.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/institution/ui/InstitutionProfileHeader.tsx)**: Cabecera descriptiva superior del perfil de I.E.
  - **[ui/InstitutionLocationInfo.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/institution/ui/InstitutionLocationInfo.tsx)**: Sub-sección con la información geográfica del colegio.
  - **[ui/InstitutionDirectorInfo.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/institution/ui/InstitutionDirectorInfo.tsx)**: Sub-sección con el nombre y contacto del director.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/institution/index.ts)**: API Pública del dominio.
- **`entities/teacher/`**: Dominio del Docente.
  - **[model/types.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/teacher/model/types.ts)**: Tipado oficial de docentes.
  - **[model/mocks.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/teacher/model/mocks.ts)**: Mock data de docentes.
  - **[model/constants.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/teacher/model/constants.ts)**: Constantes del sector docente (especialidades, tipos de contrato).
  - **[ui/DocenteProfileHeader.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/teacher/ui/DocenteProfileHeader.tsx)**: Cabecera informativa del docente.
  - **[ui/DocentePersonalInfo.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/teacher/ui/DocentePersonalInfo.tsx)**: Sección de datos personales (DNI, celular, correo).
  - **[ui/DocenteLaboralInfo.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/teacher/ui/DocenteLaboralInfo.tsx)**: Datos de contrato laboral (cargo, jornada laboral, condición).
  - **[ui/DocenteSecciones.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/teacher/ui/DocenteSecciones.tsx)**: Sección visual con los grados y aulas a su cargo.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/teacher/index.ts)**: API Pública.
- **`entities/specialist/`**: Dominio del Especialista Pedagógico de UGEL.
  - **[model/types.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/specialist/model/types.ts)**: Tipado del especialista.
  - **[model/mocks.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/specialist/model/mocks.ts)**: Mock data de especialistas.
  - **[model/constants.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/specialist/model/constants.ts)**: Roles y áreas asignadas.
  - **[ui/EspecialistaProfileHeader.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/specialist/ui/EspecialistaProfileHeader.tsx)**: Cabecera del expediente del especialista.
  - **[ui/EspecialistaPersonalInfo.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/specialist/ui/EspecialistaPersonalInfo.tsx)**: Sección de datos personales del especialista.
  - **[ui/EspecialistaNivelesInfo.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/specialist/ui/EspecialistaNivelesInfo.tsx)**: Muestra la lista de niveles educativos bajo supervisión directa.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/specialist/index.ts)**: API Pública.
- **`entities/user/`**: Dominio del Usuario de Sesión.
  - **[model/types.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/user/model/types.ts)**: Tipado de perfiles de usuario.
  - **[model/mocks.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/user/model/mocks.ts)**: Cuentas mockeadas del sistema.
  - **[model/session.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/user/model/session.ts)**: Funciones auxiliares para guardar/leer la sesión del almacenamiento local.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/user/index.ts)**: API Pública.

---

### 6. Capa: `shared/` (Compartido)
*Infraestructura genérica y utilidades reusables. Desacopladas de la UGEL y de cualquier concepto de negocio.*
- **`shared/ui/`**: Primitivas UI del Sistema basadas en Shadcn UI.
  - **[button.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/ui/button.tsx)**, **[card.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/ui/card.tsx)**, **[table.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/ui/table.tsx)**: Componentes fundamentales de botones, tarjetas y tablas.
  - **[input.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/ui/input.tsx)**, **[select.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/ui/select.tsx)**, **[textarea.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/ui/textarea.tsx)**, **[label.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/ui/label.tsx)**: Controles de entrada de datos.
  - **[switch.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/ui/switch.tsx)**, **[badge.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/ui/badge.tsx)**, **[avatar.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/ui/avatar.tsx)**: Elementos de estados binarios, etiquetas informativas y avatares de usuario.
  - **[dropdown-menu.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/ui/dropdown-menu.tsx)**, **[alert-dialog.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/ui/alert-dialog.tsx)**, **[collapsible.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/ui/collapsible.tsx)**: Comportamientos interactivos.
  - **[form-controls.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/ui/form-controls.tsx)**: Agrupadores responsivos de campos y etiquetas.
  - **[ConfirmModal.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/ui/ConfirmModal.tsx)**: Modal de alerta reutilizable.
  - **[PageSkeleton.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/ui/PageSkeleton.tsx)**: Esqueleto para transiciones de carga.
  - **[PlaceholderPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/ui/PlaceholderPage.tsx)**: Plantilla para páginas en construcción.
  - **[LazyLoader.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/ui/LazyLoader.tsx)**: Envolvedor para imports asíncronos y Suspense de React.
- **`shared/lib/`**: Librerías de ayuda técnica.
  - **[utils.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/lib/utils.ts)**: Expone la utilidad `cn` para fusión de clases CSS.
  - **`shared/lib/offline/`**: Motor Offline completo.
    - **[localdb/](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/lib/offline/localdb)**: Inicialización e interacción con IndexedDB local.
    - **[queue/](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/lib/offline/queue)**: Cola persistente para almacenar mutaciones de datos en estado desconectado.
    - **[sync-engine/](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/lib/offline/sync-engine)**: Motor encargado de sincronizar los datos locales con el backend una vez recuperada la conexión de red.
    - **[cache/](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/lib/offline/cache)**: Estrategias de caché del service worker.
    - **[service-worker/](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/lib/offline/service-worker)**: Registro e interceptor de peticiones de red.
- **`shared/constants/`**: Ajustes genéricos inmutables.
  - **[roles.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/constants/roles.ts)**: Configuración inmutable de roles en la aplicación.
  - **[authConfig.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/constants/authConfig.ts)**: Parámetros del login (intentos máximos de contraseña y duración de bloqueo).
- **`shared/api/`**: Clientes de red.
  - **[auth.api.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/api/auth.api.ts)**: Simulador de llamadas http para inicio de sesión y validaciones del servidor.
- **`shared/assets/`**: Recursos estáticos.
  - **[icons/LogoUgelIcon.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/assets/icons/LogoUgelIcon.tsx)**: Icono vectorial (SVG) del logotipo de UGEL Lampa.
- **`shared/types/`**: Tipados globales básicos.
  - **[index.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/types/index.ts)**: Exportación de tipos generales de utilidad (e.g. tipo ID, nullables compartidos).

---

## 🔬 Diagnóstico de Cumplimiento FSD

Luego de evaluar la segmentación y dependencias entre estas carpetas y archivos, se confirma que el proyecto **sigue fielmente la arquitectura FSD** gracias a las siguientes características implementadas:
1. **Flujo de Importaciones Unidireccional**: Las capas más bajas (`shared`, `entities`) nunca importan recursos de capas superiores (`features`, `widgets`, `pages`, `app`). Esto previene el acoplamiento circular.
2. **Uso de Public APIs (`index.ts`)**: Cada slice dentro de `widgets/`, `features/` y `entities/` expone sus componentes a través de un archivo `index.ts` en la raíz del slice. Esto actúa como un escudo protector frente a imports profundos y no autorizados de otros componentes.
3. **Páginas Delgadas**: Las vistas en `src/pages/` son ligeras y descriptivas; delegan la lógica pesada a widgets y features y la visualización sutil de celdas a entities, cumpliendo con el principio FSD de composición.
4. **Shared Tecnológico Auténtico**: El contenido de la capa `shared/` (incluyendo el motor de funcionamiento offline IndexedDB/Sync Engine) es genérico y podría reutilizarse directamente en cualquier otra aplicación sin arrastrar lógica del dominio escolar de la UGEL.
