-- CreateTable
CREATE TABLE "planes_monitoreo" (
    "id" UUID NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "anio_academico" INTEGER NOT NULL,
    "tipo_entidad" VARCHAR(10) NOT NULL,
    "archivo_url" VARCHAR(255) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Activo',
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planes_monitoreo_pkey" PRIMARY KEY ("id")
);
