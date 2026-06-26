-- ============================================================================
-- Sprint 3: RLS policies + vista materializada (sin particionamiento)
-- ============================================================================
-- Esta migration quedo OBSOLETA tras la Fase 3. Sus policies fueron
-- reescritas en 20260621200000_fase3_rls_fix_roles y la JOIN se corrigio
-- en 20260621201000_fase3_rls_reapply_join. La vista materializada
-- `mv_consolidado_mensual` no se usa en codigo TS/JS (verificado). La tabla
-- `areas_curriculares` tampoco existe en el modelo. Se mantiene este archivo
-- para no romper la cadena de migrations pero se neutraliza su contenido.
-- ============================================================================

-- No-op intencional.
SELECT 1;
