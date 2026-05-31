# Guía de Contribución — Sistema de Monitoreo

Este documento define el flujo de trabajo completo para todos los integrantes del equipo de desarrollo.
Aplica a este monorepo (PNPM Workspaces) y debe seguirse desde el primer día de trabajo.

---

## Tabla de contenidos

1. [Requisitos previos](#1-requisitos-previos)
2. [Configuración inicial del entorno](#2-configuración-inicial-del-entorno)
3. [Estrategia de ramas](#3-estrategia-de-ramas)
4. [Flujo de trabajo diario](#4-flujo-de-trabajo-diario)
5. [Estándar de commits](#5-estándar-de-commits)
6. [Pull Requests / Merge Requests](#6-pull-requests--merge-requests)
7. [Comandos raíz del monorepo](#7-comandos-raíz-del-monorepo)
8. [Estructura del monorepo](#8-estructura-del-monorepo)
9. [Reglas de protección](#9-reglas-de-protección)
10. [Preguntas frecuentes](#10-preguntas-frecuentes)

---

## 1. Requisitos previos

| Herramienta | Versión mínima | Notas |
|-------------|----------------|-------|
| Node.js | 22+ | Se recomienda usar `.nvmrc` (24.16.0) |
| pnpm | 11+ | Gestor de paquetes del monorepo |
| Docker | Cualquier versión estable | Para levantar PostgreSQL local |
| Git | 2.40+ | — |

---

## 2. Configuración inicial del entorno

Ejecuta esto **una sola vez** al clonar el repositorio:

```bash
# 1. Usar la versión de Node correcta (si tienes nvm)
nvm use

# 2. Instalar dependencias del monorepo completo
pnpm install

# 3. Copiar variables de entorno
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env

# 4. Levantar PostgreSQL con Docker
docker compose up -d

# 5. Generar Prisma Client
pnpm --filter backend prisma:generate

# 6. Ejecutar migraciones
pnpm --filter backend prisma:migrate

# 7. Arrancar en modo desarrollo
pnpm dev
```

---

## 3. Estrategia de ramas

```
main
 └── develop
      ├── feature/<nombre-corto>
      ├── fix/<nombre-corto>
      └── release/<versión>
```

| Rama | Propósito | ¿Quién puede hacer push directo? |
|------|-----------|----------------------------------|
| `main` | Código en producción | **Nadie** — solo vía MR aprobada |
| `develop` | Integración continua del equipo | **Nadie** — solo vía MR |
| `feature/<nombre>` | Nueva funcionalidad del sprint | El autor de la rama |
| `fix/<nombre>` | Corrección de error | El autor de la rama |
| `release/<versión>` | Preparación de release | Tech Lead + Gestor de Configuración |

### Convención de nombres de ramas

```
feature/auth-jwt
feature/monitoring-form
fix/login-token-expiry
fix/prisma-migration-init
release/1.0.0
```

- Usar **kebab-case** en minúsculas.
- Nombre corto y descriptivo (máximo 4-5 palabras).
- No incluir tu nombre personal ni el número de ticket de forma obligatoria,
  aunque puedes incluir el ID si ayuda a trazabilidad (ej. `feature/SC-12-auth-jwt`).

---

## 4. Flujo de trabajo diario

### Inicio de una tarea nueva

```bash
# Asegurarte de estar actualizado con develop
git checkout develop
git pull origin develop

# Crear tu rama de trabajo
git checkout -b feature/<nombre-corto>
```

### Durante el desarrollo

```bash
# Ver qué has cambiado
git status

# Agregar cambios puntuales (evitar git add . sin revisar)
git add apps/backend/src/modules/auth/

# Commit siguiendo el estándar (ver sección 5)
git commit -m "feat(auth): implementar guard JWT con roles"

# Subir tu rama al remoto
git push origin feature/<nombre-corto>
```

### Mantener tu rama actualizada

Si tu rama lleva más de 1-2 días sin sincronizarse con `develop`, hazlo antes de abrir la MR:

```bash
git fetch origin
git rebase origin/develop
```

> **Preferir `rebase` sobre `merge`** para mantener el historial limpio y lineal.

---

## 5. Estándar de commits

Este proyecto sigue la especificación [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

### Estructura

```
<tipo>(<ámbito>): <descripción breve en imperativo>

[cuerpo opcional — explica el "por qué", no el "qué"]

[pie opcional — referencias, breaking changes]
```

### Tipos permitidos

| Tipo | Cuándo usarlo |
|------|---------------|
| `feat` | Nueva funcionalidad visible para el usuario o el sistema |
| `fix` | Corrección de un error |
| `docs` | Solo cambios en documentación |
| `style` | Formato, espaciado, punto y coma — sin cambio de lógica |
| `refactor` | Cambio de código sin corregir bugs ni añadir features |
| `test` | Añadir o corregir pruebas |
| `chore` | Cambios en build, tooling, dependencias, CI/CD |
| `perf` | Mejora de rendimiento |
| `ci` | Cambios en configuración de CI/CD |

### Ámbitos recomendados

Corresponden a los módulos del backend y features del frontend:

`auth` · `users` · `institutions` · `teachers` · `monitoring` · `scheduling`  
`evaluations` · `reports` · `notifications` · `sync` · `dashboard`  
`bff` · `shared` · `prisma` · `infra` · `workspace`

### Ejemplos correctos

```bash
# Feature nueva
git commit -m "feat(auth): implementar autenticación JWT con roles de usuario"

# Bug fix
git commit -m "fix(monitoring): corregir cálculo de baremo en criterio 3"

# Con cuerpo
git commit -m "refactor(prisma): extraer PrismaService a módulo shared

Se mueve PrismaService fuera de AppModule para permitir
importación en cualquier módulo sin dependencias circulares."

# Breaking change en el pie
git commit -m "feat(auth)!: cambiar estructura del payload JWT

BREAKING CHANGE: el campo userId ahora es sub para cumplir con RFC 7519."

# Documentación
git commit -m "docs(api): actualizar contrato REST del módulo de evidencias"

# Chore de workspace
git commit -m "chore(workspace): agregar .gitattributes para normalizar line endings"
```

### Ejemplos incorrectos ❌

```bash
git commit -m "arreglos"
git commit -m "WIP"
git commit -m "cambios en auth"
git commit -m "fixed bug"
git commit -m "actualizacion del codigo"
```

---

## 6. Pull Requests / Merge Requests

### Antes de abrir una MR

- [ ] Tu rama está actualizada con `develop` (rebase).
- [ ] `pnpm typecheck` pasa sin errores.
- [ ] `pnpm lint` pasa sin errores.
- [ ] `pnpm build` pasa sin errores (opcional, pero recomendado).
- [ ] La descripción de la MR está completa.

### Template de MR

El repositorio ya incluye un template en [`.github/pull_request_template.md`](.github/pull_request_template.md).
Complétalo siempre que abras una MR.

### Reglas de revisión

- Toda MR a `develop` requiere **al menos 1 aprobación** del Tech Lead o un senior del área.
- Toda MR a `main` requiere **aprobación del Gestor de Configuración**.
- No hacer self-merge bajo ninguna circunstancia.
- Resolver todos los comentarios antes de mergear.

### Merge strategy

- De `feature/*` → `develop`: **Squash & Merge** para commits limpios.
- De `develop` → `main`: **Merge Commit** para mantener trazabilidad de release.

---

## 7. Comandos raíz del monorepo

Todos los comandos se ejecutan desde la raíz del repositorio:

```bash
pnpm dev              # Arranca frontend + backend en paralelo
pnpm dev:frontend     # Solo frontend
pnpm dev:backend      # Solo backend

pnpm build            # Build de todos los workspaces
pnpm typecheck        # Verificación de tipos (frontend + backend)
pnpm lint             # Lint de todos los workspaces
pnpm format           # Formatear con Prettier

pnpm --filter backend prisma:generate   # Generar Prisma Client
pnpm --filter backend prisma:migrate    # Ejecutar migraciones
pnpm --filter backend prisma:studio     # Abrir Prisma Studio
```

> Para correr un comando en un workspace específico:
> ```bash
> pnpm --filter frontend <comando>
> pnpm --filter backend <comando>
> pnpm --filter shared-types <comando>
> ```

---

## 8. Estructura del monorepo

```
monitoring-system/
├── apps/
│   ├── frontend/          → React + Vite + Tailwind CSS (FSD)
│   └── backend/           → NestJS + Prisma (BFF)
├── packages/
│   ├── shared-types/      → Tipos TypeScript compartidos entre apps
│   ├── shared-contracts/  → Contratos de API (DTOs, schemas)
│   ├── shared-validation/ → Validadores reutilizables (Zod / class-validator)
│   └── shared-utils/      → Utilidades puras compartidas
├── database/
│   ├── migrations/        → Migraciones SQL (Prisma)
│   ├── seeders/           → Scripts de semilla de datos
│   └── schemas/           → Schemas de referencia
├── infrastructure/        → Docker, Nginx, Kubernetes, scripts de infra
├── docs/                  → Documentación técnica del proyecto
├── tests/                 → Tests e2e, integración y performance
└── .github/               → Workflows CI/CD, CODEOWNERS, templates
```

### Regla de dependencias entre workspaces

```
frontend  →  shared-types, shared-contracts, shared-validation, shared-utils
backend   →  shared-types, shared-contracts, shared-validation, shared-utils
```

- Los paquetes en `packages/` **no dependen** de `apps/`.
- `apps/` **no dependen entre sí**.
- Los paquetes `shared-*` solo contienen código puro y tipado, sin side effects.

---

## 9. Reglas de protección

### Absolutas (no negociables)

- ❌ **Nunca** hacer `git push --force` en `main` o `develop`.
- ❌ **Nunca** commitear archivos `.env` con credenciales reales.
- ❌ **Nunca** desactivar TypeScript strict mode o añadir `// @ts-ignore` sin justificación en PR.
- ❌ **Nunca** instalar dependencias directamente con `npm install` o `yarn add` — usar siempre `pnpm add`.

### Buenas prácticas obligatorias

- ✅ Usar siempre tipos explícitos en TypeScript (evitar `any`).
- ✅ Usar DTOs con `class-validator` en todos los endpoints del backend.
- ✅ Manejar errores con `HttpException` o filtros globales en NestJS.
- ✅ Toda función pública en `shared-*` debe tener tipado de entrada y salida.
- ✅ No subir `pnpm-lock.yaml` modificado accidentalmente — revisar siempre antes del commit.

---

## 10. Preguntas frecuentes

### ¿Puedo hacer push directo a develop?
No. Todo cambio entra por MR con al menos 1 aprobación.

### ¿Qué hago si mi rama tiene conflictos con develop?
```bash
git fetch origin
git rebase origin/develop
# Resolver conflictos archivo por archivo
git rebase --continue
git push origin feature/<nombre> --force-with-lease
```
Usar `--force-with-lease` en lugar de `--force`: es más seguro porque falla si alguien más subió cambios.

### ¿Dónde instalo una nueva dependencia?
```bash
# En el workspace correcto, no en raíz
pnpm --filter backend add <paquete>
pnpm --filter frontend add <paquete>

# Dependencia compartida (solo si aplica a todo el monorepo)
pnpm add -w <paquete>
```

### ¿Puedo commitear el pnpm-lock.yaml?
Sí, siempre. El lockfile es parte del repo y garantiza reproducibilidad.
Nunca lo edites manualmente.

### ¿Cómo agrego un tipo compartido?
En `packages/shared-types/src/index.ts`. Luego importa con:
```typescript
import type { MiTipo } from '@monitoring/shared-types';
```

### ¿Qué hago si rompí algo en develop?
Abre un `fix/<nombre>` de inmediato, notifica al equipo en el canal,
y abre MR con urgencia. No intentes arreglarlo con commits directos.

---

> **¿Dudas?** Contacta al Tech Lead (DES-08) o al Gestor de Configuración (DES-06).
