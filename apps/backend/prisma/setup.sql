-- ============================================================================
-- setup.sql — Provisioning del rol `monitoreo_app` para la aplicacion
-- ============================================================================
-- La conexion del backend al Postgres es `admin/admin` (superuser). Eso BYPASSEA
-- todas las RLS policies (BYPASSRLS = true por default en superusers).
--
-- Para que RLS funcione, el backend debe conectarse con un rol que NO sea
-- superuser. Este script crea el rol `monitoreo_app` con los permisos
-- minimos para la aplicacion y le quita BYPASSRLS.
--
-- Uso:
--   1. Correr este script UNA VEZ en el ambiente (desarrollo, staging, prod).
--   2. Cambiar `DATABASE_URL` en `.env` para usar `monitoreo_app` en vez de
--      `admin`.
--
-- Idempotente: se puede correr multiples veces sin error.
-- ============================================================================

DO $$
BEGIN
    -- Crear rol si no existe.
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'monitoreo_app') THEN
        CREATE ROLE monitoreo_app LOGIN PASSWORD 'CHANGE_ME_FOR_LOCAL_DEV';
    END IF;
END
$$;

-- NO superuser, NO bypass RLS, NO replication, etc.
ALTER ROLE monitoreo_app NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOREPLICATION;

-- Privilegios connect + temporary (algunos clientes Prisma lo piden).
GRANT CONNECT ON DATABASE monitoring TO monitoreo_app;
GRANT TEMPORARY ON DATABASE monitoring TO monitoreo_app;

-- Schema public: solo lo que la app necesita.
GRANT USAGE ON SCHEMA public TO monitoreo_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO monitoreo_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO monitoreo_app;

-- ALTER DEFAULT PRIVILEGES: para tablas/sequences creadas en el futuro por
-- migraciones (Prisma las crea como admin). Sin esto, las nuevas tablas
-- quedan inaccesibles para monitoreo_app.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO monitoreo_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO monitoreo_app;

-- Permisos especificos para pg_catalog (necesario para que Prisma funcione).
GRANT USAGE ON SCHEMA pg_catalog TO monitoreo_app;
GRANT SELECT ON ALL TABLES IN SCHEMA pg_catalog TO monitoreo_app;
