# 🏗️ Auditoría Completa de Arquitectura FSD

> **Proyecto:** Sistema de Monitoreo — Frontend  
> **Fecha:** 2026-06-05  
> **Resultado:** ⚠️ **FSD Parcial** — Buena base, pero con **10 violaciones críticas** que corregir

---

## 📊 Resumen Ejecutivo

| Métrica | Estado |
|---------|--------|
| **Capas FSD definidas** | ✅ 6/6 (`app`, `pages`, `widgets`, `features`, `entities`, `shared`) |
| **Path aliases** | ✅ Configurados en `tsconfig` + `vite.config` |
| **Public APIs (index.ts)** | ⚠️ 14/23 slices con código tienen index.ts |
| **Violaciones de importación** | 🔴 **11 violaciones** detectadas |
| **Páginas "delgadas"** | ⚠️ Solo 4 de 17 son composiciones puras |
| **SVGs inline pendientes** | ⚠️ **48 instancias** en 24 archivos |
| **Slices vacíos (placeholder)** | 9 directorios con solo `.gitkeep` |

---

## 🔴 Las 10 Violaciones Críticas

### 1. Importación ascendente: `pages → app`

> [!CAUTION]
> Esta es la violación más grave. En FSD, las páginas **nunca** deben importar de la capa `app`.

```
pages/auth/AuthRouter.tsx:L8
  import { AppShell } from '@app/AppShell'  ← ¡INVERTIDO!
```

**Regla FSD:** `app > pages > widgets > features > entities > shared`  
**Solución:** Mover `AppShell` como layout a `widgets/` o usar un approach de composición en `app/routes.tsx`.

---

### 2. `features/authentication/` sin Public API (`index.ts`)

> [!WARNING]
> 6 archivos de rutas hacen deep-imports directamente al interior de este feature.

| Archivo | Línea | Import ilegal |
|---------|:-----:|---------------|
| [admin.routes.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/administration/admin.routes.tsx#L3) | L3 | `from '@features/authentication/ui/ProtectedRoute'` |
| [dashboard.routes.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/dashboard/dashboard.routes.tsx#L3) | L3 | Mismo |
| [monitoring.routes.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/monitoring/monitoring.routes.tsx#L3) | L3 | Mismo |
| [reports.routes.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/reports/reports.routes.tsx#L3) | L3 | Mismo |
| [institutions.routes.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/institutions/institutions.routes.tsx#L3) | L3 | Mismo |
| [settings.routes.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/settings/settings.routes.tsx#L3) | L3 | Mismo |

**Solución:** Crear `features/authentication/index.ts` y exportar `ProtectedRoute` desde ahí.

---

### 3. Widgets sin estructura de slice

> [!WARNING]
> `Sidebar.tsx` y `TopBar.tsx` están directamente en `widgets/` sin seguir la estructura `slice/ui/`.

```
widgets/
├── Sidebar.tsx        ← ❌ Debería ser widgets/sidebar/ui/Sidebar.tsx
├── TopBar.tsx         ← ❌ Debería ser widgets/topbar/ui/TopBar.tsx
├── institution-list/  ← ✅ Correcto
│   ├── index.ts
│   └── ui/
```

**Solución:** Mover a `widgets/sidebar/ui/Sidebar.tsx` con su `index.ts`.

---

### 4. Páginas demasiado pesadas (anti-patrón FSD)

En FSD, las páginas deben ser **composiciones delgadas** de widgets y features. Estas no lo son:

| Página | Líneas | Problema |
|--------|:------:|----------|
| [DashboardPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/dashboard/DashboardPage.tsx) | **320** | Mock data hardcodeado, SVG de mapa inline, lógica de colores |
| [LoginPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/auth/LoginPage.tsx) | **291** | Timer de penalización, modal, validación Zod compleja |
| [ResetPasswordPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/auth/ResetPasswordPage.tsx) | **~280** | 7 SVGs inline, lógica de validación de contraseña |
| [ForgotPasswordPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/auth/ForgotPasswordPage.tsx) | **~230** | 5 SVGs inline, manejo de estado complejo |
| [DocenteEditPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/administration/DocenteEditPage.tsx) | **118** | UI de error, lookup de mock data, navegación |
| [EspecialistaEditPage.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/pages/administration/EspecialistaEditPage.tsx) | **135** | UI de error, lookup de mock data, navegación |

✅ **Páginas que SÍ cumplen FSD:**

| Página | Líneas | Nota |
|--------|:------:|------|
| `DocentesPage.tsx` | 5 | ✅ Solo renderiza `<TeacherList />` |
| `InstitutionsPage.tsx` | 30 | ✅ Composición pura |
| `InstitutionCreatePage.tsx` | 25 | ✅ Composición pura |
| `EspecialistasPage.tsx` | 15 | ✅ Composición pura |

---

### 5. Mock data dentro de entities (se envía a producción)

| Archivo | Problema |
|---------|----------|
| [entities/institution/model/mocks.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/institution/model/mocks.ts) | `MOCK_INSTITUCIONES` array |
| [entities/teacher/model/mocks.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/teacher/model/mocks.ts) | `MOCK_DOCENTES` array |
| [entities/specialist/model/mocks.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/specialist/model/mocks.ts) | `MOCK_ESPECIALISTAS` array |
| [entities/user/model/types.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/entities/user/model/types.ts) | `MOCK_USERS` mezclado con tipos |

**Solución:** Cuando se integre el backend real, mover a `__mocks__/` o a un directorio de testing.

---

### 6. 48 SVGs inline en 24 archivos

Ya se limpiaron los archivos más pesados (InstitutionList, TeacherList, SpecialistList, LoginPage, etc.), pero quedan **24 archivos** con SVGs:

| Capa | Archivos pendientes | SVGs |
|------|:-------------------:|:----:|
| `entities/` | 9 archivos | ~12 |
| `features/` | 1 archivo (EspecialistaDeleteModal) | 2 |
| `pages/` | 9 archivos | ~25 |
| `widgets/` | 3 archivos (profiles) | ~8 |
| `shared/` | 1 archivo (PlaceholderPage) | 1 |

---

### 7. `authConfig.ts` nunca se usa

[shared/constants/authConfig.ts](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/shared/constants/authConfig.ts) define `AUTH_SECURITY` con constantes como `MAX_ATTEMPTS` y `PENALTY_TIME`, pero [AuthProvider.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/app/providers/AuthProvider.tsx) **hardcodea** esos valores como números mágicos.

---

### 8. Sin Public APIs en pages

`app/routes.tsx` importa directamente desde archivos internos:

```ts
import { AuthRouter } from '@pages/auth/AuthRouter';              // ← deep import
import { adminRoutes } from '@pages/administration/admin.routes';  // ← deep import
import { dashboardRoutes } from '@pages/dashboard/dashboard.routes';
// ... etc
```

**Solución:** Cada carpeta de página necesita un `index.ts` que exporte su ruta.

---

### 9. Directorios redundantes en shared

```
shared/
├── lib/       ← FSD usa esto ✅
├── utils/     ← Redundante con lib/ ❌ (vacío)
├── hooks/     ← Vacío ❌
├── config/    ← Vacío ❌
├── assets/
│   ├── icons/ ← Tiene LogoUgelIcon ✅
│   └── iconos/ ← Vacío, duplicado de icons/ ❌
```

---

### 10. Cross-entity coupling en features

| Archivo | Import | Problema |
|---------|--------|----------|
| [InstitutionForm.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/features/manage-institutions/ui/InstitutionForm.tsx#L4) | `from '@entities/teacher'` | Feature de instituciones importa de teacher |
| [InstitutionEditForm.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/features/manage-institutions/ui/InstitutionEditForm.tsx#L4) | `from '@entities/teacher'` | Mismo |
| [DocenteForm.tsx](file:///home/drajev/Proyectos/Sistema-Monitoreo/apps/frontend/src/features/manage-teachers/ui/DocenteForm.tsx#L8) | `from '@entities/specialist'` | Feature de teachers importa de specialist |

> [!NOTE]
> Técnicamente, features **pueden** importar de cualquier entity (no es violación de capa), pero indica **acoplamiento fuerte**. Los tipos compartidos deberían estar en `shared/` o en una entity común.

---

## ✅ Lo que está BIEN

| Aspecto | Detalle |
|---------|---------|
| **Capas definidas** | Las 6 capas FSD existen con la jerarquía correcta |
| **Path aliases** | `@app`, `@pages`, `@widgets`, `@features`, `@entities`, `@shared` |
| **Entities bien segmentadas** | Todas tienen `model/` + `ui/` con tipos separados |
| **Widgets con public API** | Los 6 widget-slices tienen `index.ts` correctos |
| **Features con public API** | 3 de 4 features activos tienen `index.ts` |
| **No hay cross-imports dentro de la misma capa** | ✅ Ningún entity importa de otro entity directamente |
| **Shared UI rico** | 18 componentes reusables (shadcn/ui) |
| **useAuth centralizado** | Hook de autenticación correctamente en `entities/user` |

---

## 📋 Plan de Refactorización Priorizado

### Fase 1: Violaciones Críticas de Estructura (urgente)

| # | Tarea | Archivos |
|:-:|-------|----------|
| 1 | Crear `features/authentication/index.ts` | 1 nuevo |
| 2 | Mover `Sidebar.tsx` → `widgets/sidebar/ui/Sidebar.tsx` + `index.ts` | 2 archivos |
| 3 | Mover `TopBar.tsx` → `widgets/topbar/ui/TopBar.tsx` + `index.ts` | 2 archivos |
| 4 | Resolver import invertido `AuthRouter.tsx → AppShell` | Refactor de rutas |
| 5 | Crear `index.ts` para cada carpeta de pages | ~7 nuevos |

### Fase 2: Limpieza de Páginas Pesadas

| # | Tarea | Archivos |
|:-:|-------|----------|
| 6 | Extraer `DashboardPage` en widgets (`DashboardStats`, `DashboardMap`, etc.) | 3-4 nuevos |
| 7 | Extraer lógica de `LoginPage` a `features/authentication/model/` | 2-3 archivos |
| 8 | Limpiar `ForgotPasswordPage` y `ResetPasswordPage` (SVGs + lógica) | 2 archivos |

### Fase 3: SVGs Inline Restantes

| # | Tarea | Archivos |
|:-:|-------|----------|
| 9 | Reemplazar SVGs en `entities/*/ui/` por Lucide | 9 archivos |
| 10 | Reemplazar SVGs en `pages/administration/` por Lucide | 6 archivos |
| 11 | Reemplazar SVGs en `widgets/*/profile/` por Lucide | 3 archivos |
| 12 | Reemplazar SVG en `EspecialistaDeleteModal` | 1 archivo |
| 13 | Reemplazar SVGs en pages de auth restantes | 2 archivos |

### Fase 4: Limpieza y Consistency

| # | Tarea | Archivos |
|:-:|-------|----------|
| 14 | Eliminar `shared/utils/` (redundante con `lib/`) | 1 directorio |
| 15 | Eliminar `shared/assets/iconos/` (duplicado de `icons/`) | 1 directorio |
| 16 | Conectar `authConfig.ts` en `AuthProvider` | 2 archivos |
| 17 | Eliminar slices vacíos placeholder sin uso futuro inmediato | ~9 directorios |

### Fase 5: Preparación para Backend (futuro)

| # | Tarea | Archivos |
|:-:|-------|----------|
| 18 | Mover `mocks.ts` a `__mocks__/` o `testing/` | 3-4 archivos |
| 19 | Separar constantes UI de tipos puros en `entities/institution/model/` | 1-2 archivos |
| 20 | Mover `login.schema.ts` de `pages/auth/model/` a `features/authentication/model/` | 1 archivo |

---

## 🗂️ Árbol de Archivos Completo

```
src/
├── index.css
├── main.tsx
├── app/
│   ├── App.tsx
│   ├── AppShell.tsx
│   ├── routes.tsx
│   └── providers/
│       ├── AuthProvider.tsx
│       └── index.ts            ✅
├── entities/
│   ├── institution/
│   │   ├── index.ts            ✅
│   │   ├── model/ (types.ts, mocks.ts)
│   │   └── ui/ (6 componentes)
│   ├── teacher/
│   │   ├── index.ts            ✅
│   │   ├── model/ (types.ts, mocks.ts)
│   │   └── ui/ (4 componentes)
│   ├── specialist/
│   │   ├── index.ts            ✅
│   │   ├── model/ (types.ts, mocks.ts)
│   │   └── ui/ (3 componentes)
│   ├── user/
│   │   ├── index.ts            ✅
│   │   └── model/ (types.ts, session.ts)
│   ├── evaluation/             ← vacío
│   ├── report/                 ← vacío
│   └── schedule/               ← vacío
├── features/
│   ├── authentication/
│   │   ├── ❌ SIN index.ts
│   │   └── ui/ProtectedRoute.tsx
│   ├── manage-institutions/
│   │   ├── index.ts            ✅
│   │   └── ui/ (2 forms)
│   ├── manage-specialists/
│   │   ├── index.ts            ✅
│   │   └── ui/ (form + modal)
│   ├── manage-teachers/
│   │   ├── index.ts            ✅
│   │   └── ui/ (form + modal)
│   └── 6 slices vacíos...
├── widgets/
│   ├── ❌ Sidebar.tsx          ← sin slice
│   ├── ❌ TopBar.tsx           ← sin slice
│   ├── institution-list/       ✅ (index.ts + ui/)
│   ├── institution-profile/    ✅
│   ├── specialist-list/        ✅
│   ├── specialist-profile/     ✅
│   ├── teacher-list/           ✅
│   └── teacher-profile/        ✅
├── pages/
│   ├── auth/ (5 páginas, sin index.ts)
│   ├── administration/ (8 páginas, sin index.ts)
│   ├── dashboard/ (1 página pesada)
│   ├── institutions/ (4 páginas)
│   ├── monitoring/ (solo routes)
│   ├── reports/ (solo routes)
│   └── settings/ (solo routes)
└── shared/
    ├── api/auth.api.ts
    ├── assets/icons/LogoUgelIcon.tsx
    ├── constants/ (authConfig.ts, roles.ts)
    ├── lib/utils.ts
    └── ui/ (18 componentes shadcn)
```
