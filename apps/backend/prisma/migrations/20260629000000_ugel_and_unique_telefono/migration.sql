-- AlterTable
ALTER TABLE "planes_monitoreo" ADD COLUMN "ugel_id" UUID;

-- AlterTable
ALTER TABLE "plantillas_monitoreo" ADD COLUMN "ugel_id" UUID;

-- CreateTable
CREATE TABLE "ugeles" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "region" VARCHAR(100) NOT NULL,
    "provincia" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ugeles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ugeles_codigo_key" ON "ugeles"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "personas_telefono_key" ON "personas"("telefono");

-- CreateIndex
CREATE INDEX "planes_monitoreo_ugel_id_idx" ON "planes_monitoreo"("ugel_id");

-- CreateIndex
CREATE INDEX "plantillas_monitoreo_ugel_id_idx" ON "plantillas_monitoreo"("ugel_id");

-- AddForeignKey
ALTER TABLE "planes_monitoreo" ADD CONSTRAINT "planes_monitoreo_ugel_id_fkey" FOREIGN KEY ("ugel_id") REFERENCES "ugeles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantillas_monitoreo" ADD CONSTRAINT "plantillas_monitoreo_ugel_id_fkey" FOREIGN KEY ("ugel_id") REFERENCES "ugeles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
