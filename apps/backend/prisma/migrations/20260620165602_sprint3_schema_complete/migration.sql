-- AlterTable
ALTER TABLE "planes_monitoreo" ADD COLUMN     "autor_id" UUID,
ADD COLUMN     "institucion_id" UUID,
ADD COLUMN     "rol_autor_al_crear" VARCHAR(50);

-- CreateTable
CREATE TABLE "plan_cobertura_ie" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "institucion_id" UUID NOT NULL,

    CONSTRAINT "plan_cobertura_ie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantillas_monitoreo" (
    "id" UUID NOT NULL,
    "tipo_monitoreo" VARCHAR(20) NOT NULL,
    "anio_academico" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "baremo" VARCHAR(20) NOT NULL,
    "descripcion" TEXT,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Borrador',
    "autor_id" UUID NOT NULL,
    "rol_autor_al_crear" VARCHAR(50) NOT NULL,
    "institucion_id" UUID,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plantillas_monitoreo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "niveles_calificacion" (
    "id" UUID NOT NULL,
    "plantilla_id" UUID NOT NULL,
    "nivel_romano" VARCHAR(4) NOT NULL,
    "denominacion" VARCHAR(100) NOT NULL,
    "rango_min" INTEGER NOT NULL,
    "color" CHAR(7) NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "niveles_calificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "desempenos_plantilla" (
    "id" UUID NOT NULL,
    "plantilla_id" UUID NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "descripcion_corta" TEXT,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "desempenos_plantilla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aspectos_evaluados" (
    "id" UUID NOT NULL,
    "desempeno_id" UUID NOT NULL,
    "descripcion" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "aspectos_evaluados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubrica_niveles" (
    "id" UUID NOT NULL,
    "desempeno_id" UUID NOT NULL,
    "nivel_calificacion_id" UUID NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "rubrica_niveles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cronogramas" (
    "id" UUID NOT NULL,
    "monitor_id" UUID NOT NULL,
    "institucion_id" UUID NOT NULL,
    "evaluado_id" UUID NOT NULL,
    "plan_id" UUID,
    "tipo_monitoreo" VARCHAR(20) NOT NULL,
    "numero_visita" SMALLINT NOT NULL,
    "fecha_programada" DATE NOT NULL,
    "hora_inicio" VARCHAR(8) NOT NULL,
    "detalles" TEXT,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'PROGRAMADO',
    "modalidad" VARCHAR(20) NOT NULL,
    "nivel_educativo" VARCHAR(100) NOT NULL,
    "creado_por_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cronogramas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_reprogramacion" (
    "id" UUID NOT NULL,
    "cronograma_id" UUID NOT NULL,
    "solicitante_id" UUID NOT NULL,
    "solicitante_rol_al_crear" VARCHAR(50) NOT NULL,
    "fecha_original" DATE NOT NULL,
    "hora_original" VARCHAR(8) NOT NULL,
    "fecha_propuesta" DATE NOT NULL,
    "hora_propuesta" VARCHAR(8) NOT NULL,
    "justificacion" TEXT NOT NULL,
    "archivo_sustento_url" VARCHAR(500) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    "resuelto_por_id" UUID,
    "comentario_resolucion" TEXT,
    "fecha_resolucion" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudes_reprogramacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fichas_monitoreo" (
    "id" UUID NOT NULL,
    "cronograma_id" UUID NOT NULL,
    "plantilla_id" UUID NOT NULL,
    "ficha_contexto_id" UUID NOT NULL,
    "anio_academico" INTEGER NOT NULL,
    "puntaje_total" SMALLINT NOT NULL,
    "promedio" DECIMAL(4,2) NOT NULL,
    "nivel_logro" VARCHAR(20) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'BORRADOR',
    "creado_por_id" UUID,
    "finalizada_por_id" UUID,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizada_at" TIMESTAMP(3),

    CONSTRAINT "fichas_monitoreo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ficha_contexto" (
    "id" UUID NOT NULL,
    "area_curricular" VARCHAR(100),
    "grado" VARCHAR(50),
    "seccion" VARCHAR(10),
    "cantidad_estudiantes" INTEGER,
    "cantidad_estudiantes_nee" INTEGER,
    "curso_id" UUID,

    CONSTRAINT "ficha_contexto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ficha_respuestas_desempeno" (
    "id" UUID NOT NULL,
    "ficha_id" UUID NOT NULL,
    "desempeno_id" UUID NOT NULL,
    "nivel" SMALLINT NOT NULL,

    CONSTRAINT "ficha_respuestas_desempeno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ficha_respuestas_aspecto" (
    "id" UUID NOT NULL,
    "ficha_id" UUID NOT NULL,
    "aspecto_id" UUID NOT NULL,
    "marcado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ficha_respuestas_aspecto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plan_cobertura_ie_institucion_id_idx" ON "plan_cobertura_ie"("institucion_id");

-- CreateIndex
CREATE UNIQUE INDEX "plan_cobertura_ie_plan_id_institucion_id_key" ON "plan_cobertura_ie"("plan_id", "institucion_id");

-- CreateIndex
CREATE INDEX "plantillas_monitoreo_estado_idx" ON "plantillas_monitoreo"("estado");

-- CreateIndex
CREATE INDEX "plantillas_monitoreo_autor_id_idx" ON "plantillas_monitoreo"("autor_id");

-- CreateIndex
CREATE UNIQUE INDEX "plantillas_monitoreo_tipo_monitoreo_anio_academico_version_key" ON "plantillas_monitoreo"("tipo_monitoreo", "anio_academico", "version");

-- CreateIndex
CREATE INDEX "niveles_calificacion_plantilla_id_orden_idx" ON "niveles_calificacion"("plantilla_id", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "niveles_calificacion_plantilla_id_nivel_romano_key" ON "niveles_calificacion"("plantilla_id", "nivel_romano");

-- CreateIndex
CREATE INDEX "desempenos_plantilla_plantilla_id_orden_idx" ON "desempenos_plantilla"("plantilla_id", "orden");

-- CreateIndex
CREATE INDEX "aspectos_evaluados_desempeno_id_orden_idx" ON "aspectos_evaluados"("desempeno_id", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "rubrica_niveles_desempeno_id_nivel_calificacion_id_key" ON "rubrica_niveles"("desempeno_id", "nivel_calificacion_id");

-- CreateIndex
CREATE INDEX "cronogramas_institucion_id_fecha_programada_idx" ON "cronogramas"("institucion_id", "fecha_programada");

-- CreateIndex
CREATE INDEX "cronogramas_monitor_id_fecha_programada_idx" ON "cronogramas"("monitor_id", "fecha_programada");

-- CreateIndex
CREATE INDEX "cronogramas_estado_idx" ON "cronogramas"("estado");

-- CreateIndex
CREATE INDEX "cronogramas_evaluado_id_tipo_monitoreo_idx" ON "cronogramas"("evaluado_id", "tipo_monitoreo");

-- CreateIndex
CREATE INDEX "solicitudes_reprogramacion_cronograma_id_idx" ON "solicitudes_reprogramacion"("cronograma_id");

-- CreateIndex
CREATE INDEX "solicitudes_reprogramacion_estado_idx" ON "solicitudes_reprogramacion"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "fichas_monitoreo_cronograma_id_key" ON "fichas_monitoreo"("cronograma_id");

-- CreateIndex
CREATE UNIQUE INDEX "fichas_monitoreo_ficha_contexto_id_key" ON "fichas_monitoreo"("ficha_contexto_id");

-- CreateIndex
CREATE INDEX "fichas_monitoreo_plantilla_id_idx" ON "fichas_monitoreo"("plantilla_id");

-- CreateIndex
CREATE INDEX "fichas_monitoreo_estado_idx" ON "fichas_monitoreo"("estado");

-- CreateIndex
CREATE INDEX "idx_fichas_reporte" ON "fichas_monitoreo"("anio_academico", "estado", "nivel_logro");

-- CreateIndex
CREATE INDEX "ficha_respuestas_desempeno_desempeno_id_idx" ON "ficha_respuestas_desempeno"("desempeno_id");

-- CreateIndex
CREATE UNIQUE INDEX "ficha_respuestas_desempeno_ficha_id_desempeno_id_key" ON "ficha_respuestas_desempeno"("ficha_id", "desempeno_id");

-- CreateIndex
CREATE INDEX "ficha_respuestas_aspecto_aspecto_id_idx" ON "ficha_respuestas_aspecto"("aspecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "ficha_respuestas_aspecto_ficha_id_aspecto_id_key" ON "ficha_respuestas_aspecto"("ficha_id", "aspecto_id");

-- CreateIndex
CREATE INDEX "planes_monitoreo_autor_id_idx" ON "planes_monitoreo"("autor_id");

-- CreateIndex
CREATE INDEX "planes_monitoreo_institucion_id_idx" ON "planes_monitoreo"("institucion_id");

-- AddForeignKey
ALTER TABLE "planes_monitoreo" ADD CONSTRAINT "planes_monitoreo_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planes_monitoreo" ADD CONSTRAINT "planes_monitoreo_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "instituciones_educativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_cobertura_ie" ADD CONSTRAINT "plan_cobertura_ie_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "planes_monitoreo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_cobertura_ie" ADD CONSTRAINT "plan_cobertura_ie_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "instituciones_educativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantillas_monitoreo" ADD CONSTRAINT "plantillas_monitoreo_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantillas_monitoreo" ADD CONSTRAINT "plantillas_monitoreo_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "instituciones_educativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "niveles_calificacion" ADD CONSTRAINT "niveles_calificacion_plantilla_id_fkey" FOREIGN KEY ("plantilla_id") REFERENCES "plantillas_monitoreo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desempenos_plantilla" ADD CONSTRAINT "desempenos_plantilla_plantilla_id_fkey" FOREIGN KEY ("plantilla_id") REFERENCES "plantillas_monitoreo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aspectos_evaluados" ADD CONSTRAINT "aspectos_evaluados_desempeno_id_fkey" FOREIGN KEY ("desempeno_id") REFERENCES "desempenos_plantilla"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubrica_niveles" ADD CONSTRAINT "rubrica_niveles_desempeno_id_fkey" FOREIGN KEY ("desempeno_id") REFERENCES "desempenos_plantilla"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubrica_niveles" ADD CONSTRAINT "rubrica_niveles_nivel_calificacion_id_fkey" FOREIGN KEY ("nivel_calificacion_id") REFERENCES "niveles_calificacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cronogramas" ADD CONSTRAINT "cronogramas_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "especialistas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cronogramas" ADD CONSTRAINT "cronogramas_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "instituciones_educativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cronogramas" ADD CONSTRAINT "cronogramas_evaluado_id_fkey" FOREIGN KEY ("evaluado_id") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cronogramas" ADD CONSTRAINT "cronogramas_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "planes_monitoreo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cronogramas" ADD CONSTRAINT "cronogramas_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_reprogramacion" ADD CONSTRAINT "solicitudes_reprogramacion_cronograma_id_fkey" FOREIGN KEY ("cronograma_id") REFERENCES "cronogramas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_reprogramacion" ADD CONSTRAINT "solicitudes_reprogramacion_solicitante_id_fkey" FOREIGN KEY ("solicitante_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_reprogramacion" ADD CONSTRAINT "solicitudes_reprogramacion_resuelto_por_id_fkey" FOREIGN KEY ("resuelto_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fichas_monitoreo" ADD CONSTRAINT "fichas_monitoreo_cronograma_id_fkey" FOREIGN KEY ("cronograma_id") REFERENCES "cronogramas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fichas_monitoreo" ADD CONSTRAINT "fichas_monitoreo_plantilla_id_fkey" FOREIGN KEY ("plantilla_id") REFERENCES "plantillas_monitoreo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fichas_monitoreo" ADD CONSTRAINT "fichas_monitoreo_ficha_contexto_id_fkey" FOREIGN KEY ("ficha_contexto_id") REFERENCES "ficha_contexto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fichas_monitoreo" ADD CONSTRAINT "fichas_monitoreo_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fichas_monitoreo" ADD CONSTRAINT "fichas_monitoreo_finalizada_por_id_fkey" FOREIGN KEY ("finalizada_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ficha_contexto" ADD CONSTRAINT "ficha_contexto_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ficha_respuestas_desempeno" ADD CONSTRAINT "ficha_respuestas_desempeno_ficha_id_fkey" FOREIGN KEY ("ficha_id") REFERENCES "fichas_monitoreo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ficha_respuestas_desempeno" ADD CONSTRAINT "ficha_respuestas_desempeno_desempeno_id_fkey" FOREIGN KEY ("desempeno_id") REFERENCES "desempenos_plantilla"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ficha_respuestas_aspecto" ADD CONSTRAINT "ficha_respuestas_aspecto_ficha_id_fkey" FOREIGN KEY ("ficha_id") REFERENCES "fichas_monitoreo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ficha_respuestas_aspecto" ADD CONSTRAINT "ficha_respuestas_aspecto_aspecto_id_fkey" FOREIGN KEY ("aspecto_id") REFERENCES "aspectos_evaluados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Sprint 3 - CHECK constraints criticos (reglas de negocio en DB)
-- Aplicacion refuerza CHECKs en servicio, DB los garantiza.
ALTER TABLE "cronogramas" ADD CONSTRAINT "cronogramas_tipo_monitoreo_check"
  CHECK ("tipo_monitoreo" IN ('DOCENTE', 'DIRECTIVO'));

ALTER TABLE "cronogramas" ADD CONSTRAINT "cronogramas_numero_visita_check"
  CHECK ("numero_visita" BETWEEN 1 AND 4);

ALTER TABLE "cronogramas" ADD CONSTRAINT "cronogramas_estado_check"
  CHECK ("estado" IN ('PROGRAMADO', 'EN_PROCESO', 'COMPLETADO', 'REPROGRAMADO', 'CANCELADO'));

ALTER TABLE "solicitudes_reprogramacion" ADD CONSTRAINT "solicitudes_reprogramacion_estado_check"
  CHECK ("estado" IN ('PENDIENTE', 'APROBADO', 'RECHAZADO'));

ALTER TABLE "plantillas_monitoreo" ADD CONSTRAINT "plantillas_monitoreo_estado_check"
  CHECK ("estado" IN ('Borrador', 'Vigente', 'Historico'));

ALTER TABLE "plantillas_monitoreo" ADD CONSTRAINT "plantillas_monitoreo_tipo_monitoreo_check"
  CHECK ("tipo_monitoreo" IN ('DOCENTE', 'DIRECTIVO'));

ALTER TABLE "plantillas_monitoreo" ADD CONSTRAINT "plantillas_monitoreo_baremo_check"
  CHECK ("baremo" IN ('Vigente', 'Porcentual'));

ALTER TABLE "plantillas_monitoreo" ADD CONSTRAINT "plantillas_monitoreo_rol_autor_check"
  CHECK ("rol_autor_al_crear" IN ('jefe_gestion', 'director_ie'));

ALTER TABLE "fichas_monitoreo" ADD CONSTRAINT "fichas_monitoreo_estado_check"
  CHECK ("estado" IN ('BORRADOR', 'FINALIZADO', 'MIGRADA'));

ALTER TABLE "fichas_monitoreo" ADD CONSTRAINT "fichas_monitoreo_nivel_logro_check"
  CHECK ("nivel_logro" IN ('INICIO', 'EN_PROCESO', 'LOGRO_ESPERADO', 'LOGRO_DESTACADO'));

ALTER TABLE "fichas_monitoreo" ADD CONSTRAINT "fichas_monitoreo_promedio_check"
  CHECK ("promedio" >= 1.0 AND "promedio" <= 4.0);

ALTER TABLE "ficha_respuestas_desempeno" ADD CONSTRAINT "ficha_respuestas_desempeno_nivel_check"
  CHECK ("nivel" BETWEEN 1 AND 4);
