-- Sprint 3 - Catalogos transversales + normalizacion cursos/especialidad + indices unicos parciales
-- (Generado manualmente; el schema ya esta aplicado via prisma db push)

-- CreateTable modalidades
CREATE TABLE IF NOT EXISTS "modalidades" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "modalidades_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "modalidades_codigo_key" ON "modalidades"("codigo");

-- CreateTable niveles_educativos
CREATE TABLE IF NOT EXISTS "niveles_educativos" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "modalidad_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "niveles_educativos_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "niveles_educativos_codigo_modalidad_id_key" ON "niveles_educativos"("codigo", "modalidad_id");

-- CreateTable especialidades
CREATE TABLE IF NOT EXISTS "especialidades" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "nivel_educativo_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "especialidades_nombre_nivel_educativo_id_key" ON "especialidades"("nombre", "nivel_educativo_id");

-- CreateTable docente_especialidades
CREATE TABLE IF NOT EXISTS "docente_especialidades" (
    "id" UUID NOT NULL,
    "docente_id" UUID NOT NULL,
    "especialidad_id" UUID NOT NULL,
    CONSTRAINT "docente_especialidades_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "docente_especialidades_docente_id_especialidad_id_key" ON "docente_especialidades"("docente_id", "especialidad_id");

-- CreateTable especialista_especialidades
CREATE TABLE IF NOT EXISTS "especialista_especialidades" (
    "id" UUID NOT NULL,
    "especialista_id" UUID NOT NULL,
    "especialidad_id" UUID NOT NULL,
    CONSTRAINT "especialista_especialidades_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "especialista_especialidades_especialista_id_especialidad_id_key" ON "especialista_especialidades"("especialista_id", "especialidad_id");

-- AlterTable instituciones_educativas: add nivel_educativo_id, mantener modalidad/nivel_educativo como denormalizados
-- para compatibilidad con codigo legacy y DTOs del frontend
ALTER TABLE "instituciones_educativas" ADD COLUMN IF NOT EXISTS "nivel_educativo_id" UUID;

-- AlterTable cursos: drop modalidad/nivel_educativo, add nivel_educativo_id
ALTER TABLE "cursos" ADD COLUMN IF NOT EXISTS "nivel_educativo_id" UUID;
ALTER TABLE "cursos" DROP COLUMN IF EXISTS "modalidad";
ALTER TABLE "cursos" DROP COLUMN IF EXISTS "nivel_educativo";

-- AlterTable docentes: drop especialidad varchar (especialidad ahora M:N via docente_especialidades)
ALTER TABLE "docentes" DROP COLUMN IF EXISTS "especialidad";

-- AlterTable especialistas: drop especialidad varchar
ALTER TABLE "especialistas" DROP COLUMN IF EXISTS "especialidad";

-- AddForeignKey
ALTER TABLE "niveles_educativos" ADD CONSTRAINT "niveles_educativos_modalidad_id_fkey" FOREIGN KEY ("modalidad_id") REFERENCES "modalidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "especialidades" ADD CONSTRAINT "especialidades_nivel_educativo_id_fkey" FOREIGN KEY ("nivel_educativo_id") REFERENCES "niveles_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "instituciones_educativas" ADD CONSTRAINT "instituciones_educativas_nivel_educativo_id_fkey" FOREIGN KEY ("nivel_educativo_id") REFERENCES "niveles_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_nivel_educativo_id_fkey" FOREIGN KEY ("nivel_educativo_id") REFERENCES "niveles_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "docente_especialidades" ADD CONSTRAINT "docente_especialidades_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "docente_especialidades" ADD CONSTRAINT "docente_especialidades_especialidad_id_fkey" FOREIGN KEY ("especialidad_id") REFERENCES "especialidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "especialista_especialidades" ADD CONSTRAINT "especialista_especialidades_especialista_id_fkey" FOREIGN KEY ("especialista_id") REFERENCES "especialistas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "especialista_especialidades" ADD CONSTRAINT "especialista_especialidades_especialidad_id_fkey" FOREIGN KEY ("especialidad_id") REFERENCES "especialidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indices unicos parciales para reglas de negocio (ESP-0045B, EDU-0002)
-- 1. Una sola plantilla Vigente por (tipo_monitoreo, anio_academico)
CREATE UNIQUE INDEX IF NOT EXISTS "uq_plantilla_vigente_tipo_anio"
    ON "plantillas_monitoreo" ("tipo_monitoreo", "anio_academico")
    WHERE "estado" = 'Vigente' AND "deleted" = false;

-- 2. Una sola solicitud PENDIENTE por cronograma
CREATE UNIQUE INDEX IF NOT EXISTS "uq_solicitud_pendiente_por_cronograma"
    ON "solicitudes_reprogramacion" ("cronograma_id")
    WHERE "estado" = 'PENDIENTE';

-- 3. Un plan UGEL Activo por anio (autor = jefe_gestion)
CREATE UNIQUE INDEX IF NOT EXISTS "uq_plan_ugel_activo"
    ON "planes_monitoreo" ("anio_academico")
    WHERE "rol_autor_al_crear" = 'jefe_gestion' AND "estado" = 'Activo' AND "deleted" = false;

-- 4. Un plan IE Activo por (autor, anio) - en la practica es 1:1 con la institucion
CREATE UNIQUE INDEX IF NOT EXISTS "uq_plan_ie_activo"
    ON "planes_monitoreo" ("autor_id", "anio_academico")
    WHERE "rol_autor_al_crear" = 'director_ie' AND "estado" = 'Activo' AND "deleted" = false;
