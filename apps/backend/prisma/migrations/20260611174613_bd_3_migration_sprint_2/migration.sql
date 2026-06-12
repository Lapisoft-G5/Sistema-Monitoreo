/*
  Warnings:

  - You are about to drop the column `curso_asignado` on the `docentes` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the `auth_audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `auth_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `password_reset_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[codigo]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cargo` to the `especialistas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `condicion_laboral` to the `especialistas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codigo` to the `roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `roles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "auth_audit_logs" DROP CONSTRAINT "auth_audit_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "auth_sessions" DROP CONSTRAINT "auth_sessions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "password_reset_tokens_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_persona_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- DropIndex
DROP INDEX "roles_code_key";

-- DropIndex
DROP INDEX "roles_name_key";

-- AlterTable
ALTER TABLE "docentes" DROP COLUMN "curso_asignado",
ADD COLUMN     "condicion_laboral" VARCHAR(50),
ADD COLUMN     "escala_magisterial" INTEGER;

-- AlterTable
ALTER TABLE "especialistas" ADD COLUMN     "carga_laboral" INTEGER NOT NULL DEFAULT 40,
ADD COLUMN     "cargo" VARCHAR(50) NOT NULL,
ADD COLUMN     "condicion_laboral" VARCHAR(50) NOT NULL,
ADD COLUMN     "escala_magisterial" INTEGER,
ALTER COLUMN "especialidad" DROP NOT NULL;

-- AlterTable
ALTER TABLE "personas" ADD COLUMN     "telefono" VARCHAR(20);

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "code",
DROP COLUMN "description",
DROP COLUMN "name",
ADD COLUMN     "codigo" VARCHAR(50) NOT NULL,
ADD COLUMN     "descripcion" VARCHAR(255),
ADD COLUMN     "nombre" VARCHAR(100) NOT NULL;

-- DropTable
DROP TABLE "auth_audit_logs";

-- DropTable
DROP TABLE "auth_sessions";

-- DropTable
DROP TABLE "password_reset_tokens";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "permisos" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(100) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(255),

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol_permisos" (
    "id" UUID NOT NULL,
    "rol_id" UUID NOT NULL,
    "permiso_id" UUID NOT NULL,

    CONSTRAINT "rol_permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "persona_id" UUID NOT NULL,
    "rol_id" UUID NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_first_login" BOOLEAN NOT NULL DEFAULT true,
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "last_failed_login_at" TIMESTAMP(3),
    "password_changed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones_auth" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "session_jti" VARCHAR(255) NOT NULL,
    "ip_address" VARCHAR(64),
    "user_agent" VARCHAR(500),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "logged_out_at" TIMESTAMP(3),
    "terminated_reason" VARCHAR(30),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sesiones_auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_recuperacion" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_recuperacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" UUID NOT NULL,
    "usuario_id" UUID,
    "event_type" VARCHAR(80) NOT NULL,
    "event_detail" TEXT,
    "ip_address" VARCHAR(64),
    "user_agent" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jefes_area" (
    "id" UUID NOT NULL,
    "persona_id" UUID NOT NULL,
    "carga_horaria" INTEGER NOT NULL DEFAULT 40,
    "nivel_educativo" VARCHAR(50) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Activo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jefes_area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cursos" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "nivel_educativo" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "docente_cursos" (
    "id" UUID NOT NULL,
    "docente_id" UUID NOT NULL,
    "curso_id" UUID NOT NULL,

    CONSTRAINT "docente_cursos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permisos_codigo_key" ON "permisos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "rol_permisos_rol_id_permiso_id_key" ON "rol_permisos"("rol_id", "permiso_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_persona_id_key" ON "usuarios"("persona_id");

-- CreateIndex
CREATE INDEX "usuarios_persona_id_idx" ON "usuarios"("persona_id");

-- CreateIndex
CREATE INDEX "usuarios_rol_id_idx" ON "usuarios"("rol_id");

-- CreateIndex
CREATE INDEX "usuarios_is_active_idx" ON "usuarios"("is_active");

-- CreateIndex
CREATE INDEX "usuarios_locked_until_idx" ON "usuarios"("locked_until");

-- CreateIndex
CREATE UNIQUE INDEX "sesiones_auth_session_jti_key" ON "sesiones_auth"("session_jti");

-- CreateIndex
CREATE INDEX "sesiones_auth_session_jti_idx" ON "sesiones_auth"("session_jti");

-- CreateIndex
CREATE INDEX "sesiones_auth_usuario_id_is_active_idx" ON "sesiones_auth"("usuario_id", "is_active");

-- CreateIndex
CREATE INDEX "sesiones_auth_expires_at_idx" ON "sesiones_auth"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_recuperacion_token_hash_key" ON "tokens_recuperacion"("token_hash");

-- CreateIndex
CREATE INDEX "tokens_recuperacion_token_hash_idx" ON "tokens_recuperacion"("token_hash");

-- CreateIndex
CREATE INDEX "tokens_recuperacion_usuario_id_idx" ON "tokens_recuperacion"("usuario_id");

-- CreateIndex
CREATE INDEX "tokens_recuperacion_expires_at_idx" ON "tokens_recuperacion"("expires_at");

-- CreateIndex
CREATE INDEX "logs_auditoria_usuario_id_created_at_idx" ON "logs_auditoria"("usuario_id", "created_at");

-- CreateIndex
CREATE INDEX "logs_auditoria_event_type_created_at_idx" ON "logs_auditoria"("event_type", "created_at");

-- CreateIndex
CREATE INDEX "logs_auditoria_created_at_idx" ON "logs_auditoria"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "jefes_area_persona_id_key" ON "jefes_area"("persona_id");

-- CreateIndex
CREATE UNIQUE INDEX "cursos_nombre_nivel_educativo_key" ON "cursos"("nombre", "nivel_educativo");

-- CreateIndex
CREATE UNIQUE INDEX "docente_cursos_docente_id_curso_id_key" ON "docente_cursos"("docente_id", "curso_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_codigo_key" ON "roles"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- AddForeignKey
ALTER TABLE "rol_permisos" ADD CONSTRAINT "rol_permisos_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permisos" ADD CONSTRAINT "rol_permisos_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "permisos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones_auth" ADD CONSTRAINT "sesiones_auth_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens_recuperacion" ADD CONSTRAINT "tokens_recuperacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jefes_area" ADD CONSTRAINT "jefes_area_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docente_cursos" ADD CONSTRAINT "docente_cursos_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docente_cursos" ADD CONSTRAINT "docente_cursos_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
