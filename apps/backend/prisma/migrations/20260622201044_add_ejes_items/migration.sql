-- CreateTable
CREATE TABLE "ejes_items_plantilla" (
    "id" UUID NOT NULL,
    "plantilla_id" UUID NOT NULL,
    "numero" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "ejes_items_plantilla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fichas_respuesta_eje_item" (
    "id" UUID NOT NULL,
    "ficha_id" UUID NOT NULL,
    "eje_item_id" UUID NOT NULL,
    "nivel" SMALLINT NOT NULL,
    "evidencia_url" TEXT,

    CONSTRAINT "fichas_respuesta_eje_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ejes_items_plantilla_plantilla_id_orden_idx" ON "ejes_items_plantilla"("plantilla_id", "orden");

-- CreateIndex
CREATE INDEX "fichas_respuesta_eje_item_eje_item_id_idx" ON "fichas_respuesta_eje_item"("eje_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "fichas_respuesta_eje_item_ficha_id_eje_item_id_key" ON "fichas_respuesta_eje_item"("ficha_id", "eje_item_id");

-- AddForeignKey
ALTER TABLE "ejes_items_plantilla" ADD CONSTRAINT "ejes_items_plantilla_plantilla_id_fkey" FOREIGN KEY ("plantilla_id") REFERENCES "plantillas_monitoreo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fichas_respuesta_eje_item" ADD CONSTRAINT "fichas_respuesta_eje_item_ficha_id_fkey" FOREIGN KEY ("ficha_id") REFERENCES "fichas_monitoreo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fichas_respuesta_eje_item" ADD CONSTRAINT "fichas_respuesta_eje_item_eje_item_id_fkey" FOREIGN KEY ("eje_item_id") REFERENCES "ejes_items_plantilla"("id") ON DELETE CASCADE ON UPDATE CASCADE;
