-- Normalizar modalidad de instituciones educativas a los valores canónicos del dominio:
-- 'EBR', 'EBA', 'EBE', 'CEPTRO'.
--
-- Datos crudos de ESCALE o cargas previas contenían 'Escolarizado' o 'No escolarizado'
-- (que corresponden a EBR) o valores sin normalizar que provocan que los filtros del mapa
-- y dashboard excluyan las instituciones geolocalizadas.

UPDATE "instituciones_educativas"
SET "modalidad" = 'EBA'
WHERE "modalidad" ILIKE '%alternativa%'
   OR "nivel_educativo" ILIKE '%alternativa%';

UPDATE "instituciones_educativas"
SET "modalidad" = 'EBE'
WHERE "modalidad" ILIKE '%especial%'
   OR "modalidad" ILIKE '%cebe%'
   OR "modalidad" ILIKE '%prite%'
   OR "nivel_educativo" ILIKE '%especial%'
   OR "nivel_educativo" ILIKE '%cebe%'
   OR "nivel_educativo" ILIKE '%prite%';

UPDATE "instituciones_educativas"
SET "modalidad" = 'CEPTRO'
WHERE "modalidad" ILIKE '%cetpro%'
   OR "modalidad" ILIKE '%productiva%'
   OR "nivel_educativo" ILIKE '%cetpro%'
   OR "nivel_educativo" ILIKE '%productiva%';

UPDATE "instituciones_educativas"
SET "modalidad" = 'EBR'
WHERE "modalidad" ILIKE '%escolarizado%'
   OR "modalidad" IS NULL
   OR "modalidad" = ''
   OR "modalidad" NOT IN ('EBR', 'EBA', 'EBE', 'CEPTRO');
