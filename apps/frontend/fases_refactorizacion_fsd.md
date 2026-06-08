# Plan de Refactorización — Feature-Sliced Design (FSD)
Este documento define la estrategia paso a paso para la refactorización y reestructuración del código frontend del **Sistema de Monitoreo**, alineándolo con las reglas y convenciones de la arquitectura **Feature-Sliced Design (FSD)**.

El objetivo principal es lograr una composición de archivos escalable, evitar la duplicación de código, eliminar las extensas líneas de lógica inline en las páginas y asegurar un bajo acoplamiento.

---

## 1. Diagnóstico del Estado Actual de la Arquitectura

Actualmente, el proyecto cuenta con carpetas que siguen nombres de FSD en `/src`, pero presenta múltiples violaciones arquitectónicas y una concentración excesiva de lógica en la capa `/pages`:

### Principales Hallazgos y Desviaciones
1. **Redundancia en la Raíz de Source:**
   - Existe un archivo [src/App.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/App.tsx) de marcador que no se utiliza, ya que la aplicación se renderiza usando [src/app/App.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/app/App.tsx) desde [src/main.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/main.tsx).
2. **Capas No Estándar en la Raíz `/src`:**
   - `/src/offline` y `/src/services` son directorios de primer nivel. En FSD, todas las capas deben pertenecer a las 6 categorías estándar (`app`, `pages`, `widgets`, `features`, `entities`, `shared`).
3. **Páginas con Exceso de Responsabilidad (Fat Pages):**
   - Páginas como [src/pages/institutions/InstitutionsPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/institutions/InstitutionsPage.tsx), [src/pages/administration/DocentesPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/administration/DocentesPage.tsx) y [src/pages/administration/EspecialistasPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/administration/EspecialistasPage.tsx) controlan localmente el estado del CRUD, renderizan tablas complejas inline con paginación, muestran métricas (KPIs), definen filtros y manejan diálogos de confirmación directamente.
4. **Lógica de Formulario e Interacción en Páginas:**
   - Los formularios como [InstitutionForm.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/institutions/InstitutionForm.tsx) e [InstitutionEditForm.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/institutions/InstitutionEditForm.tsx) están dentro de la carpeta `/pages/institutions`. Estos elementos representan **Features** o **Entities/UI** y no deberían alojarse en la carpeta de páginas.
   - [DocenteCreatePage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/administration/DocenteCreatePage.tsx) contiene más de 490 líneas que abarcan el estado del formulario, la validación inline y el markup HTML de los inputs.
5. **Componentes Genéricos y Estilos Acoplados Localmente:**
   - [ConfirmModal.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/institutions/ConfirmModal.tsx) y [form-controls.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/institutions/form-controls.tsx) están limitados al directorio `/pages/institutions`, a pesar de contener controles de formularios (`TextField`, `SelectField`, `FormButton`) y estilos globales que benefician a todo el proyecto.
6. **Violación de Acoplamiento en Slices del Mismo Nivel:**
   - Algunos archivos importan módulos de otras slices de la misma capa (ej. features o entities), lo cual rompe el principio de independencia de slices en FSD.

---

## 2. Mapa Arquitectónico Objetivo (FSD)

Tras la refactorización, el código se distribuirá de la siguiente manera:

```yaml
src/
  app/                    # Configuración global, providers y enrutador
    App.tsx               # Entry point con AuthProvider y RouterProvider
    AppShell.tsx          # Estructura principal (Sidebar + TopBar + Outlet)
    index.css             # Estilos globales

  pages/                  # Enrutamiento y composición de vistas (código mínimo)
    dashboard/            # Composición de la página del Dashboard
    auth/                 # Páginas de Login, Reset, etc. (importan features de auth)
    institutions/         # Páginas del padrón de II.EE. y detalles
    administration/       # Páginas del padrón de Docentes y Especialistas

  widgets/                # Bloques complejos de UI autocontenidos
    Sidebar/              # Barra lateral de navegación
    TopBar/               # Barra superior con datos de usuario
    institution-list/     # Tabla de II.EE. con paginación, filtros y KPIs
    teacher-list/         # Tabla de Docentes con filtros y KPIs
    specialist-list/      # Tabla de Especialistas con filtros y KPIs

  features/               # Interacciones del usuario que aportan valor de negocio
    authentication/       # AuthContext, AuthProvider, useAuth (Módulo de Auth)
    manage-institutions/  # Formularios Create/Edit y modales de borrado para II.EE.
    manage-teachers/      # Formularios Create/Edit y modal de borrado para Docentes
    manage-specialists/   # Formularios Create/Edit y modal de borrado para Especialistas

  entities/               # Entidades de negocio (Tipos, Mocks y UI pura)
    institution/          # Tipos de II.EE., mock data, y badges visuales
    teacher/              # Tipos de Docentes, mock data, y componentes de docente
    specialist/           # Tipos de Especialistas y mock data
    user/                 # Tipos y estado básico de usuario

  shared/                 # Recursos y lógica reutilizable sin acoplamiento
    ui/                   # Componentes puros (ConfirmModal, TextField, FormButton, Skeleton)
    lib/                  # Lógica común (Offline cache, sync engine, hooks, etc.)
    api/                  # Servicios de comunicación con el backend / fetchers
```

---

## 3. Plan de Fases de la Refactorización

Para garantizar que el sistema siga funcionando durante todo el proceso, implementaremos la refactorización de manera incremental y ordenada en **6 fases**:

### 📋 Fase 1: Diagnóstico y Limpieza Inicial
* **Objetivo:** Eliminar archivos no utilizados y centralizar los servicios auxiliares bajo la capa `/shared`.
* **Pasos:**
  1. Eliminar el archivo redundante y obsoleto [src/App.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/App.tsx).
  2. Mover la carpeta `/src/offline` a [src/shared/lib/offline](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/lib/offline).
  3. Mover la carpeta `/src/services` a [src/shared/api](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/api).
  4. Actualizar las referencias de importación de estos archivos en la aplicación.

### 📋 Fase 2: Consolidación de la Capa Compartida (`/shared`)
* **Objetivo:** Extraer componentes y controles genéricos para que estén disponibles de forma global.
* **Pasos:**
  1. Mover los controles reutilizables de [src/pages/institutions/form-controls.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/institutions/form-controls.tsx) a un directorio compartido en `/src/shared/ui/form` o unificar en [src/shared/ui](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/ui).
  2. Mover el modal general [src/pages/institutions/ConfirmModal.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/institutions/ConfirmModal.tsx) a [src/shared/ui/ConfirmModal.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/ui/ConfirmModal.tsx).
  3. Resolver estilos duplicados e imports en cascada.

### 📋 Fase 3: Reestructuración de la Capa de Entidades (`/entities`)
* **Objetivo:** Mover los modelos de datos, constantes y componentes de visualización puros a sus respectivas entidades.
* **Pasos:**
  1. **Entidad `institution`:**
     - Crear `src/entities/institution/model/types.ts` y mover los tipos y constantes desde [src/pages/institutions/types.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/institutions/types.ts).
     - Mover los componentes de representación pura como `NivelBadge`, `EstadoBadge` y `DirectorCell` desde [InstitutionsPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/institutions/InstitutionsPage.tsx) a `src/entities/institution/ui/`.
  2. **Entidad `teacher`:**
     - Consolidar [teacher.types.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/teacher/teacher.types.ts) y [teacher.mock.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/teacher/teacher.mock.ts) dentro del dominio.
  3. **Entidad `specialist`:**
     - Consolidar [specialist.types.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/specialist/specialist.types.ts) y su mock en `src/entities/specialist`.

### 📋 Fase 4: Extracción de Funcionalidades (`/features`)
* **Objetivo:** Encapsular toda interacción con estado mutable o llamadas asíncronas en la capa de Features.
* **Pasos:**
  1. **Feature `manage-institutions`:**
     - Crear `src/features/manage-institutions/ui/` y mover [InstitutionForm.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/institutions/InstitutionForm.tsx) e [InstitutionEditForm.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/institutions/InstitutionEditForm.tsx).
  2. **Feature `manage-teachers`:**
     - Crear `src/features/manage-teachers/ui/` y encapsular [DocenteDeleteModal.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/administration/DocenteDeleteModal.tsx).
     - Extraer la lógica de formulario de [DocenteCreatePage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/administration/DocenteCreatePage.tsx) y `DocenteEditPage.tsx` a un componente reutilizable de formulario en `src/features/manage-teachers/ui/DocenteForm.tsx`.
  3. **Feature `manage-specialists`:**
     - Crear `src/features/manage-specialists/ui/` y encapsular `EspecialistaDeleteModal.tsx`.
     - Extraer el formulario de especialista a `src/features/manage-specialists/ui/EspecialistaForm.tsx`.

### 📋 Fase 5: Implementación de Widgets (`/widgets`)
* **Objetivo:** Unificar componentes visuales compuestos con lógica de ordenación, paginación y estadísticas en bloques autocontenidos.
* **Pasos:**
  1. **Widget `institution-list`:**
     - Crear el widget para renderizar la lista de II.EE., la barra de filtros y las tarjetas KPI superiores.
  2. **Widget `teacher-list`:**
     - Crear el widget que controle la lista de docentes directivos y regulares, su KPI y la barra de búsqueda.
  3. **Widget `specialist-list`:**
     - Crear el widget que controle la lista de especialistas de monitoreo, sus KPIs y barras de búsqueda.

### 📋 Fase 6: Simplificación de Páginas y Verificación Final
* **Objetivo:** Convertir las páginas en contenedores mínimos (limpios de lógica de UI compleja) y validar que el build compile.
* **Pasos:**
  1. Simplificar [InstitutionsPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/institutions/InstitutionsPage.tsx) para que sea un wrapper que solo instancie el widget de lista e importe las features necesarias.
  2. Simplificar [DocentesPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/administration/DocentesPage.tsx) y [EspecialistasPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/administration/EspecialistasPage.tsx).
  3. Ajustar todas las importaciones relativas/absolutas en el archivo de rutas [src/app/App.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/app/App.tsx).
  4. Ejecutar comandos de análisis de código (`npm run build`, `npm run lint` u homólogos) para comprobar que la refactorización no genera errores de tipado o compilación.
