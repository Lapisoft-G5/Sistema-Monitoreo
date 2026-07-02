-- AlterTable
ALTER TABLE "docente_cargos" ADD COLUMN     "es_principal" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "especialista_cargos" (
    "id" UUID NOT NULL,
    "especialista_id" UUID NOT NULL,
    "cargo" VARCHAR(50) NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(3),
    "es_principal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "especialista_cargos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "especialista_cargos_especialista_id_fecha_inicio_idx" ON "especialista_cargos"("especialista_id", "fecha_inicio");

-- AddForeignKey
ALTER TABLE "especialista_cargos" ADD CONSTRAINT "especialista_cargos_especialista_id_fkey" FOREIGN KEY ("especialista_id") REFERENCES "especialistas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
