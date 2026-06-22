# Documentación Técnica — Sistema de Monitoreo Educativo UGEL Lampa

> **Versión:** 0.1.0  
> **Fecha de análisis:** Junio 2026  
> **Estado:** En desarrollo / pruebas (no en producción)  
> **Ámbito:** UGEL Lampa, Puno, Perú — 50 a 200 instituciones educativas  
> **Stack:** NestJS 11 + React 19 + PostgreSQL 17 + Prisma 7  
> **Contacto con cliente:** Directo con UGEL Lampa

---

## 1. Descripción General

### Propósito

El Sistema de Monitoreo Educativo es una plataforma web diseñada para que la **UGEL Lampa** (Puno, Perú) pueda planificar, ejecutar y dar seguimiento a las visitas de monitoreo pedagógico en instituciones educativas de su jurisdicción.

### Problema que resuelve

Centraliza y digitaliza un proceso que antes se manejaba con documentos físicos, hojas de cálculo y correos electrónicos. El sistema unifica:

- La planificación anual de visitas (planes de monitoreo)
- La asignación de especialistas a instituciones educativas
- El registro de visitas (cronogramas) con control de reprogramaciones
- La evaluación de docentes mediante plantillas con rúbricas y desempeños
- El cálculo automático de puntajes y niveles de logro
- La generación de reportes consolidados

> **Nota sobre el contexto:** El sistema se encuentra en **fase de desarrollo/pruebas**, no en producción. El equipo tiene **contacto directo con UGEL Lampa** para la definición de requisitos, los cuales cambian frecuentemente. No hay integraciones con otros sistemas del estado (ESCALE, NEXUS, SIAGIE, etc.). Un requisito crítico identificado es la necesidad de **modo offline**, ya que muchas IE en zonas rurales de Puno no tienen internet estable.

### Usuarios y roles

| Rol | Código | Descripción |
|-----|--------|-------------|
| Director UGEL | `director_ugel` | Visión ejecutiva, solo dashboard y reportes |
| Jefe de Gestión | `jefe_gestion` | Administra especialistas, jefes de área, plantillas, planes y cronogramas |
| Jefe de Área | `jefe_area` | Asignado por nivel educativo (Inicial/Primaria/Secundaria). Crea instituciones y directores de su ámbito. Inicial → Inicial + EBE, Primaria → solo Primaria, Secundaria → Secundaria + EBA + CEPTRO |
| Especialista | `especialista` | Ejecuta visitas de monitoreo y llena fichas de evaluación directamente en el sistema durante la visita |
| Director IE | `director_institucion` / `director_ie` | Gestiona docentes, plantillas y planes de su institución |
| Coordinador Pedagógico | `coordinador_pedagogico` | Es un docente de base (con registro en la tabla `docentes`) que además tiene el cargo `Coordinador Pedagógico`. Esto le da permisos de monitoreo dentro de su propia institución, sin dejar de dar clases |
| Jefe de Taller | `jefe_taller` | Es un docente de base (con registro en la tabla `docentes`) que además tiene el cargo `Jefe de Taller`. Exclusivo de Secundaria/CEPTRO. Realiza monitoreo de talleres dentro de su propia institución |
| Docente | `docente` | Solo consulta reportes |
| Invitado | `invitado` | Acceso de solo lectura a la mayoría de módulos |

### Casos de uso principales

1. **Inicio de sesión** con DNI + contraseña, bloqueo tras 3 intentos fallidos, primer acceso obliga cambio de contraseña
2. **Gestión del padrón** de instituciones educativas y docentes
3. **Creación de especialistas** (Jefe de Gestión y Especialistas) con asignación de cargos
4. **Elaboración de plantillas de monitoreo** con desempeños, aspectos y rúbricas
5. **Carga de planes de monitoreo** (PDF) con cobertura por institución
6. **Programación de visitas** (cronogramas) con asignación de especialista-docente
7. **Solicitud y aprobación de reprogramaciones** con flujo de aprobación
8. **Registro de fichas de evaluación** (contexto + desempeños + aspectos)
9. **Cálculo automático de nivel de logro** mediante algoritmo de baremo
10. **Generación de reportes** (fichas completadas, resumen por IE, exportación HTML)

---

## 2. Arquitectura General

### Tipo de arquitectura

**Cliente-Servidor monolítico** con separación en frontend y backend independientes, más un paquete compartido de contratos TypeScript.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MONOREPO (pnpm workspaces)                       │
│                                                                         │
│  ┌──────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │   Frontend    │  │      Backend         │  │   Shared Contracts   │  │
│  │   (React 19)  │←→│    (NestJS 11)       │  │  (interfaces DTOs)   │  │
│  │   Vite 8      │  │    :3000/api         │  │                      │  │
│  │   :5173       │  │                      │  │  ┌────────────────┐  │  │
│  └──────┬───────┘  └────────┬─────────────┘  │  │ auth/*           │  │
│         │                   │                  │  │ teachers/*      │  │
│         │    REST JSON      │                  │  │ institutions/*  │  │
│         │    HttpOnly       │                  │  │ monitoring/*    │  │
│         │    Cookies (JWT)  │                  │  │ scheduling/*    │  │
│         │                   │                  │  │ evaluations/*   │  │
│         │                   ▼                  │  │ reports/*       │  │
│         │           ┌──────────────┐          │  │ constants/*     │  │
│         │           │  PostgreSQL  │          │  └────────────────┘  │
│         │           │   (Prisma)   │          └──────────────────────┘
│         │           └──────────────┘
│         │                   │
│         │         RLS Policies
│         │         (seguridad a nivel fila)
│         ▼
│  ┌────────────┐
│  │  Mailpit   │  SMTP local para correos
│  │  :1025     │
│  │  :8025 UI  │
│  └────────────┘
```

### Comunicación frontend-backend

- **Protocolo:** HTTP/REST con JSON
- **Autenticación:** JWT en cookies HttpOnly (`accessToken` 15 min, `refreshToken` 7 días)
- **Interceptor de fetch:** El frontend sobrescribe `window.fetch` para interceptar errores 401 y hacer refresh automático del token
- **CORS:** Configurado en backend para aceptar credenciales desde `FRONTEND_URL`

### Flujo de una petición típica

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend (React)
    participant I as fetchInterceptor
    participant B as Backend (NestJS)
    participant M as Middleware (RLS)
    participant G as Guards (Auth/Roles/Permissions)
    participant C as Controller
    participant S as Service
    participant R as Repository
    participant DB as PostgreSQL

    U->>F: Click / acción
    F->>I: fetch(url, options)
    I->>I: Adjunta cookies HttpOnly
    I->>B: Petición HTTP
    B->>M: RlsMiddleware - setea app.user_id, app.user_rol
    B->>G: AuthGuard - verifica JWT + sesión activa
    B->>G: RolesGuard - verifica rol
    B->>G: PermissionsGuard - verifica permisos
    B->>C: Controlador
    C->>S: Servicio (lógica de negocio)
    S->>R: Repositorio (abstracción)
    R->>DB: Prisma query + RLS filter
    DB-->>R: Datos filtrados
    R-->>S: Resultado
    S-->>C: Respuesta
    C-->>B: JSON Response
    B-->>I: HTTP Response + Set-Cookie
    I-->>F: JSON parseado
    F-->>U: Actualización de UI
```

### Tecnologías y justificación

| Tecnología | Propósito | ¿Por qué? |
|------------|-----------|-----------|
| **NestJS 11** | Backend | Framework con DI, guards, decoradores, arquitectura modular |
| **React 19** | Frontend | Interfaz reactiva, ecosistema maduro |
| **Vite 8** | Bundler | Build rápido, HMR instantáneo |
| **Tailwind CSS 4** | Estilos | Utilidades first, diseño consistente |
| **shadcn/ui** | Componentes UI | Componentes accesibles, personalizables, sin dependencia externa |
| **TanStack Query 5** | Estado servidor | Cache, refetch, mutaciones optimistas |
| **PostgreSQL 17** | Base de datos | RLS nativo, CHECK constraints, triggers, vistas materializadas |
| **Prisma 7** | ORM | Type safety, migrations, relaciones, adapter para pg |
| **pnpm workspaces** | Monorepo | Ahorro de disco, dependencias compartidas |
| **Nodemailer** | Correos | Envío de emails de recuperación de contraseña |

---

## 3. Arquitectura del Frontend

### Framework

**React 19** con **Vite 8** como bundler y **React Router 7** para enrutamiento. Se sigue una variante de **Feature-Sliced Design (FSD)** para organizar el código por funcionalidad de negocio.

### Estructura de carpetas

```
apps/frontend/src/
├── app/           → Configuración global: providers, router, RootRedirect
├── entities/      → Modelos de negocio (capa de datos)
│   ├── model-user/
│   ├── model-docentes/
│   ├── model-instituciones/
│   ├── model-especialistas/
│   ├── model-jefes-area/
│   ├── model-plantillas/
│   ├── model-cronogramas/
│   ├── model-reportes/
│   └── model-reprogramaciones/
├── features/      → Funcionalidades completas (acciones del usuario)
│   ├── login/
│   ├── docentes/
│   ├── instituciones/
│   ├── especialistas/
│   ├── jefes-area/
│   ├── directores/
│   ├── monitoreos/
│   ├── planes-monitoreo/
│   └── reprogramaciones/
├── widgets/       → Componentes de UI reutilizables y layouts
│   ├── layouts/
│   │   ├── appshell.tsx
│   │   ├── sidebar/
│   │   └── topbar/
│   ├── auth/
│   ├── docentes/
│   ├── instituciones/
│   ├── especialistas/
│   ├── jefes-area/
│   ├── plantillas/
│   ├── calendario/
│   ├── reportes/
│   ├── reprogramaciones/
│   └── directores/
├── pages/         → Rutas/páginas por rol
│   ├── login/
│   ├── jefeGestion/
│   ├── jefeArea/
│   ├── director/
│   ├── especialista/
│   └── directorUgel/
└── shared/        → Utilidades transversales
    ├── api/
    ├── config/
    ├── constants/
    ├── lib/
    ├── types/
    └── ui/        → Componentes shadcn/ui
```

### Organización de componentes

Cada entidad (entity) contiene:

- **Contexto** (`*Context.tsx`, `*Provider.tsx`) — estado global
- **Hook** (`use*.ts`) — lógica de negocio reutilizable
- **API** (`*.api.ts`) — llamadas HTTP a endpoints
- **Tipos** — interfaces específicas de la entidad

Cada funcionalidad (feature) contiene componentes de UI específicos y hooks de TanStack Query.

### Manejo del estado

- **Estado del servidor:** TanStack React Query (`@tanstack/react-query`) — caché, refetch automático, mutaciones, invalidación
- **Estado global de usuario:** `UserContext` + `UserProvider` — almacena datos de sesión, rol, permisos
- **Estado de catálogos:** `PlantillasProvider` y `CronogramaProvider` — contextos globales para datos compartidos
- **Estado local:** `useState` / `useReducer` de React
- **Ruta actual:** React Router — estado en la URL

### Sistema de rutas

Definido en `app/routers.tsx` con `createBrowserRouter`. Layout principal `AppShell` contiene sidebar + topbar. Las rutas se protegen por rol redirigiendo al login si no hay sesión.

```mermaid
flowchart TD
    / --> RootRedirect --> /login o landing según rol
    /login --> LoginPage
    /restablecer-password --> ResetPasswordPage

    subgraph AppShell [Layout protegido]
        /especialistas --> EspecialistasPage
        /instituciones/padron --> PadronPage
        /instituciones/docentes --> DocentesPage
        /instituciones/coordinadores --> CoordinadoresPage
        /instituciones/jefes-taller --> JefesTallerPage
        /monitoreo/plan --> PlanMonitoreoPage
        /monitoreo/gestion --> GestionPage
        /monitoreo/cronograma --> CronogramaPage
        /monitoreo/calendario --> CalendarioPage
        /monitoreo/reportes --> ReportesPage
        /plantillas --> PlantillasPage
        /reportes --> ReportesPage
    end
```

### Manejo de autenticación

El `AuthGuard` del frontend (en el router) verifica la cookie de sesión. En cada petición:

1. Las cookies HttpOnly se envían automáticamente
2. El `fetchInterceptor` captura errores 401
3. Si recibe 401, intenta `POST /auth/refresh`
4. Si refresh falla, redirige al login

### Servicios/API

Capa ubicada en `shared/api/`:

- `fetchInterceptor.ts` — sobrescribe `window.fetch` con lógica de refresh automático
- `auth.api.ts` — `login`, `logout`, `refresh`, `changePassword`, `forgotPassword`, `resetPassword`
- APIs específicas dentro de cada `entities/model-*/` y `features/*/api/`

### Hooks personalizados

- `useUser()` — datos del usuario autenticado desde UserContext
- Hooks de TanStack Query en cada feature: `useQuery`, `useMutation`, `useQueryClient`
- Hooks específicos como `use-ficha-monitoreo.ts` para operaciones de evaluación

### Contextos

- `UserProvider` — sesión del usuario, permisos, rol
- `CronogramaProvider` — datos de cronogramas compartidos
- `PlantillasProvider` — plantillas de monitoreo compartidas

### Componentes reutilizables

El directorio `shared/ui/` contiene componentes **shadcn/ui** (Button, Card, Input, Dialog, Table, Select, etc.). Los layouts (`appshell`, `sidebar`, `topbar`) son widgets globales.

---

## 4. Arquitectura del Backend

### Framework

**NestJS 11** con Express subyacente. Usa decoradores para definir controladores, servicios, módulos, guards y filtros de excepción.

### Organización de carpetas

```
apps/backend/src/
├── main.ts                          → Punto de entrada
├── app.module.ts                    → Módulo raíz
├── common/                          → Transversales
│   ├── enums/                       → RoleCode, CargoNombre, CondicionLaboral, EstadoRegistro
│   ├── filters/                     → PrismaClientExceptionFilter
│   └── validators/                  → IsValidNivelForModalidad, IsValidEspecialidadForNivel
├── shared/                          → Módulos compartidos globales
│   ├── prisma/                      → PrismaService + RlsMiddleware
│   ├── mailer/                      → MailerService (Nodemailer)
│   ├── storage/                     → DiskStorageService (archivos PDF)
│   └── health/                      → HealthController
├── modules/                         → Módulos de negocio
│   ├── auth/                        → Autenticación y autorización
│   ├── teachers/                    → CRUD docentes
│   ├── institutions/                → CRUD instituciones educativas
│   ├── especialistas/               → CRUD especialistas
│   ├── catalogs/                    → Catálogos globales (modalidades, niveles, cursos)
│   ├── monitoring/                  → Planes y plantillas de monitoreo
│   ├── scheduling/                  → Cronogramas y reprogramaciones
│   ├── evaluations/                 → Fichas de monitoreo y baremo
│   └── reports/                     → Reportes y exportaciones
└── generated/                       → Prisma Client generado (gitignored)
```

### Capas por módulo

Cada módulo sigue el patrón **Controller → Service → Repository (interfaz + implementación Prisma)**:

```
Ruta HTTP → Controller → DTOs (validación) → Service → Repository → Prisma → PostgreSQL
```

### Controladores

Reciben la petición HTTP, validan con DTOs (class-validator + class-transformer), delegan al servicio y retornan la respuesta. Los decoradores `@UseGuards`, `@Roles`, `@RequirePermissions` controlan acceso.

### Servicios

Contienen la lógica de negocio. Se inyectan repositorios y otros servicios mediante DI de NestJS.

### Repositorios

Se definen como **interfaces abstractas** (ej. `UserRepository`) con implementaciones concretas (`PrismaUserRepository`). Esto permite:
- Desacoplar la capa de datos de la lógica de negocio
- Facilitar tests unitarios (mock del repositorio)
- Cambiar de ORM sin modificar servicios

### Modelos

Definidos en el schema de Prisma (`schema.prisma`). 42 modelos que generan las tablas en PostgreSQL.

### Middlewares

- **RlsMiddleware** (`shared/prisma/rls.middleware.ts`): Se ejecuta en todas las rutas. Toma el usuario del request (`req.user`) y setea las GUCs de PostgreSQL (`app.user_id`, `app.user_rol`) para que las RLS policies filtren automáticamente.

### Autenticación

- **AuthGuard**: Verifica JWT de la cookie `accessToken`, valida que la sesión esté activa en BD, detecta primer login
- **AuthTokenService**: Firma y verifica JWT (access + refresh)
- **AuthSessionService**: Login/logout/refresh con sesiones persistentes en BD
- **AuthPasswordService**: Cambio de contraseña, forgot/reset

### Autorización

- **RolesGuard**: Verifica que el rol del usuario esté en los roles permitidos para la ruta (decorador `@Roles`)
- **PermissionsGuard**: Verifica que el usuario tenga los permisos requeridos (decorador `@RequirePermissions`)

### Manejo de errores

- **PrismaClientExceptionFilter**: Captura errores del ORM (P2002 unique constraint → 409, P2025 not found → 404, P2003 foreign key → 400)
- **ValidationPipe global**: Rechaza peticiones con datos inválidos, lanza 400 Bad Request

### Validaciones

- **class-validator** en DTOs: decoradores `@IsString`, `@IsInt`, `@IsOptional`, etc.
- Validadores personalizados: `@IsValidNivelForModalidad()` verifica que el nivel educativo sea válido para la modalidad, `@IsValidEspecialidadForNivel()` exige especialidad en Secundaria

### Configuración

- `ConfigModule` de NestJS para variables de entorno
- `.env` en la raíz del monorepo

### Flujo completo de una petición HTTP

```mermaid
sequenceDiagram
    participant R as Request
    participant H as Helmet
    participant CP as CookieParser
    participant V as ValidationPipe
    participant RL as RlsMiddleware
    participant AG as AuthGuard
    participant RG as RolesGuard
    participant PG as PermissionsGuard
    participant CT as Controller
    participant SV as Service
    participant RP as Repository
    participant DB as PostgreSQL
    participant PF as PrismaExceptionFilter

    R->>H: Petición entrante
    H->>CP: Headers de seguridad
    CP->>V: Parse cookies
    V->>V: Valida body (si POST/PUT)
    V->>RL: Setea GUCs (app.user_id, app.user_rol)
    RL->>AG: Verifica JWT + sesión activa
    AG->>RG: Verifica rol
    RG->>PG: Verifica permisos
    PG->>CT: Llama al controlador
    CT->>CT: Valida DTOs específicos
    CT->>SV: Ejecuta lógica de negocio
    SV->>RP: Consulta/guarda datos
    RP->>DB: Query con RLS aplicado automáticamente
    DB-->>RP: Resultados filtrados
    RP-->>SV: Datos mapeados
    SV-->>CT: Respuesta
    CT-->>PG: JSON HTTP
    note over CT,PG: Si error → PrismaExceptionFilter
    PG-->>R: HTTP Response
```

---

## 5. Lógica de Negocio

### 5.1 Módulo de Autenticación (`modules/auth`)

**¿Qué hace?** Gestiona todo el ciclo de vida de la sesión: login, logout, refresh, cambio de contraseña, recuperación de contraseña.

**Reglas de negocio:**

1. **Bloqueo por intentos fallidos:** Si `failedLoginAttempts >= 3`, la cuenta se bloquea por 30 minutos (`lockedUntil = now() + 30 min`).
2. **Primer login:** `isFirstLogin = true` obliga a cambiar contraseña antes de acceder a cualquier recurso (controlado por `@AllowFirstLogin()`).
3. **Refresh en cascada:** Si el accessToken expiró y el refreshToken aún es válido, se genera un nuevo par de tokens.
4. **Sesiones persistentes:** Cada login crea un registro en `sesiones_auth` con un `sessionJti` único. Al cerrar sesión se marca `isActive = false`.
5. **Tokens de un solo uso:** El token de recuperación expira en 1 hora, al usarse se marca `isUsed = true`.
6. **Rate limiting:** Login limitado a 5 intentos/minuto, forgot/reset a 3/minuto.

**Validaciones:**
- DNI debe existir en `personas`
- Usuario debe estar activo (`isActive = true`)
- Contraseña cumple requisitos de seguridad

**Datos que consume:** `Persona`, `Usuario`, `SesionAuth`, `TokenRecuperacion`, `LogAuditoria`
**Datos que genera:** Tokens JWT, sesiones, logs de auditoría

### 5.2 Módulo de Docentes (`modules/teachers`)

**¿Qué hace?** CRUD de docentes con asignación de cargos, secciones, cursos y especialidades.

**Reglas de negocio:**

1. **Cargos restrictivos:** `Coordinador Pedagógico` y `Jefe de Taller` son cargos adicionales asignados a docentes que ya pertenecen a una IE (tienen registro en la tabla `docentes`). Estos cargos son **exclusivos del nivel Secundaria** (el Jefe de Taller también aplica para CEPTRO) y requieren `condicionLaboral = 'Nombrado' | 'Destacado'`. El docente continúa dando clases y además realiza labores de monitoreo dentro de su propia institución. En el sistema de autenticación, estos usuarios tienen el rol `coordinador_pedagogico` o `jefe_taller` (definidos en `RoleCode`), lo que les otorga permisos de monitoreo sin necesidad de ser un Especialista separado.
2. **Dirección por institución:** Un docente puede tener el cargo `Director`, lo que lo convierte en el director de la IE.
3. **Password automática:** Al crear docente, se genera un hash bcrypt de su DNI como contraseña inicial.
4. **DNI único:** Cada docente se vincula a una persona, y cada persona tiene DNI único.

**Datos que consume:** `Persona`, `Docente`, `InstitucionEducativa`, `Cargo`, `Curso`, `Especialidad`
**Datos que genera:** Docente con cargos, secciones, cursos, especialidades, usuario asociado

### 5.3 Módulo de Instituciones (`modules/institutions`)

**¿Qué hace?** CRUD de instituciones educativas con soft delete/restore.

**Reglas de negocio:**

1. **Código modular único:** 7 dígitos, único por institución.
2. **Soft delete:** No se eliminan físicamente, se marcan como `Inactiva`.
3. **Extracción de director:** Al consultar una IE, se obtiene el docente con cargo `Director` de esa institución.
4. **Ámbito Jefe de Área (scope por nivel):** El Jefe de Gestión asigna a cada Jefe de Área un nivel educativo. Al crear instituciones, el backend valida el alcance según el nivel del Jefe de Área:
   - **Inicial**: Puede crear instituciones de nivel Inicial (EBR) y de modalidad Especial (EBE)
   - **Primaria**: Solo puede crear instituciones de nivel Primaria (EBR)
   - **Secundaria**: Puede crear instituciones de nivel Secundaria (EBR), Alternativa (EBA) y CEPTRO
   Esta lógica está implementada en `InstitutionsService.create()` en `apps/backend/src/modules/institutions/services/institutions.service.ts:19-48`.
5. **Visibilidad multi-rol:** Jefe de Gestión ve todas las IEs, Director IE solo su propia IE, Jefe de Área las de su ámbito.

**Datos que consume:** `InstitucionEducativa`, `Docente` (para extraer director), `NivelEducativo`, `Modalidad`
**Datos que genera:** Instituciones educativas con estado Activo/Inactivo

### 5.4 Módulo de Especialistas (`modules/especialistas`)

**¿Qué hace?** CRUD de especialistas con asignación de especialidades.

**Reglas de negocio:**

1. **Creación de Jefe de Gestión:** Solo usuarios con `condicionLaboral = 'Nombrado'` pueden ser creados como Jefe de Gestión.
2. **Tres cargos válidos:** `Especialista`, `Jefe de Área`, `Jefe de Gestión`.
3. **Condiciones laborales válidas:** `Encargado`, `Destacado`, `Designado` (para Especialista/Jefe de Área).
4. **Carga laboral máxima:** Default 40 horas.
5. **Especialidades M:N:** Un especialista puede tener múltiples especialidades.

**Datos que consume:** `Persona`, `Especialista`, `Especialidad`
**Datos que genera:** Especialistas con cargos y especialidades

### 5.5 Módulo de Catálogos (`modules/catalogs`)

**¿Qué hace?** Proporciona consultas de datos maestros a todos los módulos.

**Reglas de negocio:**
- Catálogos de solo lectura: `Modalidad`, `NivelEducativo`, `Especialidad`, `Curso`, `Cargo`, `Role`
- La relación modalidad-nivel se valida mediante `MODALIDAD_NIVEL_MAP`:
  - EBR: Inicial, Primaria, Secundaria
  - EBA: Inicial-Intermedio, Avanzado
  - EBE: CEBE, PRITE
  - CEPTRO: Corte y Ensamblaje, Mecánica de Motos, Peluquería, Madera, TI

### 5.6 Módulo de Monitoreo — Planes (`modules/monitoring/plans`)

**¿Qué hace?** CRUD de planes de monitoreo con carga de archivos PDF y gestión de cobertura por IE.

**Reglas de negocio:**

1. **Un plan UGEL activo por año:** Índice parcial `uq_plan_ugel_activo` asegura solo un plan de Jefe de Gestión activo por año académico.
2. **Un plan IE activo por (autor, año):** Índice parcial `uq_plan_ie_activo` asegura solo un plan por director/año.
3. **Soft delete:** Los planes se marcan como `deleted = true` sin eliminar registros.
4. **Cobertura M:N:** Un plan puede cubrir múltiples IE, una IE puede estar en múltiples planes (relación `PlanCoberturaIe`).
5. **Archivos PDF:** Se almacenan en disco local (`uploads/planes/`) y se sirven estáticamente desde `/uploads`.

### 5.7 Módulo de Monitoreo — Plantillas (`modules/monitoring/plantillas`)

**¿Qué hace?** Gestiona las plantillas de evaluación con desempeños, aspectos, rúbricas y niveles de calificación.

**Reglas de negocio:**

1. **Una plantilla Vigente por (tipo, año):** Índice parcial `uq_plantilla_vigente_tipo_anio` asegura que solo una plantilla de tipo DOCENTE o DIRECTIVO por año esté activa.
2. **Estados:** `Borrador` → `Vigente` → `Historico`. No se puede retroceder.
3. **Versionado:**
   - Si la plantilla está en `Borrador` y no tiene fichas asociadas → **actualización in-place** (modifica directamente).
   - Si pasa a `Vigente` y luego se edita → se crea una **nueva versión** (clonando desempeños, aspectos, niveles y rúbricas). La anterior pasa a `Historico`.
   - La migración de fichas de una versión anterior a la nueva se maneja explícitamente en el endpoint `POST /fichas/:id/migrar-plantilla`.
4. **Baremo:** `Vigente` (rangos discretos con gaps) o `Porcentual` (basado en porcentajes).
5. **Restricción de eliminación:** Si la plantilla tiene fichas asociadas, no se puede eliminar (foreign key).

**Datos que consume:** `PlantillaMonitoreo`, `DesempenoPlantilla`, `AspectoEvaluado`, `NivelCalificacion`, `RubricaNivel`, `FichaMonitoreo`
**Datos que genera:** Versiones de plantillas, desempeños, aspectos, rúbricas, niveles

### 5.8 Módulo de Scheduling — Cronogramas (`modules/scheduling`)

**¿Qué hace?** Programa visitas de monitoreo (cronogramas) y gestiona solicitudes de reprogramación.

**Reglas de negocio:**

1. **Máximo 3 visitas pendientes por especialista:** Un especialista no puede tener más de 3 cronogramas en estado `PROGRAMADO` sin completar.
2. **Estados de visita:** `PROGRAMADO` → `EN_PROCESO` → `COMPLETADO` | `REPROGRAMADO` | `CANCELADO`.
3. **Número de visita:** Entre 1 y 4 por docente.
4. **Inmutabilidad de fecha/hora:** Un trigger en la BD (`trg_validar_update_cronograma`) impide modificar `fecha_programada` o `hora_inicio` directamente. Solo se puede cambiar mediante una reprogramación aprobada.
5. **Reprogramaciones:**
   - Cualquier usuario puede solicitar una reprogramación.
   - La solicitud guarda la fecha/hora original y la propuesta.
   - Al aprobar (POST `/solicitudes-reprogramacion/:id/aprobar`), se ejecuta `aplicarReprogramacion` que setea `app.reprogramacion_apply = true` para bypassear el trigger y actualizar el cronograma.
   - Solo puede haber una solicitud PENDIENTE por cronograma (índice parcial).

**Datos que consume:** `Cronograma`, `SolicitudReprogramacion`, `Especialista`, `Docente`, `InstitucionEducativa`
**Datos que genera:** Visitas programadas, solicitudes de reprogramación, cambios de estado

### 5.9 Módulo de Evaluaciones — Fichas (`modules/evaluations`)

**¿Qué hace?** Registra las fichas de monitoreo durante las visitas: contexto, respuestas de desempeño y aspectos.

**Reglas de negocio:**

1. **Una ficha por visita:** Relación 1:1 entre `Cronograma` y `FichaMonitoreo`.
2. **Flujo de creación:**
   - `POST /fichas` → Crea ficha en estado `BORRADOR` con puntaje 0 y promedio 1.0
   - `PATCH /fichas/:id/respuestas-desempeno` → Guarda niveles de desempeño
   - `PATCH /fichas/:id/respuestas-aspecto/:aspectoId` → Marca aspectos evaluados
   - `PATCH /fichas/:id/finalizar` → Calcula puntaje, promedio y nivel de logro, cambia a `FINALIZADO`
3. **Cálculo de nivel de logro (BaremoCalculatorService):**
   - Promedio se calcula como promedio de todos los desempeños
   - Niveles con **gaps intencionales** para evitar ambigüedad:
     - `INICIO`: promedio entre 1.0 y 1.4 (gap 1.5)
     - `EN_PROCESO`: promedio entre 1.6 y 2.4 (gap 2.5)
     - `LOGRO_ESPERADO`: promedio entre 2.6 y 3.4 (gap 3.5)
     - `LOGRO_DESTACADO`: promedio entre 3.6 y 4.0
   - Los gaps (1.5, 2.5, 3.5) no son alcanzables, forzando al evaluador a definir claramente el nivel
4. **Migración de plantilla:** Si la plantilla se versionó mientras la ficha estaba en borrador, se puede migrar a la nueva versión. Esto re-crea las respuestas de desempeño y aspecto con IDs de la nueva plantilla.

**Datos que consume:** `FichaMonitoreo`, `FichaContexto`, `FichaRespuestaDesempeno`, `FichaRespuestaAspecto`, `PlantillaMonitoreo`, `DesempenoPlantilla`, `AspectoEvaluado`
**Datos que genera:** Fichas completas con puntajes, promedios y niveles de logro

### 5.10 Módulo de Reportes (`modules/reports`)

**¿Qué hace?** Consultas agregadas y exportación de fichas para reportes.

**Reglas de negocio:**

1. **Fichas completadas:** Lista paginada filtrada por fechas, IE, especialista.
2. **Resumen por IE:** Agregación de fichas finalizadas agrupadas por institución. Muestra total de fichas, distribución de niveles de logro y promedio general.
3. **Exportación HTML:** Vista imprimible de una ficha individual con formato para papel.
4. **Scope multi-rol:** Jefe de Gestión ve todas las fichas, Director IE solo las de su IE, Especialista solo las que él creó (esto se implementa en el servicio consultando el repositorio con filtros condicionales según `req.user.role`).

### 5.11 Lógica Transversal — RLS (Row Level Security)

A nivel de base de datos, tres tablas clave tienen RLS habilitado:

- **`fichas_monitoreo`**: El especialista solo ve/edita fichas que él creó (`creado_por_id = current_user_id`)
- **`cronogramas`**: El especialista solo ve cronogramas donde es el monitor (`monitor_id = current_user_id`)
- **`solicitudes_reprogramacion`**: El usuario ve solicitudes que él creó o que él resolvió

El middleware `RlsMiddleware` setea las variables de sesión `app.user_id` y `app.user_rol` al inicio de cada request autenticado. Las RLS policies de PostgreSQL usan estas variables para filtrar automáticamente.

---

## 6. Flujo del Sistema

### 6.1 Flujo de inicio de sesión

```mermaid
flowchart TD
    A[Usuario ingresa DNI + contraseña] --> B{Validación frontend}
    B -->|OK| C[POST /auth/login]
    B -->|Error| D[Mostrar error de validación]
    C --> E{¿DNI existe?}
    E -->|No| F[401 Credenciales inválidas]
    E -->|Sí| G{¿Usuario activo?}
    G -->|No| H[401 Cuenta desactivada]
    G -->|Sí| I{¿Bloqueado?}
    I -->|Sí, lockedUntil > now| J[401 Demasiados intentos]
    I -->|No| K{¿Contraseña correcta?}
    K -->|No| L[Incrementar failedLoginAttempts]
    L --> M{¿failedLoginAttempts >= 3?}
    M -->|Sí| N[Bloquear 30 min]
    M -->|No| F
    K -->|Sí| O[Resetear failedLoginAttempts]
    O --> P[Crear SesionAuth en BD]
    P --> Q[Generar accessToken + refreshToken JWT]
    Q --> R[Setea cookies HttpOnly]
    R --> S{¿isFirstLogin?}
    S -->|Sí| T[Redirigir a cambio de contraseña]
    S -->|No| U[Redirigir al landing según rol]
```

### 6.2 Flujo de programación de visita

```mermaid
flowchart TD
    A[Jefe de Gestión selecciona especialista + IE + docente] --> B{Validar máximo 3 pendientes}
    B -->|Supera límite| C[Error: especialista tiene 3 visitas pendientes]
    B -->|OK| D[Crear cronograma estado PROGRAMADO]
    D --> E[Especialista ve en su calendario]
    E --> F{¿Puede asistir?}
    F -->|Sí| G[Realiza visita y llena ficha]
    F -->|No, reprogramación necesaria| H[Crear solicitud reprogramación]
    H --> I[Jefe de Gestión revisa solicitud]
    I --> J{¿Aprueba?}
    J -->|Sí| K[AplicarReprogramacion: actualiza fecha/hora con bypass trigger]
    J -->|No| L[Solicitud RECHAZADA, visita mantiene fecha original]
    G --> M[Llenar contexto de ficha]
    M --> N[Registrar respuestas de desempeño]
    N --> O[Registrar aspectos evaluados]
    O --> P[Finalizar ficha → cálculo automático de nivel de logro]
    P --> Q[Ficha FINALIZADA con puntaje y nivel]
```

### 6.3 Flujo de versionado de plantilla

```mermaid
flowchart TD
    A[Usuario edita plantilla con estado Vigente] --> B{¿Tiene fichas asociadas?}
    B -->|No| C[Update IN-PLACE]
    B -->|Sí| D[Versionado: clonar plantilla completa]
    D --> E[Nueva versión con estado Borrador]
    D --> F[Versión anterior pasa a Historico]
    E --> G[Las fichas existentes quedan con versión anterior]
    G --> H[Opcional: migrar fichas a nueva versión]
    H --> I[POST /fichas/:id/migrar-plantilla]
    I --> J[Re-crear respuestas con IDs de nuevo desempeño/aspecto]
```

---

## 7. Base de Datos

### Motor

**PostgreSQL 17** con Prisma ORM como capa de abstracción.

### Modelo de datos (42 modelos activos)

El schema completo está en `apps/backend/prisma/schema.prisma`. Las tablas se agrupan en dominios:

#### 7.1 Identidad y seguridad (8 tablas)

| Tabla | Propósito |
|-------|-----------|
| `roles` | Catálogo de roles del sistema (9 roles) |
| `permisos` | Permisos granulares (11 permisos) |
| `rol_permisos` | Asignación M:N rol ↔ permiso |
| `personas` | Datos civiles (DNI, nombres, correo) |
| `usuarios` | Credenciales de acceso |
| `sesiones_auth` | Sesiones JWT persistentes |
| `tokens_recuperacion` | Tokens de restablecimiento de contraseña |
| `logs_auditoria` | Auditoría de eventos |

#### 7.2 Catálogos educativos (5 tablas)

| Tabla | Propósito |
|-------|-----------|
| `modalidades` | EBR, EBA, EBE, CEPTRO |
| `niveles_educativos` | Inicial, Primaria, Secundaria, etc. |
| `especialidades` | Especialidades por nivel educativo |
| `cursos` | Cursos asociados a nivel educativo |
| `cargos` | Cargos docentes (Director, Docente de Aula, etc.) |

#### 7.3 Instituciones y docentes (8 tablas)

| Tabla | Propósito |
|-------|-----------|
| `instituciones_educativas` | IE con código modular, ubicación |
| `docentes` | Docentes vinculados a IE y persona |
| `docente_cargos` | Historial de cargos del docente |
| `docente_cursos` | Cursos asignados al docente |
| `docente_secciones` | Secciones (grado + sección) del docente |
| `docente_especialidades` | Especialidades del docente |
| `especialistas` | Especialistas con cargo y condición laboral |
| `especialista_especialidades` | Especialidades del especialista |

#### 7.4 Monitoreo (8 tablas)

| Tabla | Propósito |
|-------|-----------|
| `planes_monitoreo` | Planes anuales con archivo PDF |
| `plan_cobertura_ie` | Cobertura M:N plan ↔ IE |
| `plantillas_monitoreo` | Plantillas de evaluación con versionado |
| `niveles_calificacion` | Niveles (I, II, III, IV) con rango y color |
| `desempenos_plantilla` | Desempeños evaluables |
| `aspectos_evaluados` | Aspectos específicos de cada desempeño |
| `rubrica_niveles` | Descripción del nivel por desempeño |
| `ficha_contexto` | Contexto de la visita (curso, estudiantes) |

#### 7.5 Scheduling y evaluaciones (5 tablas)

| Tabla | Propósito |
|-------|-----------|
| `cronogramas` | Visitas programadas |
| `solicitudes_reprogramacion` | Solicitudes de cambio de fecha/hora |
| `fichas_monitoreo` | Fichas de evaluación completadas |
| `ficha_respuestas_desempeno` | Nivel asignado a cada desempeño |
| `ficha_respuestas_aspecto` | Aspectos marcados como cumplidos |

### Relaciones principales

```
personas 1:1→ usuarios
personas 1:1→ docentes
personas 1:1→ especialistas
usuarios N:1→ roles
roles N:M→ permisos (via rol_permisos)
instituciones_educativas 1:N→ docentes
docentes M:N→ cursos (via docente_cursos)
docentes M:N→ especialidades (via docente_especialidades)
especialistas M:N→ especialidades (via especialista_especialidades)
especialistas 1:N→ cronogramas (como monitor)
docentes 1:N→ cronogramas (como evaluado)
planes_monitoreo M:N→ instituciones (via plan_cobertura_ie)
plantillas_monitoreo 1:N→ desempenos_plantilla
desempenos_plantilla 1:N→ aspectos_evaluados
desempenos_plantilla M:N→ niveles_calificacion (via rubrica_niveles)
cronogramas 1:1→ fichas_monitoreo
cronogramas 1:N→ solicitudes_reprogramacion
fichas_monitoreo 1:N→ ficha_respuestas_desempeno
fichas_monitoreo 1:N→ ficha_respuestas_aspecto
```

### Índices importantes

| Índice | Tipo | Propósito |
|--------|------|-----------|
| `uq_plantilla_vigente_tipo_anio` | Parcial único | Solo 1 plantilla Vigente por (tipo, año) |
| `uq_solicitud_pendiente_por_cronograma` | Parcial único | Solo 1 solicitud PENDIENTE por cronograma |
| `uq_plan_ugel_activo` | Parcial único | Solo 1 plan UGEL activo por año |
| `uq_plan_ie_activo` | Parcial único | Solo 1 plan IE activo por (autor, año) |
| `idx_fichas_reporte` | Compuesto | Optimiza consultas de reportes por año+estado+nivel |

### CHECK constraints

12 constraints que validan a nivel BD:
- Estados de cronogramas: `PROGRAMADO`, `EN_PROCESO`, `COMPLETADO`, `REPROGRAMADO`, `CANCELADO`
- Estados de plantillas: `Borrador`, `Vigente`, `Historico`
- Niveles de logro: `INICIO`, `EN_PROCESO`, `LOGRO_ESPERADO`, `LOGRO_DESTACADO`
- Promedio de ficha: entre 1.0 y 4.0
- Número de visita: entre 1 y 4

### Trigger

`trg_validar_update_cronograma` (función `sps_validar_update_cronograma()`):
- Antes de UPDATE en `cronogramas`
- Si cambian `fecha_programada` o `hora_inicio`, verifica que la variable de sesión `app.reprogramacion_apply = 'true'`
- Si no está seteada, rechaza la operación con error

### Vista materializada

`mv_consolidado_mensual`: Agrega fichas finalizadas por mes y especialista (creador), con totales, promedios, mínimos y máximos.

---

## 8. API

### Prefijo global: `/api`

### Autenticación (`/api/auth`)

| Método | Ruta | Descripción | Auth | Throttle |
|--------|------|-------------|------|----------|
| POST | `/login` | Iniciar sesión con DNI y contraseña | No | 5/60s |
| POST | `/refresh` | Refrescar tokens JWT | No | - |
| POST | `/change-password` | Cambiar contraseña (requiere primer login) | AuthGuard + RolesGuard | - |
| POST | `/forgot-password` | Solicitar recuperación de contraseña | No | 3/60s |
| POST | `/reset-password` | Restablecer contraseña con token | No | 3/60s |
| POST | `/logout` | Cerrar sesión | AuthGuard + RolesGuard | - |

**POST /auth/login**
```json
// Body
{ "dni": "40000001", "password": "micontraseña" }

// Response 200
{
  "user": {
    "id": "uuid",
    "personaId": "uuid",
    "dni": "40000001",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "rol": "jefe_gestion",
    "rolNombre": "Jefe de Gestión",
    "isFirstLogin": false,
    "permisos": ["monitoreo:read", "monitoreo:write", ...]
  },
  "accessToken": "eyJ...",  // también en cookie
  "refreshToken": "eyJ..."  // también en cookie
}

// Error 401
{ "statusCode": 401, "message": "Credenciales inválidas" }

// Error 401 (bloqueado)
{ "statusCode": 401, "message": "Demasiados intentos fallidos. Intente de nuevo en 30 minutos." }
```

**POST /auth/change-password**
```json
// Body
{ "currentPassword": "temporal123", "newPassword": "NuevaPass1!" }

// Response 200
{ "message": "Contraseña actualizada exitosamente" }
```

### Especialistas (`/api/especialistas`)

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| GET | `/` | Listar especialistas | `especialistas:read` |
| GET | `/:id` | Obtener especialista | `especialistas:read` |
| POST | `/` | Crear especialista | `especialistas:write` |
| PUT | `/:id` | Actualizar especialista | `especialistas:write` |
| DELETE | `/:id` | Eliminar especialista | `especialistas:write` |
| PATCH | `/:id/alta` | Activar especialista | `especialistas:write` |
| PATCH | `/:id/baja` | Desactivar especialista | `especialistas:write` |

### Docentes (`/api/docentes`)

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| POST | `/` | Crear docente | `docentes:write` |
| GET | `/` | Listar docentes | `docentes:read` |
| GET | `/cargos` | Listar cargos disponibles | `docentes:read` |
| PUT | `/:id` | Actualizar docente | `docentes:write` |
| PATCH | `/:id/baja` | Desactivar docente | `docentes:write` |
| PATCH | `/:id/alta` | Activar docente | `docentes:write` |

### Instituciones (`/api/instituciones`)

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| POST | `/` | Crear institución | `instituciones:write` |
| GET | `/` | Listar instituciones | `instituciones:read` |
| GET | `/:id` | Obtener institución | `instituciones:read` |
| PUT | `/:id` | Actualizar institución | `instituciones:write` |
| PATCH | `/:id/baja` | Soft delete | `instituciones:write` |
| PATCH | `/:id/alta` | Restaurar | `instituciones:write` |

### Planes de Monitoreo (`/api/planes-monitoreo`)

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| POST | `/` | Crear plan (multipart: PDF) | `monitoreo:execute` |
| GET | `/` | Listar planes | `monitoreo:execute` |
| GET | `/:id` | Obtener plan | `monitoreo:execute` |
| GET | `/:id/archivo` | Descargar PDF del plan | `monitoreo:execute` |
| DELETE | `/:id` | Toggle activo/inactivo | `monitoreo:execute` |
| GET | `/:id/cobertura` | IEs cubiertas por el plan | `monitoreo:execute` |
| POST | `/:id/cobertura/:institucionId` | Agregar IE a cobertura | `monitoreo:execute` |
| DELETE | `/:id/cobertura/:institucionId` | Quitar IE de cobertura | `monitoreo:execute` |

### Plantillas (`/api/plantillas`)

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| POST | `/` | Crear plantilla | `monitoreo:execute` |
| GET | `/` | Listar plantillas | `monitoreo:execute` |
| GET | `/:id` | Obtener plantilla completa | `monitoreo:execute` |
| PUT | `/:id` | Actualizar plantilla (versión) | `monitoreo:execute` |
| PATCH | `/:id/estado` | Cambiar estado (Borrador→Vigente→Historico) | `monitoreo:execute` |
| POST | `/:id/duplicar` | Duplicar plantilla | `monitoreo:execute` |

### Cronogramas (`/api/cronogramas`)

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| POST | `/` | Crear visita | `monitoreo:execute` |
| GET | `/` | Listar visitas | `monitoreo:execute` |
| GET | `/:id` | Obtener visita | `monitoreo:execute` |
| PATCH | `/:id` | Actualizar visita (solo estado) | `monitoreo:execute` |
| DELETE | `/:id` | Eliminar visita | `monitoreo:execute` |

### Solicitudes de Reprogramación (`/api/solicitudes-reprogramacion`)

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| POST | `/` | Crear solicitud | `monitoreo:execute` |
| GET | `/` | Listar solicitudes | `monitoreo:execute` |
| GET | `/:id` | Obtener solicitud | `monitoreo:execute` |
| POST | `/:id/aprobar` | Aprobar (aplica bypass trigger) | `monitoreo:execute` |
| POST | `/:id/rechazar` | Rechazar con comentario | `monitoreo:execute` |

### Fichas (`/api/fichas`)

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| POST | `/` | Crear ficha para una visita | `monitoreo:execute` |
| GET | `/visita/:cronogramaId` | Obtener ficha por visita | `monitoreo:execute` |
| GET | `/:id` | Obtener ficha por ID | `monitoreo:execute` |
| PATCH | `/:id/respuestas-desempeno` | Guardar respuestas de desempeño | `monitoreo:execute` |
| PATCH | `/:id/respuestas-aspecto/:aspectoId` | Guardar respuesta de aspecto | `monitoreo:execute` |
| PATCH | `/:id/finalizar` | Finalizar ficha (calcular puntaje) | `monitoreo:execute` |
| POST | `/:id/migrar-plantilla` | Migrar a nueva versión de plantilla | `monitoreo:execute` |

### Reportes (`/api/reportes`)

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| GET | `/fichas-completadas` | Lista paginada de fichas | `monitoreo:execute` |
| GET | `/resumen-ie` | Resumen agregado por IE | `monitoreo:execute` |
| GET | `/ficha/:id/export-html` | Exportar ficha a HTML imprimible | `monitoreo:execute` |

### Errores comunes

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request — datos inválidos o violación de FK |
| 401 | Unauthorized — no autenticado o token inválido |
| 403 | Forbidden — no tiene rol/permiso para la ruta |
| 404 | Not Found — recurso no existe |
| 409 | Conflict — violación de unicidad |
| 429 | Too Many Requests — rate limit excedido |
| 500 | Internal Server Error — error inesperado |

---

## 9. Seguridad

### Autenticación

- **JWT dual:** `accessToken` (15 min) + `refreshToken` (7 días)
- **Almacenamiento:** Cookies HttpOnly (no accesibles desde JavaScript), con `Secure` en producción y `SameSite` configurado
- **Sesiones en BD:** Cada token refresh verifica que la sesión esté activa en `sesiones_auth`
- **Cierre de sesión:** Elimina la sesión de BD e invalida cualquier token futuro
- **Bcrypt (12 rounds):** Contraseñas hasheadas con salt

### Autorización

- **RBAC:** 9 roles definidos, cada usuario tiene exactamente un rol
- **Permisos granulares:** Matriz rol-permiso en tabla `rol_permisos`. Permisos como `docentes:read`, `monitoreo:execute`, `especialistas:write`
- **Guards en cascada:** `AuthGuard` → `RolesGuard` → `PermissionsGuard`
- **Decoradores:** `@Roles('jefe_gestion', 'director_ie')` y `@RequirePermissions('monitoreo:execute')`

### Roles

| Rol | Prioridad | Acceso |
|-----|-----------|--------|
| `director_ugel` | Alta | Dashboard y reportes |
| `jefe_gestion` | Alta | Todo: especialistas, plantillas, planes, cronogramas, instituciones, docentes |
| `jefe_area` | Media | Solo instituciones y docentes de su nivel educativo asignado (Inicial/Primaria/Secundaria) |
| `especialista` | Media | Mis cronogramas, fichas, reportes (RLS filtra). Usa el sistema desde celular/tablet en campo |
| `director_ie` | Alta | Gestión de su IE: docentes, plantillas, planes |
| `coordinador_pedagogico` | Alta | Docente de base con cargo adicional. Monitoreo dentro de su propia IE (solo Secundaria) |
| `jefe_taller` | Alta | Docente de base con cargo adicional. Monitoreo de talleres dentro de su propia IE (Secundaria/CEPTRO) |
| `docente` | Baja | Solo reportes |
| `invitado` | Solo lectura | Acceso de solo lectura a la mayoría de secciones |

### Permisos (en `apps/backend/prisma/seeders/auth.js`)

11 permisos definidos: `docentes:read`, `docentes:write`, `instituciones:read`, `instituciones:write`, `especialistas:read`, `especialistas:write`, `monitoreo:execute`, `reportes:read`, `reportes:export`, `configuracion:read`, `configuracion:write`.

### Token handling

- `accessToken` expira en 15 minutos (configurable)
- `refreshToken` expira en 7 días
- Cada refresh genera un nuevo par y actualiza `lastActivityAt` en la sesión
- Si la sesión fue cerrada (logout), el token JWT aún válido no funcionará porque `isSessionActive()` en BD retorna false

### Protección de rutas

- **Frontend:** React Router redirige a `/login` si no hay sesión
- **Backend:** Guards en cada ruta protegida
- **RLS en BD:** Capa adicional a nivel fila: aunque un especialista intente consultar fichas de otro, PostgreSQL las filtra automáticamente

### Validaciones

- **Backend:** `ValidationPipe` global con `whitelist: true` (elimina campos no esperados) y `forbidNonWhitelisted: true` (rechaza campos extraños)
- **DTOs específicos:** class-validator con decoradores y validadores custom
- **Base de datos:** CHECK constraints evitan datos inconsistentes a nivel BD

### Medidas de seguridad implementadas

- **Helmet:** Headers de seguridad HTTP
- **Rate limiting:** `@nestjs/throttler` — 100 peticiones/minuto global, 5/min login, 3/min forgot/reset
- **Cookies HttpOnly:** No accesibles desde JS cliente
- **CORS:** Solo permite el origen configurado en `FRONTEND_URL`
- **RLS:** Aislamiento de datos por rol a nivel PostgreSQL
- **Trigger de inmutabilidad:** Protege fechas de cronogramas contra modificaciones directas

---

## 10. Flujo de Datos

### Ejemplo: Creación de una ficha de monitoreo

```
1. Frontend (React)
   ├── Usuario: Especialista hace clic en "Iniciar Monitoreo"
   ├── Se ejecuta: features/monitoreos/hooks/use-ficha-monitoreo.ts
   │   └── useMutation → fetch(POST /api/fichas, { credentials: 'include' })
   │
2. fetchInterceptor (shared/api/fetchInterceptor.ts)
   ├── Intercepta el fetch global
   ├── Agrega credentials: 'include' para cookies
   ├── En caso de 401 → intenta POST /api/auth/refresh
   │   └── Si refresh falla → redirige a /login
   └── En caso de éxito → retorna JSON
   │
3. Backend (NestJS)
   ├── Helmet → CookieParser → ValidationPipe
   ├── RlsMiddleware: set_config('app.user_id', req.user.sub)
   ├── AuthGuard: verify JWT + isSessionActive
   ├── PermissionsGuard: check 'monitoreo:execute'
   ├── FichaController.crear()
   │   ├── Valida DTO con class-validator
   │   └── Llama a FichaService.crear()
   │
4. FichaService
   ├── Consulta CronogramaRepository → verifica estado PROGRAMADO
   ├── Consulta PlantillaRepository → obtiene plantilla Vigente
   ├── Crea FichaContexto (vacío)
   ├── Crea FichaMonitoreo con:
   │   ├── puntajeTotal = 0
   │   ├── promedio = 1.0 (mínimo)
   │   ├── nivelLogro = 'INICIO'
   │   ├── estado = 'BORRADOR'
   │   └── creadoPorId = req.user.sub
   └── Retorna ficha creada
   │
5. Repository (PrismaFichaRepository)
   ├── Prisma query con RLS aplicado (fichas_monitoreo policy)
   ├── PostgreSQL ejecuta INSERT
   │   └── CHECK constraints validan promedios y estados
   └── Retorna registro creado
   │
6. Response viaja de vuelta:
   ├── FichaRepository → FichaService → FichaController
   ├── PrismaExceptionFilter captura errores (P2002, P2025)
   └── JSON response → fetchInterceptor → React Query cache
   │
7. Frontend actualiza UI
   ├── TanStack Query cachea la respuesta
   ├── Hook useMutation invalida queries relacionadas
   └── Componente re-renderiza con datos de la ficha
```

---

## 11. Dependencias Importantes

### Backend

| Dependencia | Propósito en el proyecto |
|-------------|--------------------------|
| `@nestjs/common/core` | Framework DI, decoradores, guards, pipes |
| `@nestjs/jwt` | Firma y verificación de tokens JWT |
| `@nestjs/config` | Variables de entorno centralizadas |
| `@nestjs/swagger` | Documentación automática de API (Swagger UI en /api/docs) |
| `@nestjs/throttler` | Rate limiting por endpoint |
| `@prisma/client` + `@prisma/adapter-pg` | ORM con adapter nativo PostgreSQL |
| `bcrypt` | Hashing de contraseñas (12 rounds) |
| `class-validator` + `class-transformer` | Validación y transformación de DTOs |
| `cookie-parser` | Parseo de cookies para extraer JWT |
| `helmet` | Headers de seguridad HTTP |
| `multer` | Manejo de multipart/form-data para subida de PDF |
| `nestjs-pino` + `pino-http` + `pino-pretty` | Logging estructurado |
| `nodemailer` | Envío de correos (recuperación de contraseña) |
| `pg` | Driver nativo de PostgreSQL |

### Frontend

| Dependencia | Propósito en el proyecto |
|-------------|--------------------------|
| `react` + `react-dom` 19 | UI declarativa y reactiva |
| `react-router-dom` 7 | Enrutamiento SPA con layout anidado |
| `@tanstack/react-query` 5 | Caché y sincronización con el servidor |
| `tailwindcss` 4 + `@tailwindcss/vite` | Estilos utilitarios |
| `tw-animate-css` | Animaciones CSS |
| `@fontsource-variable/geist` | Tipografía Geist (variable font) |
| `lucide-react` | Iconos SVG |
| `radix-ui` | Componentes headless accesibles (base de shadcn) |
| `shadcn` | CLI para componentes shadcn/ui |
| `class-variance-authority` | Variantes de componentes (cva) |
| `clsx` + `tailwind-merge` | Combinación condicional de clases |
| `zod` | Validación de formularios |
| `@vitejs/plugin-react` | Transform JSX + Fast Refresh |

### Monorepo

| Dependencia | Propósito |
|-------------|-----------|
| `pnpm` 11.5.0 | Gestor de paquetes con workspaces |
| `concurrently` | Ejecutar frontend y backend en paralelo |
| `typescript` 6 | Tipado estático en todo el proyecto |
| `eslint` + `prettier` | Linting y formateo |

---

## 12. Configuración del Proyecto

### Variables de entorno (`.env`)

```bash
# Base de datos
DATABASE_URL=postgresql://admin:admin@localhost:5432/monitoring?schema=public

# Backend
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# JWT
JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12

# SMTP (Mailpit local)
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=no-reply@ugel-lampa.gob.pe
```

### Requisitos

- Node.js >= 22 (`.nvmrc` especifica 24.16.0)
- pnpm >= 11
- Docker (para PostgreSQL 17 + Mailpit)

### Scripts disponibles

Desde la raíz:

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Inicia frontend y backend en paralelo |
| `pnpm build` | Compila todos los paquetes |
| `pnpm start` | Inicia backend en producción |
| `pnpm lint` | Ejecuta ESLint en todos los paquetes |
| `pnpm format` | Formatea código con Prettier |
| `pnpm typecheck` | Verifica tipos en frontend y backend |

Backend:

| Script | Descripción |
|--------|-------------|
| `pnpm --filter backend dev` | Inicia backend en modo watch |
| `pnpm --filter backend build` | Compila backend |
| `pnpm --filter backend test` | Tests unitarios |
| `pnpm --filter backend test:e2e` | Tests end-to-end |
| `pnpm --filter backend prisma:migrate` | Ejecuta migrations |
| `pnpm --filter backend prisma:studio` | Abre Prisma Studio |
| `pnpm --filter backend prisma:seed` | Ejecuta seeders |

Frontend:

| Script | Descripción |
|--------|-------------|
| `pnpm --filter frontend dev` | Inicia Vite dev server :5173 |
| `pnpm --filter frontend build` | Compila frontend |
| `pnpm --filter frontend preview` | Preview del build |

### Cómo ejecutar

```bash
# 1. Clonar e instalar dependencias
pnpm install

# 2. Iniciar infraestructura (PostgreSQL + Mailpit)
docker compose up -d

# 3. Ejecutar migrations
pnpm --filter backend prisma:migrate

# 4. Poblar base de datos con datos de prueba
pnpm --filter backend prisma:seed

# 5. Iniciar desarrollo
pnpm dev
```

### Cómo compilar

```bash
pnpm build
```

### Cómo desplegar

No hay scripts de despliegue definidos. Los directorios `infrastructure/docker/`, `infrastructure/kubernetes/`, `infrastructure/nginx/` y `infrastructure/scripts/` están vacíos (contienen solo `.gitkeep`). El proyecto está configurado con un archivo `vercel.json` en el frontend para posible despliegue en Vercel.

> **Nota:** Actualmente solo existe entorno de desarrollo local. Se requiere definir entornos de staging y producción con pipeline CI/CD. El sistema está diseñado para 50-200 usuarios concurrentes.

### Migración de datos

Existen datos históricos en Excel que deben migrarse al sistema. No hay un proceso de migración automatizado implementado aún.

---

## 13. Estructura del Proyecto

```
/
├── apps/
│   ├── backend/                       → Backend NestJS 11
│   │   ├── prisma/
│   │   │   ├── schema.prisma          → Modelo de datos (42 modelos)
│   │   │   └── migrations/            → 16 migraciones SQL
│   │   └── src/
│   │       ├── main.ts                → Bootstrap: pipes, filters, CORS, Swagger
│   │       ├── app.module.ts          → Módulo raíz con módulos de negocio
│   │       ├── common/
│   │       │   ├── enums/             → RoleCode, CargoNombre, CondicionLaboral, Estados
│   │       │   ├── filters/           → PrismaClientExceptionFilter
│   │       │   └── validators/        → IsValidNivelForModalidad, IsValidEspecialidadForNivel
│   │       ├── shared/
│   │       │   ├── prisma/            → PrismaService + RlsMiddleware (GUCs)
│   │       │   ├── mailer/            → MailerService (Nodemailer + Mailpit)
│   │       │   ├── storage/           → DiskStorageService (PDF local)
│   │       │   └── health/            → Health check endpoint
│   │       ├── modules/
│   │       │   ├── auth/              → Login, JWT, sesiones, guards (Auth, Roles, Permissions)
│   │       │   ├── teachers/          → CRUD docentes + cargos + cursos + secciones
│   │       │   ├── institutions/      → CRUD IE + soft delete
│   │       │   ├── especialistas/     → CRUD especialistas + especialidades
│   │       │   ├── catalogs/          → Catálogos (modalidades, niveles, cursos, cargos, roles)
│   │       │   ├── monitoring/        → Planes (PDF) + Plantillas (versionado)
│   │       │   ├── scheduling/        → Cronogramas + Solicitudes de reprogramación
│   │       │   ├── evaluations/       → Fichas + BaremoCalculator
│   │       │   └── reports/           → Reportes + exportación HTML
│   │       └── generated/             → Prisma Client (gitignored)
│   │
│   └── frontend/                      → Frontend React 19 + Vite 8
│       └── src/
│           ├── app/
│           │   ├── config.tsx          → Providers globales (Query, User, etc.)
│           │   ├── routers.tsx        → Rutas por rol
│           │   └── RootRedirect.tsx   → Redirección post-login según rol
│           ├── entities/              → Modelos de negocio
│           │   ├── model-user/        → UserContext, UserProvider, useUser
│           │   ├── model-docentes/    → Docentes interfaces, contexto
│           │   ├── model-instituciones/ → IE interfaces, contexto
│           │   ├── model-especialistas/ → Especialistas interfaces
│           │   ├── model-jefes-area/  → Jefes de área interfaces
│           │   ├── model-plantillas/  → Plantillas interfaces + contexto
│           │   ├── model-cronogramas/ → Cronogramas interfaces + contexto
│           │   ├── model-reportes/    → Reportes interfaces
│           │   └── model-reprogramaciones/ → Reprogramaciones interfaces
│           ├── features/              → Funcionalidades completas
│           │   ├── login/             → LoginPage + login-service (lógica de estado)
│           │   ├── docentes/          → CRUD docentes UI
│           │   ├── instituciones/     → CRUD IE UI
│           │   ├── especialistas/     → CRUD especialistas UI
│           │   ├── jefes-area/        → CRUD jefes de área UI
│           │   ├── directores/        → Gestión directores UI
│           │   ├── monitoreos/        → Fichas (use-ficha-monitoreo)
│           │   ├── planes-monitoreo/  → Planes UI
│           │   └── reprogramaciones/  → Reprogramaciones UI
│           ├── widgets/               → Componentes reutilizables y layouts
│           │   ├── layouts/           → AppShell, Sidebar (con configuración por rol), Topbar
│           │   ├── auth/              → Componentes de autenticación
│           │   ├── docentes/          → Tablas, formularios docentes
│           │   ├── instituciones/     → Tablas, formularios IE
│           │   ├── especialistas/     → Tablas, formularios especialistas
│           │   ├── jefes-area/        → Tablas jefes de área
│           │   ├── plantillas/        → Formularios de plantillas + desempeños
│           │   ├── calendario/        → Vista calendario de visitas
│           │   ├── reportes/          → Tablas de reportes
│           │   ├── reprogramaciones/  → Formularios de reprogramación
│           │   └── directores/        → Gestión de directores
│           ├── pages/                 → Páginas por rol
│           │   ├── login/            → Página de inicio de sesión
│           │   ├── jefeGestion/      → Dashboard Jefe de Gestión
│           │   ├── jefeArea/         → Dashboard Jefe de Área
│           │   ├── director/         → Dashboard Director IE
│           │   ├── especialista/     → Dashboard Especialista
│           │   └── directorUgel/     → Dashboard Director UGEL
│           └── shared/
│               ├── api/              → fetchInterceptor, auth.api
│               ├── config/           → features.ts (PERSISTENCE_MODE)
│               ├── constants/        → roles.ts (ROLE_PERMISSIONS, getDefaultLandingPage)
│               ├── lib/              → Utilidades (cn, etc.)
│               ├── types/            → Tipos compartidos
│               └── ui/               → shadcn/ui components (Button, Card, etc.)
│
├── packages/
│   ├── shared-contracts/             → Interfaces y DTOs compartidos (TypeScript)
│   │   └── src/
│   │       ├── auth/                 → ILoginRequest, ILoginResponse, etc.
│   │       ├── teachers/             → ICreateDocenteRequest, IDocenteResponse
│   │       ├── institutions/         → Create, Update, Query contracts
│   │       ├── especialistas/        → ICreateEspecialistaRequest
│   │       ├── jefes-area/           → Jefes de área contracts
│   │       ├── monitoring/           → Plan contracts
│   │       ├── scheduling/           → IVisita, ISolicitudReprogramacion
│   │       ├── plantillas/           → IPlantilla, Create/Update contracts
│   │       ├── evaluations/          → IFichaMonitoreo, NivelLogro, EstadoFicha
│   │       ├── reports/              → IReporteFicha, IReporteResumenIE
│   │       └── constants/            → ModalidadEducativa, MODALIDAD_NIVEL_MAP, etc.
│   │
│   └── shared-types/                 → Tipos mínimos compartidos (UserRole)
│
├── database/
│   ├── seeders/                      → Seeders de la BD
│   │   ├── index.js                 → Orquestador
│   │   ├── _lib/prisma.js           → Cliente Prisma
│   │   ├── _lib/helpers.js          → Validadores (DNI, email) + findOrCreate
│   │   ├── auth.js                  → Roles, permisos, usuarios
│   │   ├── catalogos.js             → Modalidades, niveles, especialidades, cursos
│   │   ├── cargos.js                → Cargos docentes
│   │   ├── instituciones.js         → IEs de prueba (Lampa/Puno)
│   │   ├── personas.js              → 12 personas/usuarios (DNI=password)
│   │   ├── monitoring.js            → Plantillas y planes de prueba
│   │   ├── scheduling.js            → Cronograma de prueba
│   │   └── dev-seed.js              → Seed monolítico alternativo
│   ├── schemas/                     → Vacío (solo .gitkeep)
│   └── migrations/                  → Vacío (solo .gitkeep)
│
├── docs/
│   ├── TEST_PLAN.md                 → Plan de pruebas manual (18 pasos)
│   ├── decisions/
│   │   └── docs-architecture-git-workflow.md → ADR-001: Git Flow
│   └── api/
│       └── sprint3.md               → Documentación API Sprint 3
│
├── infrastructure/                  → Directorios vacíos (solo .gitkeep)
│   ├── docker/
│   ├── kubernetes/
│   ├── logging/
│   ├── monitoring/
│   ├── nginx/
│   └── scripts/
│
├── docker-compose.yml               → PostgreSQL 17 + Mailpit
├── .env                             → Variables de entorno
├── package.json                     → Scripts raíz del monorepo
├── pnpm-workspace.yaml              → Workspaces: apps/*, packages/*
├── eslint.config.js                 → ESLint flat config
├── .prettierrc                      → Configuración de Prettier
├── .gitignore
├── .gitattributes
├── .npmrc
├── .nvmrc                           → Node 24.16.0
├── README.md
├── CONTRIBUTING.md
└── PROJECT_DOCUMENTATION.md         → Este archivo
```

---

## 14. Módulos del Sistema

### 14.1 Módulo de Autenticación

**Objetivo:** Gestionar identidad digital, sesiones y control de acceso.

**Responsabilidades:**
- Login con DNI + contraseña (rate limited, bloqueo por intentos)
- Logout con invalidación de sesión
- Refresh automático de tokens JWT
- Cambio de contraseña (con forzado en primer login)
- Recuperación de contraseña vía email
- Auditoría de eventos de autenticación

**Dependencias:** `Persona`, `Usuario`, `SesionAuth`, `TokenRecuperacion`, `Role`, `Permiso`, `LogAuditoria`

**Archivos principales:**
- `modules/auth/auth.module.ts`
- `modules/auth/controllers/auth.controller.ts`
- `modules/auth/services/auth-session.service.ts`, `auth-token.service.ts`, `auth-password.service.ts`
- `modules/auth/guards/auth.guard.ts`, `roles.guard.ts`, `permissions.guard.ts`
- `modules/auth/repositories/*.ts` (interfaces + implementaciones Prisma)
- `modules/auth/decorators/roles.decorator.ts`, `permissions.decorator.ts`, `allow-first-login.decorator.ts`

### 14.2 Módulo de Docentes

**Objetivo:** Gestionar la plana docente de las instituciones educativas.

**Responsabilidades:**
- CRUD de docentes con datos académicos y laborales
- Asignación de cargos (Director, Coordinador, etc.)
- Asignación de cursos y secciones
- Asignación de especialidades
- Creación automática de usuario con password = DNI hasheado

**Reglas de negocio:** Cargos restrictivos requieren condición laboral específica y nivel educativo Secundaria. El Coordinador Pedagógico y Jefe de Taller son docentes de base que además realizan monitoreo dentro de su propia institución.

**Archivos principales:**
- `modules/teachers/teachers.module.ts`
- `modules/teachers/controllers/teachers.controller.ts`
- `modules/teachers/services/*.service.ts`
- `modules/teachers/repositories/*.ts`

### 14.3 Módulo de Instituciones

**Objetivo:** Gestionar el padrón de instituciones educativas.

**Responsabilidades:**
- CRUD con código modular único
- Soft delete/restore
- Extracción del director de la IE
- Filtrado por ámbito según rol del usuario

**Archivos principales:**
- `modules/institutions/institutions.module.ts`
- `modules/institutions/controllers/institutions.controller.ts`
- `modules/institutions/services/*.service.ts`
- `modules/institutions/repositories/*.ts`

### 14.4 Módulo de Especialistas

**Objetivo:** Gestionar los especialistas de monitoreo.

**Responsabilidades:**
- CRUD de especialistas con cargo (Especialista, Jefe de Área, Jefe de Gestión)
- Asignación de especialidades
- Validación de condición laboral según cargo
- Activación/desactivación

**Reglas:** Jefe de Gestión requiere condición laboral Nombrado.

**Archivos principales:**
- `modules/especialistas/especialistas.module.ts`
- `modules/especialistas/controllers/especialista.controller.ts`
- `modules/especialistas/services/*.service.ts`
- `modules/especialistas/repositories/*.ts`

### 14.5 Módulo de Catálogos

**Objetivo:** Catálogos maestros transversales.

**Responsabilidades:**
- Búsqueda de institución por ID/código
- Búsqueda de cargo por ID
- Listado de cargos
- Búsqueda de rol por código
- Búsqueda de persona por DNI/email

**Dependencias:** Modulos de negocio que requieren datos maestros.

**Archivos principales:**
- `modules/catalogs/catalogs.module.ts`
- `modules/catalogs/repositories/catalogs.repository.ts`, `prisma-catalogs.repository.ts`

### 14.6 Módulo de Monitoreo (Planes + Plantillas)

**Objetivo:** Gestionar planes anuales de monitoreo y plantillas de evaluación.

**Responsabilidades:**
- CRUD de planes con carga PDF
- Gestión de cobertura IE por plan
- CRUD de plantillas con versionado
- Ciclo de vida: Borrador → Vigente → Historico
- Gestión de desempeños, aspectos, niveles de calificación y rúbricas

**Reglas:** Una plantilla Vigente por (tipo, año). Versionado automático al editar plantilla vigente con fichas asociadas.

**Archivos principales:**
- `modules/monitoring/monitoring.module.ts`
- `modules/monitoring/controllers/monitoring-plan.controller.ts`, `plantilla.controller.ts`
- `modules/monitoring/services/plantilla.service.ts`
- `modules/monitoring/repositories/monitoring-plan.repository.ts`, `plantilla.repository.ts`

### 14.7 Módulo de Scheduling (Cronogramas + Reprogramaciones)

**Objetivo:** Programar visitas de monitoreo y gestionar cambios.

**Responsabilidades:**
- CRUD de visitas con asignación especialista-IE-docente
- Control de máximo 3 pendientes por especialista
- Flujo de reprogramación: solicitar → aprobar/rechazar
- Trigger de inmutabilidad de fecha/hora

**Reglas:** Máximo 3 programadas por especialista. Fecha/hora inmutables sin aprobación de reprogramación.

**Archivos principales:**
- `modules/scheduling/scheduling.module.ts`
- `modules/scheduling/controllers/scheduling.controller.ts`
- `modules/scheduling/services/scheduling.service.ts`
- `modules/scheduling/repositories/*.ts`

### 14.8 Módulo de Evaluaciones

**Objetivo:** Registrar y calcular fichas de monitoreo.

**Responsabilidades:**
- Creación de fichas vinculadas a visitas
- Registro de contexto (curso, estudiantes)
- Registro de respuestas de desempeño y aspectos
- Finalización con cálculo de puntaje y nivel de logro
- Migración de fichas entre versiones de plantilla

**Reglas:** Una ficha por visita. Cálculo de nivel de logro con gaps (1.5, 2.5, 3.5). Promedio entre 1.0 y 4.0.

**Archivos principales:**
- `modules/evaluations/evaluations.module.ts`
- `modules/evaluations/controllers/ficha.controller.ts`
- `modules/evaluations/services/ficha.service.ts`, `baremo-calculator.service.ts`
- `modules/evaluations/repositories/*.ts`

### 14.9 Módulo de Reportes

**Objetivo:** Consultas agregadas y exportación de datos.

**Responsabilidades:**
- Listado paginado de fichas completadas
- Resumen agregado por institución educativa
- Exportación de ficha individual a HTML imprimible
- Filtrado por rol (scope de datos)

**Archivos principales:**
- `modules/reports/reports.module.ts`
- `modules/reports/controllers/reporte.controller.ts`
- `modules/reports/services/reporte.service.ts`

---

## 15. Decisiones de Diseño

### 15.1 Repository Pattern con interfaces abstractas

**Decisión:** Cada módulo define una interfaz de repositorio (ej. `UserRepository`) y una implementación concreta (`PrismaUserRepository`).

**Beneficios:**
- Los servicios dependen de abstracciones, no de Prisma directamente
- Los tests unitarios pueden mockear repositorios fácilmente
- Si en el futuro se cambia de ORM, solo se modifican las implementaciones

### 15.2 Feature-Sliced Design (FSD) en Frontend

**Decisión:** Organizar el frontend por funcionalidad de negocio (entities → features → widgets → pages) en lugar de por tipo técnico (components/containers/hooks).

**Beneficios:**
- Alta cohesión: lo relacionado a docentes está en un solo lugar
- Bajo acoplamiento: cambiar una feature no afecta otras
- Escalabilidad: añadir una nueva funcionalidad es crear una nueva carpeta

### 15.3 Contratos compartidos (shared-contracts)

**Decisión:** Paquete separado con interfaces TypeScript que definen los contratos entre frontend y backend.

**Beneficios:**
- Type safety extremo a extremo: si cambia un DTO, TypeScript detecta inconsistencias en ambos lados
- Single source of truth para la forma de los datos
- Documentación viva de la API

### 15.4 JWT en cookies HttpOnly (no localStorage)

**Decisión:** Los tokens JWT se almacenan en cookies con flag HttpOnly, no en localStorage.

**Beneficios:**
- Protección contra XSS: JS malicioso no puede leer el token
- Envío automático en cada petición (no requiere header manual)
- Las cookies pueden marcarse como Secure + SameSite

### 15.5 RLS en PostgreSQL

**Decisión:** Aislamiento de datos a nivel base de datos mediante Row Level Security.

**Beneficios:**
- Segunda capa de seguridad: incluso si un request pasa los guards con un rol incorrecto, la BD filtra los datos
- Consistencia: cualquier acceso a los datos (API, consulta directa, reporte custom) respeta las políticas
- Las policies se evalúan por fila automáticamente

### 15.6 Trigger de inmutabilidad de cronogramas

**Decisión:** Bloquear modificaciones directas de fecha/hora en cronogramas mediante un trigger de base de datos.

**Beneficios:**
- Regla de negocio forzada a nivel BD: ni siquiera un bug en el backend puede saltarla
- Trazabilidad: todas las reprogramaciones quedan registradas como solicitudes
- Bypass controlado: la función `aplicarReprogramacion` usa una GUC para permitir el cambio legítimo

### 15.7 Versionado de plantillas (IN_PLACE vs VERSIONADO)

**Decisión:** Dos estrategias de actualización según el estado de la plantilla.

**Razonamiento:**
- Si la plantilla es Borrador y no tiene fichas → modificar in-place (más simple, sin duplicación)
- Si está Vigente y tiene fichas → versionar (las fichas existentes mantienen su versión, nuevas fichas usan la nueva)
- Esto evita romper fichas existentes al modificar los criterios de evaluación

### 15.8 Gaps intencionales en el baremo

**Decisión:** Los niveles de logro tienen gaps (1.5, 2.5, 3.5) que no son alcanzables.

**Razonamiento:** Forzar al evaluador a decidir un nivel claramente definido, evitando promedios fronterizos que podrían interpretarse de múltiples maneras. Un promedio de 1.5 es imposible, eliminando la ambigüedad.

### 15.9 Monorepo con pnpm workspaces

**Decisión:** Un solo repositorio con múltiples paquetes (frontend, backend, shared-contracts, shared-types).

**Beneficios:**
- Dependencias compartidas (TypeScript, ESLint, Prettier)
- Contratos compartidos sin publicar a npm
- Un solo comando para desarrollo (`pnpm dev`)
- Build atómico: cambios en shared-contracts se reflejan inmediatamente

### 15.10 Validación en múltiples capas

**Decisión:** Validar datos en frontend (zod), backend (class-validator), y BD (CHECK constraints).

**Razonamiento:**
- UX: el usuario recibe feedback inmediato en el frontend
- Seguridad: el backend nunca confía en datos del cliente
- Integridad: la BD es la última línea de defensa contra datos inconsistentes

---

## 16. Mejoras Potenciales

### Código duplicado

1. **Validadores duplicados:** Algunas validaciones de reglas de negocio (como la verificación de condición laboral para cargos restrictivos) pueden aparecer tanto en DTOs como en servicios. Se podría centralizar en el módulo de catálogos.

### Acoplamiento excesivo

2. **RLS vs Scoping en servicios:** El scoping por rol se maneja tanto en las RLS policies (BD) como en los servicios (backend). Esto puede llevar a inconsistencias. Se recomienda elegir una capa dominante (idealmente BD con RLS) y simplificar el código del servicio.

3. **Acceso a BD para verificar sesión:** El `AuthGuard` consulta `sesiones_auth` en cada request para verificar que la sesión esté activa. Si el sistema escala, esto puede ser un cuello de botella. Alternativas: usar Redis para sesiones o incluir el estado en el JWT mediante blacklist de JTIs.

### Posibles refactorizaciones

4. **Compartir lógica de filtrado por rol:** El filtrado de datos según el rol del usuario (ej. "Jefe de Gestión ve todo, Director IE solo su IE") se repite en varios servicios. Se podría extraer a un helper o decorador de consulta.

5. **Middleware RLS con pool connections:** El `RlsMiddleware` usa `set_config` con `false` (duración de sesión de conexión), lo que en entornos con PgBouncer puede causar "leakage" entre requests. El código ya documenta esto como TODO. Solución: usar `pool.connect()` por request.

6. **Seed monolítico vs modular:** Existen dos seeders (`index.js` modular y `dev-seed.js` monolítico). Esto duplica datos de prueba y puede causar inconsistencias. Unificar en el orquestador modular.

### Riesgos técnicos

7. **Almacenamiento local de PDFs:** Los planes y archivos de sustento se guardan en disco local (`uploads/`). En producción con múltiples instancias o balanceadores, esto no funciona. Se debería migrar a S3 o similar.

8. **Vista materializada no refrescada:** `mv_consolidado_mensual` se crea con datos iniciales pero no hay un mecanismo de refresco periódico (no se encontró cron job ni trigger para actualizarla).

9. **Falta de migraciones para infraestructura:** Los directorios de infraestructura (`docker/`, `kubernetes/`, `nginx/`, etc.) están vacíos. El proyecto no tiene scripts de despliegue, CI/CD, ni configuración para producción.

10. **Sin modo offline (requisito crítico):** Dado que muchas IE en zonas rurales de Puno carecen de internet estable, el sistema debe poder funcionar offline. Actualmente la arquitectura es 100% online (SPA + REST API). Los especialistas usan el sistema desde celular/tablet en campo y llenan las fichas directamente en digital, por lo que la desconexión es un riesgo real.

11. **Sin exportación a PDF:** Los reportes solo están disponibles en HTML. Se requiere exportación a PDF.

12. **Migración de datos desde Excel:** Existen datos históricos en hojas de cálculo que deben migrarse al sistema. No hay un proceso automatizado.

### Deuda técnica

11. **Tipos redundantes:** Existen `shared-types` (mínimo) y `shared-contracts` (extenso). El tipo `UserRole` está definido en ambos. Unificar en `shared-contracts`.

12. **Prisma migrations manuales:** La migración 12 (`sprint3_catalogos_y_indices`) se generó manualmente con `CREATE TABLE IF NOT EXISTS`, lo que sugiere que el schema de Prisma no se usó como única fuente de verdad en ese punto.

13. **Alias de roles:** Existen `director_ie` y `director_institucion` como roles separados, con un alias en TypeScript (`director_ie` como fallback). Esto puede confundir. Unificar en un solo nombre.

### Recomendaciones

- Implementar un **sistema de logs centralizado** (actualmente solo logs en consola con pino-pretty)
- Agregar **tests de integración** para los flujos críticos (login → crear visita → llenar ficha → reporte)
- **Containerizar** la aplicación completa (Dockerfile para backend y frontend)
- Agregar **mecanismo de caché** (Redis) para tokens de refresh y consultas frecuentes
- Implementar **refresh programado** de la vista materializada mensual
- **Diseñar una estrategia offline:** Service Workers + IndexedDB para caché local de catálogos y fichas, con cola de sincronización al recuperar conexión. Esto es prioritario porque los especialistas usan el sistema desde celular/tablet en campo y llenan fichas directamente en digital.
- **Implementar exportación a PDF** de fichas y reportes (librería como Puppeteer, jsPDF o similar)
- **Crear proceso de migración** de datos históricos desde Excel
- **Definir entornos** (staging, producción) y un pipeline CI/CD antes del despliegue real

---

## 17. Resumen Ejecutivo

El **Sistema de Monitoreo Educativo UGEL Lampa** es una aplicación web construida con **NestJS 11** y **React 19** que digitaliza el proceso de monitoreo pedagógico en instituciones educativas de la provincia de Lampa, Puno, Perú.

### Cómo funciona de extremo a extremo

1. **Inicio de sesión:** Un usuario (Jefe de Gestión, Especialista, Director, etc.) ingresa con su DNI y contraseña. El backend valida credenciales, verifica bloqueos, registra la sesión y devuelve dos JWT en cookies HttpOnly. Si es el primer acceso, se obliga a cambiar la contraseña temporal.

2. **Gestión de datos maestros:** El Jefe de Gestión o el Jefe de Área registra instituciones educativas (con código modular único) y docentes (con cargos, cursos, secciones y especialidades). Cada docente obtiene un usuario automático con contraseña = su DNI hasheado.

3. **Creación de especialistas:** Se registran los especialistas que realizarán las visitas de monitoreo, asignándoles un cargo (Especialista, Jefe de Área o Jefe de Gestión) y especialidades según su nivel educativo.

4. **Elaboración de plantillas:** El Jefe de Gestión crea plantillas de evaluación con desempeños, aspectos y rúbricas. Una plantilla pasa de Borrador a Vigente, y si se modifica después de usarse, se versiona automáticamente.

5. **Planificación anual:** Se cargan planes de monitoreo (PDF) con cobertura sobre las instituciones que serán visitadas durante el año académico.

6. **Programación de visitas:** Se asignan visitas (cronogramas) vinculando un especialista, una institución, un docente y una fecha. Un especialista no puede tener más de 3 visitas pendientes. Si necesita cambiar la fecha, debe pasar por un flujo de solicitud y aprobación de reprogramación.

7. **Ejecución del monitoreo:** El especialista asiste a la institución, crea una ficha de monitoreo vinculada a la visita, registra el contexto (curso, estudiantes), evalúa cada desempeño con un nivel (1-4) y marca aspectos cumplidos. Al finalizar, el sistema calcula automáticamente: puntaje total, promedio, y nivel de logro (INICIO, EN PROCESO, LOGRO ESPERADO, LOGRO DESTACADO).

8. **Reportes:** Los datos consolidados están disponibles en reportes paginados y exportables a HTML, con filtros por institución y especialista. El acceso está controlado por rol: un Director IE solo ve su institución, un Especialista solo sus fichas, el Jefe de Gestión lo ve todo.

### Stack técnico clave

| Componente | Tecnología |
|------------|------------|
| Backend | NestJS 11 (TypeScript 6, ESM) |
| Frontend | React 19, Vite 8, Tailwind 4, shadcn/ui |
| ORM | Prisma 7 con adapter PostgreSQL nativo |
| BD | PostgreSQL 17 con RLS, triggers, CHECK constraints |
| Auth | JWT (HttpOnly cookies), bcrypt (12 rounds), RBAC |
| Monorepo | pnpm workspaces, TypeScript 6 |
| Logging | pino (nestjs-pino) |
| Email | Nodemailer + Mailpit (desarrollo) |
| Testing | Jest, Supertest (e2e) |

### Principios arquitectónicos

- **Repository Pattern** con interfaces abstractas y concretas
- **Feature-Sliced Design** en frontend (FSD)
- **Seguridad en capas**: Helmet → Rate Limiting → Guards (Auth → Roles → Permissions) → RLS en BD
- **Validación multi-capa**: Zod (frontend) → class-validator (backend) → CHECK constraints (BD)
- **Reglas de negocio en BD**: triggers para inmutabilidad, índices parciales para unicidad condicional
- **Contratos compartidos** entre frontend y backend (shared-contracts)

### Estado del proyecto

El proyecto se encuentra en **fase de desarrollo/pruebas** (Sprint 3 completado) con la funcionalidad central implementada: autenticación, CRUD de entidades, monitoreo, evaluaciones y reportes. Aún no está en producción.

**Contexto adicional:**
- **Escala esperada:** 50 a 200 instituciones educativas, 50-200 usuarios concurrentes
- **Equipo:** Contacto directo con UGEL Lampa para requisitos, los cuales cambian frecuentemente
- **Sin integraciones externas** con otros sistemas del estado (ESCALE, NEXUS, SIAGIE, etc.)
- **Datos manejados:** Solo personal docente y administrativo (sin datos de estudiantes)
- **Requiere modo offline** como funcionalidad crítica aún no implementada — los especialistas usan el sistema desde celular/tablet en campo y llenan fichas directamente en digital
- **Dispositivos:** El sistema debe funcionar tanto en escritorio como en dispositivos móviles
- **Reportes:** Se requiere exportación a PDF (actualmente solo HTML)
- **Migración:** Existen datos históricos en Excel que deben migrarse al sistema
- **Infraestructura de despliegue y CI/CD** no definida — solo entorno de desarrollo local
