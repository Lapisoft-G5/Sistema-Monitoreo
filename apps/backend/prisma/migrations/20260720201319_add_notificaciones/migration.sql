-- CreateTable
CREATE TABLE "notificaciones" (
    "id" UUID NOT NULL,
    "destinatario_id" UUID NOT NULL,
    "emisor_id" UUID,
    "tipo" VARCHAR(40) NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "institucion_id" UUID,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "leida_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notificaciones_destinatario_id_leida_idx" ON "notificaciones"("destinatario_id", "leida");

-- CreateIndex
CREATE INDEX "notificaciones_created_at_idx" ON "notificaciones"("created_at");

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_destinatario_id_fkey" FOREIGN KEY ("destinatario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_emisor_id_fkey" FOREIGN KEY ("emisor_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "instituciones_educativas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
