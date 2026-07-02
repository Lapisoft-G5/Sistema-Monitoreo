-- AlterTable
ALTER TABLE "cronogramas" ADD COLUMN     "alerta_vencimiento_enviada" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "especialidades" ADD COLUMN     "area_id" UUID;

-- CreateTable
CREATE TABLE "asignaciones_evaluador" (
    "id" UUID NOT NULL,
    "evaluador_id" UUID NOT NULL,
    "evaluado_id" UUID NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "asignaciones_evaluador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "docente_areas" (
    "id" UUID NOT NULL,
    "docente_id" UUID NOT NULL,
    "area_id" UUID NOT NULL,

    CONSTRAINT "docente_areas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "asignaciones_evaluador_evaluador_id_is_active_idx" ON "asignaciones_evaluador"("evaluador_id", "is_active");

-- CreateIndex
CREATE INDEX "asignaciones_evaluador_evaluado_id_is_active_idx" ON "asignaciones_evaluador"("evaluado_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "areas_nombre_key" ON "areas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "docente_areas_docente_id_area_id_key" ON "docente_areas"("docente_id", "area_id");

-- AddForeignKey
ALTER TABLE "asignaciones_evaluador" ADD CONSTRAINT "asignaciones_evaluador_evaluador_id_fkey" FOREIGN KEY ("evaluador_id") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_evaluador" ADD CONSTRAINT "asignaciones_evaluador_evaluado_id_fkey" FOREIGN KEY ("evaluado_id") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "especialidades" ADD CONSTRAINT "especialidades_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docente_areas" ADD CONSTRAINT "docente_areas_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docente_areas" ADD CONSTRAINT "docente_areas_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
