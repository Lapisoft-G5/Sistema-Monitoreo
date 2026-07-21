-- AlterTable
ALTER TABLE "instituciones_educativas" ADD COLUMN     "alerta_sin_visita_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "solicitudes_visita" (
    "id" UUID NOT NULL,
    "institucion_id" UUID NOT NULL,
    "solicitante_id" UUID NOT NULL,
    "motivo" TEXT,
    "prioridad" VARCHAR(20) NOT NULL DEFAULT 'ALTA',
    "estado" VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    "atendida_por_id" UUID,
    "cronograma_id" UUID,
    "comentario" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resuelta_at" TIMESTAMP(3),

    CONSTRAINT "solicitudes_visita_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "solicitudes_visita_estado_idx" ON "solicitudes_visita"("estado");

-- CreateIndex
CREATE INDEX "solicitudes_visita_institucion_id_idx" ON "solicitudes_visita"("institucion_id");

-- AddForeignKey
ALTER TABLE "solicitudes_visita" ADD CONSTRAINT "solicitudes_visita_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "instituciones_educativas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_visita" ADD CONSTRAINT "solicitudes_visita_solicitante_id_fkey" FOREIGN KEY ("solicitante_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_visita" ADD CONSTRAINT "solicitudes_visita_atendida_por_id_fkey" FOREIGN KEY ("atendida_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
