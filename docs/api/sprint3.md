# API Sprint 3 — Módulos nuevos

Documentación de los endpoints introducidos en Sprint 3. Todos los
endpoints viven bajo el prefijo `/api` y requieren autenticación JWT
(excepto los marcados como `Público`).

Convenciones:
- Fechas: ISO 8601 (`2026-06-20T15:00:00Z`).
- IDs: UUID v4.
- Errores: `{ statusCode, error, message, details? }`.

---

## 1. Planes de Monitoreo

### `POST /planes-monitoreo`
Crea un plan con sus niveles educativos asociados.

Body:
```json
{
  "nombre": "Plan Anual 2026",
  "anioAcademico": 2026,
  "descripcion": "Plan institucional",
  "nivelesEducativosIds": ["uuid-1", "uuid-2"]
}
```
Respuesta 201: `PlanMonitoreo` con array `nivelesEducativos`.

### `GET /planes-monitoreo`
Lista todos los planes con conteo de instituciones.

### `GET /planes-monitoreo/:id`
Detalle del plan.

### `PATCH /planes-monitoreo/:id`
Actualiza nombre/descripcion. No permite cambiar `nivelesEducativos`
directamente; usar `PUT /planes-monitoreo/:id/niveles-educativos`.

### `PUT /planes-monitoreo/:id/niveles-educativos`
Reemplaza la lista de niveles educativos del plan (transacción).

### `POST /planes-monitoreo/:id/archivo`
Sube el PDF del plan. Content-Type: `multipart/form-data` con campo
`file`. Tamaño máximo 10 MB. Solo PDFs.

### `GET /planes-monitoreo/:id/archivo`
Stream del PDF asociado. Content-Type: `application/pdf`.

### `DELETE /planes-monitoreo/:id/archivo`
Elimina el archivo.

### `DELETE /planes-monitoreo/:id`
Elimina el plan. Falla (409) si tiene instituciones asociadas.

---

## 2. Plantillas (refactor relacional)

### `POST /plantillas`
Crea plantilla VIGENTE.

Body:
```json
{
  "nombre": "Plantilla Docente 2026-A",
  "tipoMonitoreo": "DOCENTE",
  "nivelesEducativosIds": ["uuid"],
  "areasCurricularesIds": ["uuid"],
  "aspectos": [{ "descripcion": "...", "obligatorio": true }],
  "desempenos": [
    {
      "competencia": "Lee diversos tipos de textos",
      "capacidades": ["Obtiene info", "Infiere"],
      "nivelesCalificacion": [{ "valor": 1, "literal": "C", "descripcion": "En inicio" }]
    }
  ],
  "comentariosAdicionales": "..."
}
```

### `GET /plantillas`
Lista plantillas con su `estadoVersion` (VIGENTE / HISTORICO).

### `GET /plantillas/:id`
Detalle completo con desempenos, aspectos y niveles.

### `PATCH /plantillas/:id`
Modifica una plantilla VIGENTE. Si cambia la estructura de desempenos
o aspectos, la v1 pasa a HISTORICO y se crea una nueva VIGENTE (v2).
La data de fichas en proceso se conserva apuntando a v1 (HISTORICO).

### `GET /plantillas/:id/borrador-ficha`
Devuelve los desempenos y aspectos tal como se usan para una nueva
ficha. Para v1: los muestra directamente. Para v2: los mapea desde v1
a v2 (ILA-0046).

### `POST /plantillas/:id/publicar`
Fuerza el paso de BORRADOR a VIGENTE.

---

## 3. Cronogramas / Visitas

### `POST /cronogramas`
Crea una visita (candado operativo: max 3 pendientes por especialista).

### `GET /cronogramas`
Lista visitas con filtros opcionales:
- `?especialistaId=uuid`
- `?estado=PROGRAMADO|EN_PROCESO|COMPLETADO|CANCELADO`
- `?fechaDesde=2026-01-01&fechaHasta=2026-12-31`

### `GET /cronogramas/:id`
Detalle.

### `PATCH /cronogramas/:id`
Actualiza una visita. **El trigger de inmutabilidad** (`sps_validar_update_cronograma`)
rechaza cambios si `app.reprogramacion_apply` no es `true`. Usar
`POST /cronogramas/:id/solicitar-reprogramacion` para cambios de
fecha/estado legítimos.

### `DELETE /cronogramas/:id`
Elimina visita (solo si no tiene ficha).

### `POST /cronogramas/:id/solicitar-reprogramacion`
Crea una solicitud de reprogramación (estado PENDIENTE).

Body:
```json
{ "fechaPropuesta": "2026-07-15T09:00:00Z", "motivo": "..." }
```

### `POST /cronogramas/:id/aprobar-reprogramacion`
Aprueba y aplica. **Internamente** setea
`app.reprogramacion_apply = true` antes de UPDATE.

Body:
```json
{ "comentario": "Aprobado por director" }
```

### `POST /cronogramas/:id/rechazar-reprogramacion`
Rechaza la solicitud pendiente.

Body:
```json
{ "comentario": "Fecha no disponible" }
```

### `GET /cronogramas/reprogramaciones`
Bandeja de solicitudes de reprogramación. Filtros:
- `?estado=PENDIENTE|APROBADA|RECHAZADA`
- `?solicitanteId=uuid`
- `?decisorId=uuid`

---

## 4. Fichas / Evaluaciones

### `POST /fichas`
Crea una ficha para una visita.

Body:
```json
{
  "cronogramaId": "uuid",
  "areaCurricularId": "uuid",
  "grado": "3.",
  "seccion": "A",
  "cantidadEstudiantes": 30,
  "cantidadEstudiantesNee": 2
}
```

### `GET /fichas/:id`
Detalle con todas las respuestas.

### `GET /fichas/visita/:cronogramaId`
Obtiene la ficha de una visita (o 404 si no existe).

### `PATCH /fichas/:id/respuestas-desempeno`
Guarda la calificación de un desempeno.

Body:
```json
{ "desempenoId": "uuid", "nivelCalificacion": 3 }
```

### `PATCH /fichas/:id/respuestas-aspecto`
Marca/desmarca un aspecto.

Body:
```json
{ "aspectoId": "uuid", "marcado": true }
```

### `PATCH /fichas/:id/finalizar`
Cierra la ficha. Recalcula baremo automáticamente (motor de baremo:
suma ponderada de niveles + ajuste por checklist).

Body:
```json
{ "observaciones": "..." }
```

### `POST /fichas/:id/migrar-plantilla` (ILA-0046)
Migra las respuestas de una ficha a la nueva versión de plantilla cuando
la original pasa a HISTORICO.

Body:
```json
{
  "plantillaNuevaId": "uuid",
  "modo": "MAPEAR_POR_NOMBRE" | "MAPEAR_POR_INDICE"
}
```

Respuesta: ficha migrada con `plantillaId = plantillaNuevaId` y un log
de respuestas que no pudieron mapearse (`detalles.respuestasNoMapeadas`).

---

## 5. Reportes

### `GET /reportes/ficha/:fichaId`
Reporte detallado de una ficha (incluye baremo calculado, desempenos,
aspectos y observaciones).

### `GET /reportes/especialista/:id`
Reporte agregado de todas las fichas de un especialista.

Filtros:
- `?fechaDesde=2026-01-01&fechaHasta=2026-12-31`
- `?estado=FINALIZADA`

### `GET /reportes/institucion/:id`
Reporte agregado de fichas de una institución.

Mismos filtros que anterior.

### `GET /reportes/consolidado`
Consolidado global (requiere rol admin).

### `GET /reportes/ficha/:fichaId/export`
Exporta la ficha como HTML imprimible (botón "Imprimir / Guardar como
PDF" en el navegador).

### `GET /reportes/especialista/:id/export?formato=pdf`
Exporta PDF del reporte del especialista (requiere `pdfkit` instalado).
Si pdfkit no esta disponible, devuelve 503 con `message: 'PDF generation
requires pdfkit package'`.

---

## 6. Catálogos

### `GET /catalogos/niveles-educativos`
Lista de niveles educativos (Inicial, Primaria, Secundaria, ...).

### `GET /catalogos/areas-curriculares`
Áreas curriculares.

### `GET /catalogos/especialidades`
Especialidades (relacional M:N con docentes y especialistas).

### `GET /catalogos/cursos`
Cursos. Filtros: `?nivelEducativoId=uuid&areaCurricularId=uuid`.

### `GET /catalogos/turnos`
Turnos (Mañana, Tarde, Noche).

---

## 7. Cambios incompatibles con sprint 2

| Antes                          | Ahora                                |
|--------------------------------|--------------------------------------|
| `Plantilla.especialidad` (string) | `Plantilla.especialidades[]` (M:N)  |
| `Institucion.nivelEducativo` (string) | `Institucion.nivelEducativoId` (FK) + `nivelEducativo` (denormalizado) |
| `Docente.especialidad` (string) | `Docente.especialidades[]` (M:N)    |
| `Cronograma.fecha` (sin hora) | `Cronograma.fechaHora` (timestamp)   |
| `Ficha.plantilla` (object embebido) | `Ficha.plantillaId` (FK)            |

---

## 8. Errores comunes

- `400 VALIDATION_ERROR`: body no cumple el DTO.
- `401 UNAUTHORIZED`: token ausente o inválido.
- `403 FORBIDDEN`: rol insuficiente.
- `404 NOT_FOUND`: recurso inexistente.
- `409 CONFLICT`:
  - 3 visitas pendientes para el mismo especialista.
  - Intentar UPDATE de cronograma sin `app.reprogramacion_apply`.
  - Eliminar plan con instituciones asociadas.
- `413 PAYLOAD_TOO_LARGE`: PDF > 10 MB.
- `422 UNPROCESSABLE_ENTITY`: transición de estado inválida
  (ej. finalizar ficha sin completar desempenos obligatorios).
