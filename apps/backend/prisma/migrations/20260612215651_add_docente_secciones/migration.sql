-- CreateTable
CREATE TABLE "docente_secciones" (
    "id" UUID NOT NULL,
    "docente_id" UUID NOT NULL,
    "grado" VARCHAR(50) NOT NULL,
    "seccion" VARCHAR(10) NOT NULL,

    CONSTRAINT "docente_secciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "docente_secciones_docente_id_grado_seccion_key" ON "docente_secciones"("docente_id", "grado", "seccion");

-- AddForeignKey
ALTER TABLE "docente_secciones" ADD CONSTRAINT "docente_secciones_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
