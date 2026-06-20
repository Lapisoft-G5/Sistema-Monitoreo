# Plan de Pruebas Manuales - Sistema de Monitoreo

> Ejecuta estos pasos en orden. Al final de cada seccion hay un checkbox
> para que sepas que completaste la prueba.

## 0. Pre-requisitos

```bash
# Docker con monitoring-postgres corriendo
rtk docker ps | findstr monitoring-postgres
# debe listar: monitoring-postgres Up X hours
```

Si no esta, levantarlo:
```bash
cd D:\Lapisoft\Sistema-Monitoreo
docker compose up -d
```

## 1. Resetear la base de datos (solo la primera vez)

> Si ya tienes datos del demo anterior y quieres empezar limpio, ejecuta esto.
> Si acabas de clonar el repo, salta al paso 2.

```bash
# 1.1. Borrar schema completo
rtk docker exec monitoring-postgres psql -U admin -d monitoring -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 1.2. Aplicar todas las migraciones
pnpm --filter backend exec prisma migrate deploy

# 1.3. Cargar datos de prueba (12 usuarios, 8 instituciones, 2 plantillas, 1 cronograma)
pnpm --filter backend exec node --import tsx ../../database/seeders/index.js
```

**Verificar**: la consola debe terminar con "Seeding completado" y listar 12 usuarios.

## 2. Verificar el estado de la BD (sin tocar nada)

```bash
rtk docker exec monitoring-postgres psql -U admin -d monitoring -c "SELECT 'usuarios' AS tabla, count(*) FROM usuarios UNION ALL SELECT 'cronogramas', count(*) FROM cronogramas UNION ALL SELECT 'planes_monitoreo', count(*) FROM planes_monitoreo UNION ALL SELECT 'plantillas_monitoreo', count(*) FROM plantillas_monitoreo UNION ALL SELECT 'instituciones', count(*) FROM instituciones_educativas"
```

**Esperado**:
```
usuarios                   | 12
cronogramas                | 1
planes_monitoreo           | 2
plantillas_monitoreo       | 2
instituciones              | 8
```

## 3. Compilar el backend (la primera vez)

> El script `pnpm dev:backend` usa Nest CLI que compila y arranca automaticamente.
> Si la primera vez falla con "Cannot find module dist/main.js", ejecuta este paso manual:

```bash
Remove-Item apps\backend\tsconfig.build.tsbuildinfo, apps\backend\tsconfig.tsbuildinfo -ErrorAction SilentlyContinue
pnpm --filter backend exec tsc -p tsconfig.build.json
Test-Path apps\backend\dist\main.js   # debe ser True
```

## 4. Arrancar el sistema

Necesitas **DOS terminales abiertas**:

**Terminal 1 (Backend)**:
```bash
pnpm dev:backend
```

Espera ver en consola:
```
[Nest] LOG [NestApplication] Backend running on http://127.0.0.1:3000/api
```

**Terminal 2 (Frontend)**:
```bash
pnpm dev:frontend
```

Espera ver:
```
  VITE vX.X.X  ready in XXX ms
  Local:   http://localhost:5173/
```

## 5. Probar Login (1 minuto)

Abre `http://localhost:5173` en el navegador.

**Credenciales del seeder** (DNI = contraseña):
- `40000001` → admin (Carlos Mendoza)
- `40000002` → jefe_gestion (Maria Elena Huaman)
- `40000004` → especialista (Ana Lucia Ticona)
- `40000006` → director_institucion (Rosa Maria Apaza)

**Pasos**:
1. Click en el campo DNI, escribe `40000002`
2. Click en el campo contraseña, escribe `40000002`
3. Click en "Ingresar"
4. Verificar que entras al dashboard

**Que validar**: la URL cambia, ves un sidebar con menu lateral.

- [ ] Login funciona

## 6. Probar creacion de Plan de Monitoreo (5 minutos)

**Como**: jefe_gestion (`40000002`)

**Pasos**:
1. En el sidebar, ir a "Planes de Monitoreo"
2. Click en "Nuevo Plan"
3. Llenar el formulario:
   - **Titulo**: `Plan de Monitoreo Q1 2026 - Prueba Manual`
   - **Anio academico**: `2026`
   - **Tipo**: `UGEL`
   - **Descripcion**: `Plan piloto para validar integracion frontend-backend`
4. Click en "Guardar"
5. Verificar que el plan aparece en la lista

**Verificar en BD**:
```bash
rtk docker exec monitoring-postgres psql -U admin -d monitoring -c "SELECT titulo, tipo_entidad, estado FROM planes_monitoreo ORDER BY created_at DESC LIMIT 3"
```

**Esperado**: tu plan aparece con `estado = 'Activo'`.

**Verificar en navegador (F12 → Network)**:
- Debe haber un `POST /api/planes-monitoreo` con status `201`
- Si NO hay request POST, abre la consola de JS y busca `[plantilla]` o `[API]`

- [ ] Plan creado y visible en lista
- [ ] Registro existe en BD
- [ ] POST aparece en Network

## 7. Probar creacion de Plantilla (5 minutos)

**Como**: jefe_gestion (`40000002`)

**Pasos**:
1. Ir a "Plantillas" en el sidebar
2. Click en "Nueva Plantilla"
3. Llenar:
   - **Tipo de monitoreo**: `Monitoreo Docente`
   - **Anio academico**: `2026`
   - **Estado**: `Vigente`
4. En la seccion de desempenos, agregar UN desempeno:
   - **Titulo**: `Dominio del contenido pedagogico`
   - **Descripcion**: `Evalua el conocimiento del docente sobre su area`
5. Agregar 2-3 aspectos al desempeno:
   - `Demuestra conocimiento actualizado`
   - `Relaciona teoria con practica`
6. Click en "Guardar"
7. Verificar que aparece en la lista

**Verificar en BD**:
```bash
rtk docker exec monitoring-postgres psql -U admin -d monitoring -c "SELECT descripcion, estado FROM plantillas_monitoreo ORDER BY created_at DESC LIMIT 3"
```

**Verificar desempenos**:
```bash
rtk docker exec monitoring-postgres psql -U admin -d monitoring -c "SELECT dp.nombre, count(a.id) AS num_aspectos FROM desempenos_plantilla dp LEFT JOIN aspectos_evaluados a ON a.desempeno_id=dp.id WHERE dp.plantilla_id=(SELECT id FROM plantillas_monitoreo ORDER BY created_at DESC LIMIT 1) GROUP BY dp.nombre"
```

**Esperado**: tu desempeno aparece con 2-3 aspectos.

- [ ] Plantilla creada y visible
- [ ] Desempenos en BD con sus aspectos
- [ ] POST en Network

## 8. Probar crear un Cronograma (5 minutos)

**Como**: jefe_gestion (`40000002`)

**Pasos**:
1. Ir a "Calendario" o "Cronograma"
2. Click en "Nueva visita" o en una fecha del calendario
3. Llenar el formulario:
   - **Especialista**: Ana Lucia Ticona Coila (DNI 40000004)
   - **Institucion**: I.E. N. 70001 Nuestra Senora de la Asuncion
   - **Docente/Directivo**: Luz Marina Pari Huayta (DNI 40000008)
   - **Tipo**: Monitoreo Docente
   - **Fecha**: 2026-04-15
   - **Hora**: 09:00
4. Click en "Guardar"
5. Verificar que aparece en el calendario

**Verificar en BD**:
```bash
rtk docker exec monitoring-postgres psql -U admin -d monitoring -c "SELECT c.estado, c.fecha_programada, c.hora_inicio, i.nombre FROM cronogramas c JOIN instituciones_educativas i ON i.id=c.institucion_id WHERE c.fecha_programada='2026-04-15'"
```

**Esperado**: tu cronograma aparece con `estado = 'PROGRAMADO'`.

- [ ] Cronograma visible en calendario
- [ ] Registro en BD
- [ ] POST en Network

## 9. Probar el candado de 3 visitas (2 minutos)

**Como**: jefe_gestion (`40000002`)

**Pasos**:
1. Crear 3 cronogramas para el mismo especialista Ana Lucia Ticona (cualquier fecha/hora distinta)
2. Intentar crear un **cuarto** cronograma para Ana Lucia
3. **Esperado**: debe mostrar un error "Ya tiene 3 visitas pendientes"

**Verificar en Network**:
- El POST devuelve `409 Conflict` con mensaje de candado

**Si pasa**: el backend esta bloqueando correctamente.

- [ ] 4ta visita rechazada con error claro

## 10. Probar Llenar Ficha de Monitoreo (10 minutos)

**Como**: especialista (`40000004` Ana Lucia Ticona)

**Pasos**:
1. Logout, login con `40000004` / `40000004`
2. Ir a "Calendario"
3. Click en una visita existente (la del 2026-03-15 que viene del seed)
4. Click en "Llenar Ficha"
5. Marcar algunos aspectos (checkboxes)
6. Asignar niveles a los desempenos (I, II, III o IV)
7. Agregar comentarios generales
8. Click en "Guardar borrador"
9. Cerrar el modal
10. Click otra vez en la misma visita
11. Verificar que los datos persisten

**Verificar en BD**:
```bash
rtk docker exec monitoring-postgres psql -U admin -d monitoring -c "SELECT f.estado, count(rd.id) AS respuestas_desempeno, count(ra.id) AS respuestas_aspecto FROM fichas_monitoreo f LEFT JOIN ficha_respuestas_desempeno rd ON rd.ficha_monitoreo_id=f.id LEFT JOIN ficha_respuestas_aspecto ra ON ra.ficha_monitoreo_id=f.id GROUP BY f.estado LIMIT 5"
```

**Esperado**: 1 ficha con `estado = BORRADOR` con tus respuestas.

- [ ] Ficha creada en BD
- [ ] Respuestas guardadas
- [ ] Datos persisten al reabrir

## 11. Probar Finalizar Ficha (3 minutos)

**Como**: especialista (`40000004`)

**Pasos**:
1. Sobre la misma ficha del paso 10
2. Reabrir
3. Verificar que todos los desempenos obligatorios tienen nivel
4. Click en "Finalizar"
5. Verificar que la visita cambia a estado "COMPLETADO"

**Verificar en BD**:
```bash
rtk docker exec monitoring-postgres psql -U admin -d monitoring -c "SELECT id, estado, puntaje_total, promedio, nivel_logro FROM fichas_monitoreo"
```

**Esperado**: la ficha tiene `estado = 'FINALIZADA'`, `puntaje_total > 0`, `nivel_logro` con un valor (I/II/III/IV).

- [ ] Ficha finalizada
- [ ] Puntaje calculado automaticamente

## 12. Probar Solicitar Reprogramacion (5 minutos)

**Como**: especialista (`40000004`)

**Pasos**:
1. En el calendario, click en otra visita (la del 2026-04-15 que creaste en paso 8)
2. Click en "Solicitar reprogramacion"
3. Llenar:
   - **Nueva fecha**: 2026-04-20
   - **Motivo**: `El docente solicito cambio por motivos de salud`
   - **Archivo**: cualquier PDF (puede ser uno simulado, no se valida contenido)
4. Click en "Enviar solicitud"
5. Verificar que la solicitud aparece como PENDIENTE

**Verificar en BD**:
```bash
rtk docker exec monitoring-postgres psql -U admin -d monitoring -c "SELECT s.estado, s.fecha_propuesta, s.justificacion, s.archivo_sustento_url FROM solicitudes_reprogramacion s ORDER BY s.created_at DESC LIMIT 1"
```

- [ ] Solicitud creada en BD

## 13. Probar Aprobar Reprogramacion (3 minutos)

**Como**: jefe_gestion (`40000002`)

**Pasos**:
1. Logout, login con `40000002`
2. Ir a "Bandeja de Reprogramaciones"
3. Ver la solicitud pendiente del paso 12
4. Click en "Aprobar"
5. Agregar comentario: `Aprobado por cambio justificado`
6. Confirmar
7. Verificar que el cronograma cambio de fecha

**Verificar en BD**:
```bash
rtk docker exec monitoring-postgres psql -U admin -d monitoring -c "SELECT s.estado, s.resuelto_por_id IS NOT NULL AS resuelto, c.fecha_programada FROM solicitudes_reprogramacion s JOIN cronogramas c ON c.id=s.cronograma_id ORDER BY s.created_at DESC LIMIT 1"
```

**Esperado**:
- `s.estado = 'APROBADO'`
- `resuelto = true`
- `c.fecha_programada` cambio a 2026-04-20

- [ ] Solicitud aprobada
- [ ] Cronograma actualizado a nueva fecha

## 14. Probar Trigger de Inmutabilidad (2 minutos)

**Como**: cualquier usuario autenticado

**Probar con Postman o curl**:
```bash
# Intentar cambiar una fecha de cronograma directamente (sin pasar por reprogramacion)
curl -X PATCH http://localhost:3000/api/cronogramas/0155b7b6-aa57-475c-b524-712f011ad2e9 `
  -H "Content-Type: application/json" `
  -H "Cookie: accessToken=TU_TOKEN" `
  -d '{"fechaProgramada":"2027-01-01"}'
```

**Esperado**: error 400 "Solo se puede modificar cronograma via solicitud de reprogramacion"

- [ ] PATCH directo rechazado

## 15. Probar ILA-0046 (Versionado de Plantilla) - opcional

**Pasos**:
1. Como jefe_gestion, ir a Plantillas
2. Editar la plantilla DOCENTE existente (la del seed)
3. Agregar un desempeno nuevo
4. Click en "Guardar"
5. **Esperado**: el sistema crea v2, la v1 pasa a HISTORICO

**Verificar en BD**:
```bash
rtk docker exec monitoring-postgres psql -U admin -d monitoring -c "SELECT version, estado, descripcion FROM plantillas_monitoreo WHERE tipo_monitoreo='DOCENTE' ORDER BY version"
```

- [ ] v1 = Historico, v2 = Vigente

## 16. Resumen de validaciones

| # | Test | OK |
|---|------|-----|
| 5 | Login | ☐ |
| 6 | Crear plan | ☐ |
| 7 | Crear plantilla con desempenos | ☐ |
| 8 | Crear cronograma | ☐ |
| 9 | Candado 4ta visita | ☐ |
| 10 | Llenar ficha borrador | ☐ |
| 11 | Finalizar ficha con baremo | ☐ |
| 12 | Solicitar reprogramacion | ☐ |
| 13 | Aprobar reprogramacion | ☐ |
| 14 | Trigger inmutabilidad | ☐ |
| 15 | Versionado ILA-0046 | ☐ |

## 17. Limpieza post-pruebas

Para volver al estado inicial:
```bash
# Solo datos (mantener schema)
rtk docker exec monitoring-postgres psql -U admin -d monitoring -c "TRUNCATE fichas_monitoreo, desempenos_plantilla, rubrica_niveles, niveles_calificacion, plantillas_monitoreo, plan_cobertura_ie, planes_monitoreo, cronogramas, solicitudes_reprogramacion, sesiones_auth, docente_cargos, docente_cursos, docente_secciones, docente_especialidades, especialista_especialidades, docentes, especialistas, usuarios, personas, instituciones_educativas, cursos, especialidades, niveles_educativos, modalidades, aspectos_evaluados, logs_auditoria, tokens_recuperacion, permisos, rol_permisos, roles, cargos RESTART IDENTITY CASCADE"
pnpm --filter backend exec node --import tsx ../../database/seeders/index.js

# Limpiar localStorage del navegador: F12 → Application → Storage → Clear
```

## 18. Si algo no funciona

**Error comun 1**: "Cannot find module dist/main.js"
- Solucion: paso 3 (compilar manualmente)

**Error comun 2**: "ECONNREFUSED 127.0.0.1:3000"
- Solucion: backend no arranco, ver consola de Terminal 1

**Error comun 3**: Acciones UI no se reflejan en BD
- Abrir F12 → Console, buscar mensajes `[plantilla]` o `[cronograma]`
- Si hay error de red: el backend esta caido
- Si no hay log: el `FEATURES.apiOnly` o el contexto no esta llamando al backend

**Error comun 4**: Login no funciona
- Verificar que el seeder corrio: `SELECT count(*) FROM usuarios` debe ser 12
- Verificar que el DNI escrito es exactamente 8 digitos
- La contrasena es el mismo DNI
