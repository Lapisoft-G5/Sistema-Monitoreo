-- Reemplaza el índice único parcial que impedía que una plantilla IE
-- coexistiera Vigente con la plantilla UGEL del mismo tipo+anio.
-- El nuevo esquema usa dos índices parciales separados por scope, igual
-- que los planes_monitoreo (uq_plan_ugel_activo / uq_plan_ie_activo):
--   - uq_plantilla_ugel_vigente: única plantilla UGEL Vigente por
--     (tipo_monitoreo, anio_academico).
--   - uq_plantilla_ie_vigente: única plantilla IE Vigente por
--     (institucion_id, tipo_monitoreo, anio_academico).
-- Así el Director IE puede promover su copia a Vigente sin chocar con
-- la UGEL original del mismo tipo+anio, porque son scopes distintos.

DROP INDEX IF EXISTS "uq_plantilla_vigente_tipo_anio";

CREATE UNIQUE INDEX IF NOT EXISTS "uq_plantilla_ugel_vigente"
    ON "plantillas_monitoreo" ("tipo_monitoreo", "anio_academico")
    WHERE "rol_autor_al_crear" = 'jefe_gestion'
      AND "estado" = 'Vigente'
      AND "deleted" = false;

CREATE UNIQUE INDEX IF NOT EXISTS "uq_plantilla_ie_vigente"
    ON "plantillas_monitoreo" ("institucion_id", "tipo_monitoreo", "anio_academico")
    WHERE "rol_autor_al_crear" = 'director_ie'
      AND "estado" = 'Vigente'
      AND "deleted" = false;