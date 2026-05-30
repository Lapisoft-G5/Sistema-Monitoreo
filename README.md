# Sistema de Monitoreo

Monorepo para el sistema de monitoreo educativo.

## Requisitos previos

- Node.js 22+
- pnpm 11+
- Docker (para PostgreSQL)

## Inicio rápido

```bash
# 1. Instalar dependencias
pnpm install

# 2. Levantar PostgreSQL
docker compose up -d

# 3. Copiar variables de entorno
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env

# 4. Generar Prisma Client
pnpm --filter backend prisma:generate

# 5. Ejecutar migraciones
pnpm --filter backend prisma:migrate

# 6. Arrancar desarrollo
pnpm dev
```

## Estructura

```
apps/
  frontend/   → React + Vite + Tailwind (FSD)
  backend/    → NestJS + Prisma (BFF)
packages/
  shared-types/  → Tipos TypeScript compartidos
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Arranca frontend + backend |
| `pnpm dev:frontend` | Solo frontend |
| `pnpm dev:backend` | Solo backend |
| `pnpm build` | Build de todos los paquetes |
| `pnpm lint` | Lint de todos los paquetes |
| `pnpm typecheck` | Verificación de tipos |
| `pnpm format` | Formatear con Prettier |
