# ADR-001: Estrategia de Ramas y Flujo Git

**Fecha:** 2026-05-30  
**Estado:** Aceptado  
**Autores:** Tech Lead (DES-08), Gestor de Configuración (DES-06)

---

## Contexto

El proyecto Sistema de Monitoreo utiliza un monorepo con PNPM Workspaces.
El equipo está compuesto por 8 personas distribuidas en roles de backend,
frontend, QA e infraestructura. Se requiere una estrategia de ramas que:

- Permita desarrollo paralelo sin bloquear a nadie.
- Proteja `main` y `develop` de cambios no revisados.
- Mantenga un historial de commits legible y automatizable.
- Sea compatible con el plan de sprints de 2 semanas.

## Decisión

Se adopta una variante simplificada de **Git Flow** con las siguientes ramas permanentes:

- `main`: producción, protegida.
- `develop`: integración continua, protegida.

Y ramas temporales por trabajo:

- `feature/<nombre>`: una feature del sprint.
- `fix/<nombre>`: corrección de error.
- `release/<versión>`: preparación de release al cierre de sprint.

Se adopta **Conventional Commits** como estándar de mensajes.

## Consecuencias

- Todo cambio a `develop` y `main` pasa por MR con revisión obligatoria.
- El historial queda estructurado y compatible con changelogs automáticos futuros.
- Costo adicional: abrir MR para cada cambio, incluso pequeño.
- Beneficio: trazabilidad completa por sprint y por SC del PGC.

## Alternativas descartadas

- **Trunk-based development**: descartado por nivel de experiencia mixto del equipo y necesidad de auditoría formal.
- **GitHub Flow** (solo main + feature): descartado porque no separa integración de producción.
