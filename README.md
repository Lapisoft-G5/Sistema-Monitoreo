# Sistema de Monitoreo

Monorepo para el sistema de monitoreo educativo de la UGEL Lampa.

## Requisitos previos

- Node.js 22+
- pnpm 11+
- Docker & Docker Compose (para base de datos y captura de correos)

## Inicio rápido

```bash
# 1. Instalar dependencias
pnpm install

# 2. Levantar servicios locales (PostgreSQL & Mailpit)
docker compose up -d

# 3. Copiar variables de entorno de desarrollo
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env

# 4. Generar Prisma Client
pnpm --filter backend prisma:generate

# 5. Ejecutar migraciones
pnpm --filter backend prisma:migrate

# 6. Poblar la base de datos con semillas (seeder de desarrollo)
pnpm --filter backend prisma:seed

# 7. Arrancar el entorno de desarrollo
pnpm dev
```

---

## Poblado de Datos (Database Seeding)

El monorepo cuenta con un script de semillas (`database/seeders/index.js`) diseñado para poblar la base de datos con roles, usuarios e instituciones reales, listos para pruebas pedagógicas y de seguridad.

> [!IMPORTANT]
> El seeder importa clases compiladas de TypeScript del backend (como Prisma Client y helpers), por lo que **es indispensable que el backend esté construido** antes de correr el seeder. Si acabas de clonar el repositorio, la secuencia correcta es:
>
> ```bash
> pnpm build
> pnpm --filter backend prisma:seed
> ```

### Usuarios de Prueba (DNI = contraseña inicial)

Para realizar pruebas, puedes utilizar los siguientes usuarios autogenerados:

- `40000001` → Administrador (Carlos Mendoza)
- `40000002` → Jefe de Gestión (María Elena Huamán)
- `40000004` → Especialista (Ana Lucía Ticona)
- `40000006` → Director de I.E. (Rosa María Apaza)

Para un listado detallado de más perfiles, flujos y credenciales de prueba, consulta el plan de QA en `docs/TEST_PLAN.md` (Sección 5).

---

## Guía de Resolución de Problemas (Troubleshooting)

### ¿Cuándo usar `pnpm approve-builds`?

En entornos monorepo pnpm, los scripts de ciclo de vida nativos (como la compilación de `bcrypt` mediante `node-gyp`) pueden ser bloqueados por seguridad al realizar un `pnpm install`, resultando en un error de compilación o instalación.

- **Problema**: Recibes advertencias de scripts nativos bloqueados o `bcrypt` falla al ejecutarse en tiempo de ejecución.
- **Solución**: Ejecuta la aprobación global de compilaciones en el espacio de trabajo:
  ```bash
  pnpm approve-builds
  ```
  O aprueba explícitamente el paquete nativo:
  ```bash
  pnpm approve-builds bcrypt
  ```
  Esto permite que pnpm compile correctamente los binarios optimizados del módulo de cifrado bcrypt en tu sistema operativo local.

### Error de Migración en Desarrollo (Conflictos de Columnas Requeridas / NOT NULL)

Si al ejecutar `pnpm --filter backend prisma:migrate` (o `prisma migrate dev`) obtienes un error indicando que no se pueden aplicar los cambios de base de datos porque se están agregando columnas obligatorias (`NOT NULL` sin `DEFAULT`) a tablas que ya contienen registros (como `roles` o `especialistas`), es debido a que tu base de datos local contiene registros antiguos incompatibles con el nuevo esquema.

- **Problema**: Mensaje de error similar a: _`Added the required column 'cargo' to the 'especialistas' table without a default value...`_
- **Solución**: Reinicia tu base de datos local de desarrollo para eliminar los datos antiguos, aplicar las migraciones limpias y repoblar la base de datos con las nuevas semillas:
  ```bash
  pnpm --filter backend exec prisma migrate reset
  ```
  _(Este comando vacía la base de datos local, aplica todas las migraciones en orden y ejecuta el seeder de desarrollo de manera automática)._

---

## Pruebas de Calidad (QA) y Auditoría con Docker

Para facilitar el trabajo del equipo de QA al validar las políticas de seguridad (bloqueos temporales, auditoría de eventos e intentos fallidos), las bases de datos y herramientas de correo están aisladas en contenedores Docker estables.

### Monitoreo de Correos Recibidos (Mailpit)

Todas las solicitudes de recuperación de contraseña en local son capturadas por **Mailpit**.

- **Bandeja de Entrada Web**: Abre [http://localhost:8025/](http://localhost:8025/) en tu navegador para auditar visualmente los correos emitidos con los enlaces de un solo uso.

### Consultas SQL mediante Docker (Sin necesidad de clientes gráficos)

Para un trabajo consistente, **hemos fijado el nombre del contenedor de la base de datos a `monitoring-postgres`** en el archivo `docker-compose.yml` (evitando los IDs de contenedor dinámicos).

#### 1. Entrar al contenedor de PostgreSQL

Abre una terminal dentro del contenedor de la base de datos:

```bash
docker exec -it monitoring-postgres bash
```

#### 2. Abrir la consola de PostgreSQL

Una vez dentro del contenedor, inicia `psql` como usuario administrador:

```bash
psql -U admin -d monitoring
```

#### 3. Ver y filtrar logs de auditoría (Login, Bloqueos, Cambios de Clave)

Ejecuta esta consulta para obtener los últimos 10 logs de seguridad registrados:

```sql
SELECT created_at, event_type, event_detail, ip_address
FROM auth_audit_logs
ORDER BY created_at DESC
LIMIT 10;
```

#### 4. Verificar estado de bloqueos y contadores de intentos de usuarios

Consulta los intentos fallidos acumulados y el tiempo de bloqueo activo (`locked_until`):

```sql
SELECT dni, email, failed_login_attempts, locked_until, is_active
FROM users;
```

#### 5. Ver sesiones activas y revocadas en tiempo real

Verifica el estado de las sesiones persistidas (JTI, IP y estado de expiración):

```sql
SELECT user_id, session_jti, ip_address, is_revoked, expires_at
FROM auth_sessions;
```

#### 6. Salir

Para salir de `psql`:

```sql
\q
```

Y luego salir del contenedor:

```bash
exit
```

---

## Estructura

```
apps/
  frontend/   → React + Vite + Tailwind (FSD)
  backend/    → NestJS + Prisma (BFF)
packages/
  shared-contracts/  → Contratos de API compartidos
```

## Scripts de Workspace

| Comando             | Descripción                                        |
| ------------------- | -------------------------------------------------- |
| `pnpm dev`          | Arranca frontend + backend simultáneamente         |
| `pnpm dev:frontend` | Ejecuta únicamente el cliente frontend             |
| `pnpm dev:backend`  | Ejecuta únicamente el servidor backend             |
| `pnpm build`        | Compila todos los proyectos y paquetes compartidos |
| `pnpm lint`         | Analiza el código con ESLint en todo el monorepo   |
| `pnpm typecheck`    | Valida tipos TypeScript en frontend y backend      |
| `pnpm format`       | Formatea el código con Prettier                    |
