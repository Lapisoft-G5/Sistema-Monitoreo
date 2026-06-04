-- DropIndex
DROP INDEX "users_dni_key";

-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "dni",
DROP COLUMN "email",
DROP COLUMN "first_name",
DROP COLUMN "last_name",
ADD COLUMN     "persona_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "personas" (
    "id" UUID NOT NULL,
    "dni" VARCHAR(8) NOT NULL,
    "nombres" VARCHAR(120) NOT NULL,
    "apellidos" VARCHAR(120) NOT NULL,
    "correo" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instituciones_educativas" (
    "id" UUID NOT NULL,
    "codigo_modular" VARCHAR(7) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "nivel_educativo" VARCHAR(50) NOT NULL,
    "departamento" VARCHAR(50) NOT NULL DEFAULT 'Puno',
    "provincia" VARCHAR(50) NOT NULL,
    "distrito" VARCHAR(50) NOT NULL,
    "direccion" VARCHAR(150) NOT NULL,
    "zona" VARCHAR(20) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Activa',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instituciones_educativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "especialistas" (
    "id" UUID NOT NULL,
    "persona_id" UUID NOT NULL,
    "especialidad" VARCHAR(100) NOT NULL,
    "nivel_educativo" VARCHAR(50) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Activo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "especialistas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "docentes" (
    "id" UUID NOT NULL,
    "persona_id" UUID NOT NULL,
    "institucion_id" UUID NOT NULL,
    "grado_academico" VARCHAR(50),
    "nivel_educativo" VARCHAR(50) NOT NULL,
    "curso_asignado" VARCHAR(150),
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Activo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "docentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargos" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "cargos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "docente_cargos" (
    "id" UUID NOT NULL,
    "docente_id" UUID NOT NULL,
    "cargo_id" UUID NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(3),

    CONSTRAINT "docente_cargos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personas_dni_key" ON "personas"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "personas_correo_key" ON "personas"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "instituciones_educativas_codigo_modular_key" ON "instituciones_educativas"("codigo_modular");

-- CreateIndex
CREATE UNIQUE INDEX "especialistas_persona_id_key" ON "especialistas"("persona_id");

-- CreateIndex
CREATE UNIQUE INDEX "docentes_persona_id_key" ON "docentes"("persona_id");

-- CreateIndex
CREATE INDEX "docentes_institucion_id_idx" ON "docentes"("institucion_id");

-- CreateIndex
CREATE UNIQUE INDEX "cargos_nombre_key" ON "cargos"("nombre");

-- CreateIndex
CREATE INDEX "docente_cargos_docente_id_cargo_id_fecha_inicio_idx" ON "docente_cargos"("docente_id", "cargo_id", "fecha_inicio");

-- CreateIndex
CREATE INDEX "auth_sessions_session_jti_idx" ON "auth_sessions"("session_jti");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_hash_idx" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "users_persona_id_key" ON "users"("persona_id");

-- CreateIndex
CREATE INDEX "users_persona_id_idx" ON "users"("persona_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "especialistas" ADD CONSTRAINT "especialistas_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docentes" ADD CONSTRAINT "docentes_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docentes" ADD CONSTRAINT "docentes_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "instituciones_educativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docente_cargos" ADD CONSTRAINT "docente_cargos_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docente_cargos" ADD CONSTRAINT "docente_cargos_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "cargos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
