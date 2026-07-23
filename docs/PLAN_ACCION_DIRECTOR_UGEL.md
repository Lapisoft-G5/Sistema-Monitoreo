# Plan de Acción — Director UGEL

> **Propósito.** El Dashboard del Director UGEL no es un tablero informativo: es una
> herramienta de decisión. Cada indicador que ve debe disparar una acción de gestión.
> Este documento traduce **lo que el director observa → qué significa → qué hace**.

Ámbito: UGEL Lampa. Rol: `director_ugel`. Vista: `/dashboard`.

---

## 1. De la señal a la acción (por indicador)

| Indicador (lo que ve) | Umbral / lectura | Acción que debe tomar |
| --- | --- | --- |
| **Cobertura de monitoreo** (ej. 86%, faltan 14%) | Meta 100%. Cada punto faltante = II.EE. sin monitorear en el año | Exigir al **Jefe de Gestión** la programación de las visitas pendientes antes del cierre del periodo; verificar carga de especialistas |
| **Nivel promedio** (ej. 2.6/4.0) | Meta ≥ 2.6 (umbral *Logro Esperado*). Bajo meta = práctica docente provincial deficiente | Ordenar **acompañamiento pedagógico focalizado** y capacitación; pedir desglose por dimensión de la rúbrica |
| **II.EE. críticas** (contador) | > 0 = intervención obligatoria | Activar el protocolo de intervención (§2) sobre la lista "Requieren atención" |
| **Requieren atención** (lista de IE) | II.EE. en nivel *Inicio* (rojo), ordenadas por menor promedio | Priorizar **una por una**: contactar al director de la IE, agendar visita prioritaria, abrir plan de mejora |
| **Mapa por distrito** (coroplético) | Zonas rojas/ámbar = distritos rezagados | **Redistribuir especialistas** hacia distritos de baja cobertura; resolver logística (distancia, accesibilidad) |
| **Cobertura por distrito** (ranking, peor primero) | < 40% rojo, 40–74% ámbar | Reunión con los responsables del/los distrito(s) al fondo del ranking |
| **Estado de las II.EE.** (dona semáforo) | Balance rojo/ámbar/verde de la provincia | Insumo para el **reporte a la DRE Puno / MINEDU** y para fijar metas del periodo |
| **Monitoreos recientes / Fichas Completadas** | Últimas fichas finalizadas | Auditar **calidad y cierre** de fichas; validar consistencia antes de reportar |

---

## 2. Protocolo de intervención por criticidad

El color del semáforo (derivado del promedio institucional) define la urgencia y el plazo:

| Nivel | Rango (promedio) | Plazo de respuesta | Acciones |
| --- | --- | --- | --- |
| 🔴 **Crítico** (Inicio) | ≤ 1.5 | **≤ 15 días** | Visita de acompañamiento prioritaria · plan de mejora institucional con el director de la IE · seguimiento a 30/60/90 días |
| 🟠 **En proceso** | 1.6 – 2.5 | ≤ 30 días | Acompañamiento pedagógico · fijar compromisos de mejora · re-monitoreo en el periodo |
| 🟢 **Logro previsto** | > 2.5 | Rutina | Reconocimiento · documentar y difundir buenas prácticas |
| ⚪ **Sin registro** | — | Inmediato | Programar la visita: es una IE que **aún no entra al monitoreo** |

> Regla práctica: **"Sin registro" antes que "verde".** Una IE sin monitorear es un
> riesgo mayor que una IE ya evaluada en buen nivel, porque no se sabe su estado.

---

## 3. Escenarios típicos y respuesta

- **La cobertura provincial se estanca (< 75%) a mitad de año**
  → Convocar al Jefe de Gestión; revisar por qué hay visitas sin ejecutar (especialistas
  sobrecargados, reprogramaciones, IEs inaccesibles). Reasignar carga.

- **Un distrito aparece rojo en el mapa** (ej. cobertura < 40%)
  → Focalizar especialistas en ese distrito el siguiente mes; revisar si es un problema
  de distancia/recursos y gestionar apoyo logístico.

- **El nivel promedio baja respecto al periodo anterior**
  → Pedir el desglose por dimensión de la rúbrica para saber qué desempeños arrastran el
  promedio; diseñar capacitación sobre esas dimensiones.

- **Una IE lleva varias fichas en nivel Inicio**
  → Intervención directa: reunión con el director de la IE, plan de mejora con metas y
  fechas, y re-monitoreo obligatorio.

---

## 4. Rutina de gestión (cadencia sugerida)

| Frecuencia | Qué revisa en el dashboard | Decisión típica |
| --- | --- | --- |
| **Semanal** | Cobertura y "Requieren atención" | ¿Vamos al ritmo de la meta? ¿Hay nuevas IE críticas? |
| **Mensual** | Cobertura por distrito + semáforo | Redistribuir especialistas; convocar distritos rezagados |
| **Trimestral** | Nivel promedio + tendencia | Fijar/ajustar metas; planificar capacitaciones |
| **Cierre de periodo** | Todos | Reporte ejecutivo a DRE/MINEDU; cierre de cobertura |

---

## 5. Qué puede hacer HOY en el sistema vs. brechas (roadmap)

Ser honestos: el rol `director_ugel` es de **supervisión**. Su menú actual es
**Dashboard + Fichas Completadas**, así que la mayoría de las acciones de esta guía se
**ejecutan coordinando con otros roles** (Jefe de Gestión programa; Especialistas
monitorean), no directamente en la app.

**Soportado hoy:**
- Visualizar el estado provincial consolidado (KPIs, semáforo, mapa, atención).
- Revisar y exportar las fichas de monitoreo finalizadas (Fichas Completadas).
- Drill-down por distrito para focalizar el análisis.

**Brechas / oportunidades (no soportado aún):**
- [ ] **Registrar un plan de intervención** por IE crítica desde el dashboard (hoy es externo).
- [ ] **Notificar al director de la IE** o al Jefe de Gestión desde la ficha/tarjeta.
- [ ] **Priorizar/solicitar una visita** para una IE pendiente con un clic.
- [ ] **Alertas automáticas** (IE sin visita en N días, cobertura por debajo de umbral).
- [ ] **Comparativo temporal real** (tendencia vs. periodos anteriores; hoy falta histórico).
- [ ] **Desglose por dimensión de la rúbrica** (para explicar el nivel promedio).
- [ ] **Reporte ejecutivo exportable** (PDF) para DRE/MINEDU.

> Estas brechas son el puente entre "el director ve" y "el director actúa dentro del
> sistema". Priorizarlas convierte el dashboard de informativo a operativo.

---

## 6. Cómo saber si las acciones funcionaron

- **Cobertura** sube hacia 100% al ritmo del calendario.
- **# de II.EE. críticas** baja periodo a periodo.
- **Nivel promedio** cruza el umbral de 2.6 (Logro Esperado).
- Ningún distrito queda en rojo al cierre.
- Las IE intervenidas mejoran de banda en el re-monitoreo (rojo → ámbar → verde).
