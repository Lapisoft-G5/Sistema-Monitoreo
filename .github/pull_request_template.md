## Resumen

### ¿Qué cambia?
<!-- Explica de forma breve y concreta qué se implementó, corrigió o refactorizó. -->

### ¿Por qué se hace este cambio?
<!-- Explica el problema o necesidad que resuelve. -->

### Áreas impactadas
- [ ] Frontend
- [ ] Backend
- [ ] Shared packages
- [ ] Infraestructura
- [ ] Documentación
- [ ] Base de datos / Prisma

## Tipo de cambio

- [ ] feat
- [ ] fix
- [ ] refactor
- [ ] docs
- [ ] test
- [ ] chore
- [ ] ci
- [ ] perf

## Checklist técnico

- [ ] La rama fue creada desde `develop`.
- [ ] El código sigue la arquitectura definida del monorepo.
- [ ] Se respetó FSD en frontend donde aplica.
- [ ] Se respetó modularidad en NestJS / BFF donde aplica.
- [ ] Se usaron DTOs, tipos o contratos compartidos donde correspondía.
- [ ] No se introdujeron secretos, credenciales ni archivos `.env` reales.
- [ ] No se agregaron dependencias innecesarias.
- [ ] Se manejaron errores correctamente (`HttpException`, guards, validaciones, etc.) si aplica.
- [ ] Se actualizó documentación si era necesario.

## Validación realizada

### Comandos ejecutados
- [ ] `pnpm install`
- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm build`

### Pruebas realizadas
- [ ] Prueba manual
- [ ] Prueba unitaria
- [ ] Prueba de integración
- [ ] No aplica

### Resultado
<!-- Describe brevemente cómo validaste el cambio y qué resultado obtuviste. -->

## Base de datos

- [ ] No aplica
- [ ] Se modificó schema Prisma
- [ ] Se agregó migración
- [ ] Requiere ejecutar migraciones localmente
- [ ] Puede impactar datos existentes

### Detalle de cambios de base de datos
<!-- Si aplica, explica tablas, relaciones, constraints o datos afectados. -->

## Riesgos e impacto

- [ ] No hay riesgos conocidos
- [ ] Hay impacto controlado
- [ ] Requiere revisión cuidadosa

### Riesgos detectados
<!-- Explica cualquier riesgo técnico, deuda, limitación temporal o posible efecto colateral. -->

## Evidencia

<!-- Adjunta capturas, logs, payloads, respuesta de endpoints o pasos de prueba. -->

## Relación con gestión del proyecto

- ID de Solicitud de Cambio (SC): 
- Ticket / Issue:
- Módulo:
- Rama:

## Notas para el revisor

<!-- Indica qué partes revisar con mayor atención. -->