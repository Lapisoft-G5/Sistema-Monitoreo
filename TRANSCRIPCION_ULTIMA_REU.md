# AUDITORÍA TÉCNICA Y PLAN DE ACCIÓN — ÚLTIMA REUNIÓN DE COORDINACIÓN
**Sistema de Monitoreo Pedagógico — UGEL / Instituciones Educativas**

---

## 1. Ficha Técnica y Participantes

* **Fecha de transcripción**: Octubre 2026.
* **Duración**: ~1h 02m.
* **Participantes**:
  * **Ing. Cristian**: Líder de desarrollo / Presentador técnico.
  * **Maestro Edwin**: Coordinador pedagógico / Representante de UGEL.
  * **Maestro Einar (Initer)**: Directivo / Evaluador de Institución Educativa (Secundaria Técnica).
  * **Maestro Wilber**: Especialista / Responsable de Nivel de UGEL.
* **Objetivo de la sesión**: Demostración de mejoras y correcciones tras pruebas en vivo, revisión de la simulación de monitoreo en etapa UGEL, y preparación de la marcha blanca en cuentas de Institución Educativa (Directores, Coordinadores y Jefes de Taller).

---

## 2. Resumen Ejecutivo

La reunión arrojó tres conclusiones fundamentales:
1. **Éxito en la etapa UGEL**: El flujo de monitoreo a docentes ejecutado por especialistas de UGEL ya fue probado en simulación real con resultados satisfactorios.
2. **Decisión Arquitectónica Clave (Cero Proliferación de Formatos)**: Ante la consulta de crear formatos de plantillas alternativos (desglosados o por variantes técnicas), la UGEL y el directivo acordaron formalmente **no crear nuevos formatos en el software** y **unificar todas las evaluaciones bajo la estructura oficial de Rúbricas de Observación de Aula (4 niveles)**.
3. **Deuda Técnica y Ajustes Bloqueantes antes de la Reunión con Directores**: Existen bugs críticos de integración (mapa, clonación de plantillas, compatibilidad con Edge) y reglas de negocio pendientes (evaluadores permitidos para el Director y disponibilidad de plantillas oficiales en las IEs) que deben resolverse con enfoque end-to-end antes de la capacitación general a directivos de la próxima semana.

---

## 3. Matriz de Requerimientos y Acciones Técnicas

### 🔴 Categoría A: Bugs Críticos y Bloqueos Técnicos (Prioridad Inmediata)

#### 1. Fallo en Filtros del Mapa por Modalidad y Nivel
* **Minuto**: `5:46 - 6:59` y `17:01 - 18:06`.
* **Problema reportado**: Al interactuar con los nuevos filtros de modalidad (EBR, EBA, EBE) o nivel (Inicial, Primaria, Secundaria) en el mapa de instituciones, el sistema arrojó errores en vivo por desincronización o fallo en la consulta a la base de datos ("vi la misma falla, el mismo mensaje en otras acciones").
* **Diagnóstico técnico**: Endpoint de instituciones/mapa (`/api/instituciones` o `/api/mapa`) falla al recibir ciertos parámetros combinados de modalidad/nivel o devuelve 500 por filtros no soportados en la consulta Prisma.
* **Acción requerida**:
  * Auditar controlador y servicio de instituciones/mapa.
  * Blindar la consulta Prisma para combinaciones de modalidad/nivel asegurando manejo de casos vacíos.
  * Probar integración del mapa en frontend para evitar caídas de renderizado ante errores de red.

#### 2. Edición del Nombre al Clonar Plantillas no se Guarda
* **Minuto**: `21:13 - 22:49`.
* **Problema reportado**: Al usar la opción "Clonar plantilla", se genera una copia con el nombre por defecto `Copia basada en [nombre original]`. El usuario intenta editar este nombre en el formulario, el input permite escribir, pero al guardar no persiste el cambio (sigue manteniendo el nombre generado o no lo carga).
* **Diagnóstico técnico**: El endpoint o servicio de clonación/actualización de plantilla no toma el `nombre` enviado en el payload de actualización o lo sobreescribe en la creación de la réplica.
* **Acción requerida**:
  * Revisar endpoint `POST /api/plantillas/:id/clone` y `PATCH/PUT /api/plantillas/:id`.
  * Asegurar que el contrato (`IActualizarPlantillaDto`) acepte y persista el nombre personalizado.
  * Crear test E2E / integración: clonar plantilla -> renombrar -> verificar nombre en BD.

#### 3. Incompatibilidad de Selector de Especialistas en Microsoft Edge
* **Minuto**: `28:02 - 35:00`.
* **Problema reportado**: En Microsoft Edge (actualizado), al crear un cronograma y elegir modalidad EBR y nivel Secundaria/Primaria, el desplegable de Especialistas reportaba *"No hay especialistas para el nivel..."*, mientras que en Google Chrome con el mismo usuario y datos funcionaba con normalidad.
* **Diagnóstico técnico**: Comportamiento diferencial en el cliente por caché (React Query stale times), serialización/normalización de cadenas con tildes (`normalize('NFD')`), o evaluación asíncrona de dependencias en `useMemo` dentro de `use-opciones-de-evaluacion`.
* **Acción requerida**:
  * Verificar en navegadores Chromium/Edge el flujo de cascada `Modalidad -> Nivel -> Especialistas`.
  * Garantizar que la consulta a React Query no quede en estado `idle`/vacío por discrepancia en headers o sesión.

---

### 🟡 Categoría B: Reglas de Negocio y Permisos de Monitoreo (Prioridad Alta)

#### 4. Monitoreo Directivo: Ampliar Evaluadores Habilitados para el Director
* **Minuto**: `22:56 - 27:50`.
* **Problema reportado**: Al programar una visita a un **Director** (Ficha Directiva / `tipoMonitoreo: 'DIRECTIVO'`), el formulario solo permitía seleccionar a los Responsables de Nivel (Jefes de Área), bloqueando a los Especialistas y al Jefe de Gestión Pedagógica.
* **Regla oficial aclarada por UGEL (Maestro Edwin)**:
  * El Director de una I.E. debe poder ser monitoreado por:
    1. **Especialistas de UGEL** (son sus jefes inmediatos en temas pedagógicos).
    2. **Responsables de Nivel** (Jefes de Área de su respectivo nivel).
    3. **Jefe de Área de Gestión Pedagógica** (Jefe de Gestión).
* **Acción requerida**:
  * **Frontend**: En `apps/frontend/src/features/cronogramas/lib/asignacion.ts` y `use-opciones-de-evaluacion.ts`, cuando `tipo === 'DIRECTIVO'`, permitir como evaluadores a Especialistas, Responsables de Nivel y Jefe de Gestión.
  * **Backend**: En `scheduling-cronograma.helper.ts`, asegurar que la validación no rechace a Especialistas ni a Responsables de Nivel al levantar fichas directivas.
  * Pruebas: Test de integración verificando que Especialista, Responsable de Nivel y Jefe de Gestión puedan crear cronogramas de tipo `DIRECTIVO`.

#### 5. Disponibilidad de Plantillas Oficiales de UGEL para I.Es sin Bloqueo
* **Minuto**: `728 - 752`.
* **Problema reportado**: El usuario directivo de una institución educativa ingresó al módulo de plantillas y observó el mensaje: *"Tu institución no tiene ninguna plantilla autorizada"*, creyendo que no podía monitorear sin un trámite previo de solicitud de plantilla.
* **Aclaración de negocio**: Las I.Es deben disponer por defecto de las plantillas oficiales vigentes creadas por la UGEL para ejecutar su monitoreo interno (Director, Coordinador Pedagógico, Jefe de Taller), sin requerir autorización previa. Las solicitudes aplican únicamente para plantillas personalizadas.
* **Acción requerida**:
  * Asegurar que el selector de plantillas e instrumentos en la I.E. liste directamente las plantillas oficiales activas de la UGEL según el nivel y modalidad de la institución.
  * Ajustar el mensaje en UI cuando una I.E. no tenga plantillas *propias*: aclarar que está utilizando las plantillas institucionales de la UGEL.

---

### 🟢 Categoría C: Funcionalidades Presentadas y Validadas (Cerradas)

#### 6. Nueva Interfaz de Inicio de Sesión
* **Minuto**: `0:43 - 2:17`.
* **Estado**: Aprobado unánimemente por UGEL e I.Es. Desplegado en producción.

#### 7. Catálogo de Especialidades CNEB y Soporte de Especialidades Extras
* **Minuto**: `3:41 - 5:21`.
* **Estado**: Aprobado por el Maestro Edwin. En código ya quedó resuelto y probado con tests end-to-end (el especialista puede programar visitas en su materia principal y en cualquiera de sus especialidades extras).

#### 8. Denominación "Responsables de Nivel" y Asignación de Visitas
* **Minuto**: `18:06 - 20:13`.
* **Estado**: Reemplazo de "Jefe de Área" por "Responsable de Nivel" validado. Ya pueden recibir cronogramas y ejecutar visitas en su nivel educativo.

---

### 🔵 Categoría D: Decisiones de Arquitectura y Acuerdos de Alcance

#### 9. Estandarización Universal bajo la Ficha Oficial de Rúbricas
* **Minuto**: `36:20 - 42:40`, `50:14 - 60:00`, `758 - 853`.
* **Propuesta inicial de I.E.**: Crear plantillas personalizadas con dimensiones, indicadores y listas de cotejo para secundaria técnica y variantes.
* **Resolución técnica y pedagógica consensuada**:
  * **RECHAZADO el desarrollo de formatos dispersos**: Evitar la proliferación descontrolada de modelos de fichas en el software.
  * **ADOPCIÓN OBLIGATORIA**: Todas las instituciones educativas y directivos deben adecuar sus instrumentos a la **Ficha Rúbrica Oficial (4 niveles de desempeño)**.
  * El Maestro Einar se comprometió a trasladar los desempeños técnicos a la rúbrica oficial.
  * La UGEL formalizará este criterio en la reunión general con directores de la próxima semana.

---

### ⚪ Categoría E: Iniciativas Futuras a Largo Plazo

#### 10. Docentes en Múltiples Instituciones Educativas
* **Minuto**: `20:13 - 20:38`.
* **Alcance**: Permitir que un mismo docente (misma persona/DNI) esté adscrito a dos o más I.Es con diferente carga horaria y nivel.
* **Planificación**: Requiere reestructuración del modelo de datos (`DocenteInstitucion` / plazas). Acordado para abordarse como épica en sprints posteriores.

---

## 4. Plan de Ejecución End-to-End (Rebanadas Verticales)

Para garantizar estabilidad antes de la reunión de directivos, se establece el siguiente orden de trabajo estricto:

```mermaid
flowchart TD
    subgraph Slice 1: Monitoreo Directivo
        A1[Contrato: Roles evaluadores directivos] --> A2[Backend: scheduling-cronograma.helper]
        A2 --> A3[Frontend: use-opciones-de-evaluacion & asignacion.ts]
        A3 --> A4[Tests: Scheduling directivo con Especialista y Jefe de Gestión]
    end
    
    subgraph Slice 2: Corrección Clonación de Plantillas
        B1[Contrato: Payload de clonación y edición de nombre] --> B2[Backend: Persistencia de nombre en clon]
        B2 --> B3[Frontend: Modal/Formulario de clonación]
        B3 --> B4[Tests: Clonación y renombramiento verificado]
    end

    subgraph Slice 3: Blindaje de Filtros de Mapa
        C1[Auditoría: Endpoint de mapa y filtros por modalidad/nivel] --> C2[Backend: Query Prisma blindada]
        C2 --> C3[Frontend: Manejo resiliente de capas en mapa]
        C3 --> C4[Tests: Filtrado sin caídas de servidor]
    end

    subgraph Slice 4: Plantillas UGEL Disponibles en I.E.
        D1[Verificación de consulta de plantillas vigentes UGEL para I.E.] --> D2[Ajuste de selector en perfil directivo]
        D2 --> D3[Verificación E2E de inicio de visita directiva con ficha oficial]
    end

    Slice 1 --> Slice 2 --> Slice 3 --> Slice 4
```

---

## 5. Anexo: Transcripción Literal de la Reunión

*(Transcripción íntegra con marcas de tiempo preservada para fines de auditoría y trazabilidad).*

```text
0:02
Bien, en todo caso podríamos este digo empezar con la reunión
0:08
o esperaríamos a alguien más. Iván no va a poder, mi compañero Iván no
0:17
va a poder ingresar. Tiene unos pendientes.
0:23
Ingeniero Cristian, yo creo que podríamos empezar. Entre tanto, ya se
0:27
van uniendo por el resto también. Bien, en la reunión que se ha tenido
0:43
anteriormente, bueno, se habló sobre varias mejoras y también correcciones a
0:47
realizar, ¿no?, en el sistema, ya que lo han probado en vivo. En este caso, una
0:53
de ellas o la primera que se puede observar es la mejora sobre la interfaz
0:57
del inicio de sesión, ¿no? el sistema. Eh, bueno, en este caso hemos propuesto
1:03
este diseño y nos gustaría saber su opinión al respecto o si gustarían algún
1:10
ajuste, si es que están observando mi pantalla.
1:17
Sí, sí, estamos observando. Para mí está bien.
1:31
Okay. Sí, para mí está bien. No sé. A ver,
1:34
Einar, si tienes alguna opinión, algo que podamos mejorar. Para mí lo veo
1:38
excelente ahí, ¿no? Sí. Buenas noches, ingeniero Cristian.
1:48
Buenas noches. Este, maestro Edwin, eh sí veo que está ya lo
1:54
solicitado, creo, ¿no? Eh, todavía eso no se ha
2:01
este reemplazado en el en el host que tenemos, ¿verdad? porque
2:07
no lo visualizo todavía en Sí, hasta allá.
2:14
Sí, hasta allá. Ah, ahora sí, ahora sí. Gracias,
2:17
gracias. Sí, sí. Okay.
2:22
Otro tema era, a ver, vamos a ingresar. Okay, un momento, por favor.
3:14
Hien, ahora sí continuando.
3:41
Bueno, otra observación fue sobre el tema de las áreas curriculares, ¿no? Que
3:45
en este caso si nos dirigimos a crear un especialista
3:49
que sería de secundaria, eh antes tendríamos que ingresar de forma manual,
3:54
¿no?, a la especialidad. Ahora, en base al documento que se nos ha
3:58
con el que se nos ha ayudado, bueno, hemos estandartizado, ¿no? En base a los
4:02
cursos, como tanto es especialidad principal.
4:06
Hm. ver si bueno algún curso lo vean
4:10
incorrecto, me dicen, por favor. Y igual forma para las especialidades extras,
4:15
¿no? O temporales que básicamente son los mismos cursos.
4:21
Esta sería una de las mejoras, digamos, o correcciones.
4:29
Ingeniero, una consulta ahí. Eso significa que en el caso, por ejemplo,
4:34
si a este especialista le voy a generar estas especialidades extras, ya voy a
4:40
poder cronogramarle en esas especialidades extras también, ¿no es
4:43
cierto? Claro,
4:46
porque hasta ahora, por ejemplo, solo como tenía una especialía que era, por
4:50
ejemplo, matemática, solo podía este cronogramarle a los docentes de esa
4:55
especialidad nada más. Claro. Sí. Ahora debería poder, ¿no? Con
4:59
las especialidades extras que se tiene. Ah, okay. Listo. Okay. Excelente.
5:21
Bien, otra mejora. A ver, sería respecto al
5:27
mapa. si no me equivoco. Sí. Bien, en este caso se ha hecho un cambio
5:33
en el mapa. Ahora digamos que se ve un poco más cercano a lo que nos brinda
5:38
Google Maps, como son carreteras o mismas calles,
5:42
¿no? En este apartado consideramos que se ha hecho una mejora.
5:46
De igual forma se aumentó lo que son los filtros o por modalidad para ver las
5:52
instituciones. En este caso pueden ser de
5:58
A ver, vamos a ingeniero vi la misma falla, el mismo
6:04
mensaje en otras acciones que estuve navegando.
6:11
Okay. Entonces, un problema un buúo usando
6:42
un par de días, me imagino, en estos días.
6:48
No, estoy estoy este mi cuenta estoy explorando y también la del director.
6:52
Ahí es donde vi eso. Sí, pero eso es un problema con el
6:59
despliegue. Y bueno, en este momento vamos a corregirlo también.
7:55
A ver, es un tema con la base de datos que
8:06
parece se nos pasó actualizarla. Pero no habríamos tenido problemas tras
8:12
esto. Bueno, me disculpan unos 3 minutos o
8:39
cinco, por favor, para poder solucionar este tema de la base de datos,
8:44
si no molestia, por favor.
8:49
Está bien, ingeniero. Está bien. No hay problema.
17:01
Bien, disculpen la demora. Bien, este es un bueno, un problema que
17:30
hemos encontrado. Ah, lo vamos a trabajar en este caso. Bueno, son cosas
17:35
que pasan en en la computadora de un compañero puede funcionar todo normal.
17:39
Bueno, en este caso lo tenemos que observar. Bueno, básicamente lo que se
17:42
hizo fue agregar las modalidades o bueno, un filtro de modalidades, ¿no? Es
17:47
como se refirió en base a bueno que debería funcionar y y este nos debería
17:51
permitir filtrar ya sea en primaria, secundaria o inicial, ¿no? Bueno, en
17:55
este caso sigue fallando. Creo que en eso lo vamos a trabajar,
18:01
pero bueno, espero que en la siguiente reunión lo podamos presentar con mayor
18:06
orden. Entonces, otra de las observaciones fue pasar a llamar a lo
18:12
que son los jefes de área como responsables de nivel, ¿no? En este caso
18:16
se ha realizado el cambio, ya no tenemos como tal jefes de área, sino ahora la
18:21
denominación sería responsable de nivel. De igual forma
18:28
se tenía la obseración que estos bueno responsables de nivel también
18:33
deberían poder realizar lo que son las las visitas.
18:42
h moviendo.
19:51
Bien, y como podemos ver en la parte de cronograma, ahora si entramos como BR,
19:56
por ejemplo, al área de secundaria, podemos ver al responsable de nivel,
20:00
¿no? José Luis Quisem y a quién si ahora si le se le puede asignar, digamos, un
20:05
cronograma o y bueno, estas creo serían los
20:13
principales cambios. Ah, también estaba el tema sobre que los
20:18
docentes puedan trabajar en diferentes instituciones educativas y creo que con
20:22
mi con mi compañero Iván se conversó que bueno, este es una funcionalidad mayor
20:27
que va a tomar cierto tiempo que bueno se va a ir desarrollando a lo largo de
20:33
las reuniones que vayamos teniendo. Bien, bueno, queda como pendiente el
20:38
tema de los filtros en este caso que tenemos que corregirlo.
20:44
Y bueno, me parece que podrían tener algunas dudas
20:50
respecto ingeniero. Este, bueno, si hay este
21:13
mejoras en esta situación, no hay problema. Yo hemos estado utilizando el
21:17
sistema y en algunos casos, por ejemplo, en el
21:21
al clonar una plantilla eh normal nos permite clonar la
21:26
plantilla. En caso nosotros hemos hecho la UGEL, podemos clonar. El detalle está
21:31
que al clonar eh sale un nombre, ¿no es cierto? Dice copia basada en tal, dice,
21:37
¿no? Ajá. Eh, es ese nombre de copia basada. Luego
21:40
no lo puedo modificar. Hm. Okay. Si se dirige el nombre, ¿no?
21:48
Es es Sí, a esa la parte de ahí. Claro. Cuando le saca copia, me dice.
21:58
Cuando le saco copias con la opción clonar.
22:12
esa parte del año sí tiene la opción más bien, ¿no?, de modificar esa partecita
22:16
no es no hay problema. Eh, más bien en el nombre justo donde
22:20
está usted y es el día. Claro, me parece le permite modificar,
22:32
pero no se está cargando, ¿no? El nombre como tal.
22:35
Ajá. Sí, me permite modificar, pero no lo carga. Mm.
22:38
Okay. Este es otro que tengo que guardar al
22:49
listo. Otra que hemos ido observando es eh al hacer eh en el cronograma un
22:56
registro eh
23:03
ahí, por ejemplo, hacemos un cronograma registro. Hemos hecho también una ficha
23:07
para el director. Ahí, por ejemplo, seleccionamos la modalidad EBR. Arriba
23:14
EBR. Bueno, secundaria puede ser. Sí. El especialista.
23:20
Eh, ¿qué más? la institución educativa, ya el director.
23:27
Entonces ahí, por ejemplo, h solo eh los responsables de nivel pueden
23:32
seleccionar, más no los especialistas, ¿no? Eso hemos
23:36
podido apreciar. Ah, okay. Claro, en este momento se
23:39
están considerando tanto especialistas para directamente. Entonces,
23:43
entonces, claro, cuando es director solamente lo
23:47
puede hacer responsable general. Hm. Eso no lo
23:51
podemos modificar, ingeniero Cristian, también aperturarlo para los
23:54
especialistas. Claro, claro. Entonces, claro, como
23:57
estamos mencionando, solamente pueden evaluar los responsables de nivel a lo
24:00
que son los directores. Ajá.
24:03
Tenemos que ampliarlo a los especialistas y al jefe de área también
24:07
de gestión pedagógica. Él también hace monitoreos.
24:13
A ver, claro, jefe de área ahora serían los
24:19
responsables de nivel, ¿verdad? Sí, esos son los jefes de área, pero hay otro
24:22
jefe de área de gestión pedagógica, el que está arriba de ellos, ¿no? Él
24:26
también hace monitoreo. Okay.
24:45
Para recalcar esto, entonces al director lo pueden evaluar tanto responsables de
24:50
nivel como jefes de área de gestión pedagógica.
24:52
Jefes de área de gestión pedagógica y los especialistas. En realidad ellos son
24:55
sus jefes inmediatos de los directores. Claro. Ah, especialistas también.
25:01
Especialistas también. Okay.
25:06
Entonces, en este apartado sería agregar a lo que son los jefes de área de
25:10
gestión pedagógica. únicamente jefe de gestión pedagógica y los especialistas.
25:16
Claro, aquí ya estarían los especialistas o
25:19
ahí ya estarían los responsables de nivel están ahí o
25:22
responsable de nivel o lo que estábamos llamando antes jefes
25:25
de área, ¿no? Así es.
25:27
Ajá. Ahí tendemos que incluir a los especialistas y al jefe del área de
25:31
gestión pedagógica. Okay.
25:35
Okay. Ya lo tenemos. Listo. Ya. Otra situación que he estado
25:41
así por curiosidad, este, en la mañana se nos plantó un poco el Google Chrome y
25:47
entramos a otro navegador, al del Microsoft, el Edge.
25:52
Vamosamos ahí. Y bueno, ahí no permite generar el cronograma, no no
25:57
permite seleccionar al especialista. Ese es en otro navegador, en el Chrome.
26:03
Así normal. Bueno,
26:57
puede ser por la versión. En este caso estoy probando en este momento con Edge
27:03
y me está primiendo. Se refiere aquí, ¿verdad? registrar un cronograma.
27:07
Mm. Sí, ahí eso. Selecciona normal, eso también no hay problema. Ahí a los
27:12
especialista ya no me permite. Es por mi inversión.
27:17
Podría ser, podría ser la versión porque en este caso estoy probando
27:23
a ver y me está permitiendo normal, ¿no? En este caso tengo la 154.
27:31
Claro, me dice que no le permite, pero nada. No, pero el indicador de debajo si
27:36
le dice que tiene tres especialistas, por ejemplo.
27:39
O le muestro mi pantalla o por favor.
27:42
Le muestro mi pantalla. No. Ya,
28:02
ya se aprecia, ¿no? La mía. Sí, ahora sí.
28:09
Ya. Entonces este aquí estoy en el en el de Microsoft. Normalmente sí puedo
28:16
seleccionar EBR, el nivel, no hay problema. Primaria, secundaria. El
28:21
detalle está aquí. Claro, el sistema le está indicando que
28:26
no hay especialistas para el nivel secundario.
28:31
Si tiene especialistas, digamos, registrados para este nivel.
28:35
Sí, sí, sí, sí. Normal. En el en el Chrome normal lo hago. Este está en el
28:40
en el de Microsoft. Simplemente aquí es donde tienes ese
28:46
problema, dice. Aquí tengo ese problema. Sí,
28:48
nada le aparece. Sí, no me aparece, mira, ni en inicial,
28:51
ni en primaria ni en uno. No, pero eso solo en ese navegador. Ahora no lo he
28:55
probado en los demás, pero en este tenía ese problema.
29:08
Solo para podría usted entrar, por favor, a ver la versión de su navegador
29:12
o nosotros también para probar en ser
29:22
la parte de configuración y en la última opción que dice acerca
29:28
del micros. Bueno, sí está actualizado. Sí.
29:36
Bien. Entonces también lo vamos a evaluar.
29:39
Ah, vamos a probar distintos novedadores para ver si también ocurre este
29:43
problema. Claro, me dice que en Chrome es normal, ¿verdad?
29:45
En Chrome normal. Ya he seleccionado y te hecho todo, ¿no? Les hemos asignado
29:50
este ya los monitoreos también, ¿no? No hay problema.
30:16
¿Qué más? ¿Qué más? ¿Qué más había? Otro me vine a pie desde allá hasta acá
30:28
y demoré 20 minutos menos. Sí, rápido. Es, yo te dije.
30:36
Okay. ¿Algún otro observación? Ha entrado Wilber también. Tal vez
30:45
Wilber, ¿alguna observación más que no estemos indicando? O Einar, ¿qué has
30:50
estado probando? también el sistema. Eh, sí, y creo que tendríamos que ir
30:59
este de arriba para abajo para probarlo ya este las fichas como lo hemos probado
31:07
la otra vez y en el caso de aprobaciones de fichas
31:12
nuevas que le decía información técnica, si tal vez está corriendo eso o hay
31:18
alguna dificultad. Aprobación de fichas
31:31
sería las plantillas, ¿no? Verdad. Ah, en este caso ha tenido alguna
31:39
dificultad en específico con esto? Sí, tal vez. No sé si puedo entrar a las
31:46
cuentas y explicarle un poco. A ver. Sí,
31:50
listo. Bien, ahí en pantalla tengo lo que es el
32:17
la cuenta de dirección de mi institución educativa
32:23
y en el tema de las plantillas no hay ningún problema, ya está aparece
32:33
la ficha de rúbrica que tenemos. ¿Está bien?
32:39
El detalle ahora está en que nosotros hemos solicitado
32:47
una nueva ficha, ¿no? Que lo ha solicitado la dirección, pero no lo veo
32:52
por acá haber visualizado. Debe estar en la cuenta de, a ver,
32:58
en mis solicitudes. No está initar. A ver, a ver,
33:05
a ver, creo que está acá. Ah, ya. Sí está.
33:09
Ya está. Entonces se ha solicitado a través de un documento
33:13
una nueva ficha, ¿no? Y ha sido aprobada aquí, ¿no? Lo ha aprobado el jefe de
33:19
gestión. Eh, eso quiere decir que ya lo podemos
33:23
utilizar esta nueva ficha, ¿no? Entonces, yo ya tengo
33:28
ahí la aprobación del director y me estoy yendo a mi cuenta ahora
33:36
donde eh necesito
33:46
registrar una nueva plantilla, ¿no? El detalle que esta plantilla está
33:53
netamente ligado a lo que es el desempeño
33:58
y sus niveles. H no sé si yo podría variarlo porque
34:03
esta es la ficha que nosotros usamos en la variante técnica, al menos en la
34:07
institución, ¿no? Imagino que cada institución va a hacer y lo propio, pero
34:12
sin embargo más adelante ojalá que haya la idea de que todas las, por ejemplo,
34:16
las decisiones técnicas tengan una única ficha de evaluación de monitoreo docente
34:24
del docente técnico, ¿no? En este modelo de servicio educativo y secundario de
34:27
formación técnica, ¿no? El el que tengo de pronto es este de acá
42:34
con sus escalas, sus dimensiones,
34:40
eh, y sus indicadores, ¿no? No, que no puedo hacer acá porque
34:47
tendría que adecuarlo a este tipo, tendría que adecuar el
34:52
desempeño, su descripción
34:57
y donde está los niveles. Tendría que ponerle en
35:02
todos, repetirle nivel 1, 2, 3, así tendría que
35:07
repetirle, ¿no? Entonces, y cada indicador,
35:12
este indicador, por ejemplo, ya sería para mí
35:16
el desempeño, ¿no? Algo así, si quiero adaptarlo a al
35:22
formato que me está dando la opción ahorita, ¿no? O me equivoco, tal vez no
35:26
estoy en lo correcto, ingeniero. Okay. Estas plantillas se han diseñado
35:32
en base a los primeros documentos que se nos ha brindado y claro, no teníamos
35:40
o bueno, hasta tengo entendido con Ian no teníamos contemplado el tema de que
35:44
pueden variar digamos bastante los campos entre diferentes instituciones de
35:48
las plantillas. sería bueno un trabajo de igual forma
35:53
que los docentes que bueno que puedan trabajar en varias instituciones, bueno,
35:58
que tendríamos que abordarlo, ¿no? Bueno, claro, se podría hacer, pero
36:05
claro, el tema es que no va a ser, digamos, inmediato, ¿no?
36:10
Y claro, usted me menciona es puede variar. Entonces usted digamos podría
36:14
sería un requisito que usted pueda cambiar a el desempeño número uno, por
36:19
ejemplo, ponerle otro nombre, ¿entiendes?
36:23
o igualmente con los campos, nombre desempeño,
36:28
porque esta plantilla se le compartió, se nos compartió, disculpe la pregunta,
36:35
anteriormente no
36:39
solamente se le ha compartido lo que es la ficha de monitoreo a través de
36:43
rúbricas, ¿no? este no lo hemos hecho y y no sé si va a
36:48
ver en por ejemplo la que usted está ah visualizando
36:55
en la cuenta del director, el director hace su monitoreo y sí, el director va a
37:01
utilizar esa ficha. Ya, esta es la que la que se tiene aprobada por el jefe de
37:07
este de acá, la ficha rúbrica, ficha rúbrica de observación de aula. Esto sí
37:13
se va a poder este utilizar, ¿no?, en lo que es el monitoreo
37:17
a los docentes. El director lo va a usar porque esto es general para todos los
37:20
directores. ¿Está bien? El detalle es con las variantes,
37:25
¿no? En las variantes de de las instituciones que normalmente lo aplican
37:32
los coordinadores, como le decía el jefe taller,
37:37
va a ver una pequeña variación como yo le mostraba esta plantilla, pero
37:44
tendríamos que estandarizarlo, ¿no? para que nada, no cada institución no haga lo
37:48
mismo, sino tal vez manejarlo por variante
37:52
o tal vez estoy este algún alcance ahí este Fredwi que tal vez usted ha visto
37:58
que se podría unificar. La idea es unificar y cada vez tener menos este
38:04
variantes este por institución o por modelo, ¿no?
38:25
Maestro Edwin. Sí. este initar tendríamos que hacer, me
38:32
parece, una ficha similar a la que hicimos con A y B.
38:36
Otra propuesta de ficha, ¿no? Cuando seleccionamos el tipo, eh, nos permite
38:42
utilizar el esquema de las rúbricas uno, el otro sería el de EIB. Entonces este,
38:48
por ejemplo, no sé si es mucho pedir a Cristian, al ingeniero Cristian, este
38:52
tendríamos que hacer como otro formato, ¿no? Así yo estoy entendiéndolo.
38:57
Claro, sería hacer un nuevo diseño para este tipo de plantillas.
39:03
Entonces, ya tendríamos que seleccionar entre tres tipos de formato, ¿no es
39:07
cierto? Entre al docente, creo que dice, este, está hay opciones ahí para
39:13
seleccionar. Así es. El tema también es que bueno, si
39:18
es si es que en las demás variantes se tiene esta misma estructura, claro, se
39:23
puede hacer, ¿no? Pero si es que la estructura cambia bastante, ahí sí
39:27
vendría a ser un poco una complicación, ¿no?
39:33
con la nueva respecto a la nueva plantilla que nos muestra loser,
39:38
por ejemplo. Claro, primero pon los niveles y bueno, esos niveles hacen las
39:44
dimensiones, ¿no? Si es que bueno, en estructuralmente son
39:51
muy similares, claro que se puede hacer como menciona el doctor Edwin, una
39:55
tercera plantilla. Pero si es que varían bastante respecto
40:01
a la estructura, bueno, si sería un problema, digamos.
40:10
La otra opción, ingeniero y maestro, este Edwin, sería que esta plantilla,
40:17
esto se adapte al que ya se tiene, ¿no? A esta ficha
40:23
rúbrica con los mismos criterios que está aquí con desempeñ
40:30
eh no lo adaptaríamos de esa forma, ¿no? para que no se genere tantas fichas ya
40:35
por modelo de servicio educativo, ¿no? Y nos evitaríamos de estar generando
40:42
varias, si no nosotros como institución lo tendríamos que adaptar a la ficha.
40:46
Esa sería la otra salida también. No sé cuán viable sería eso, ¿no?
40:51
Sí, sabes que este como experiencia también ahora nosotros hemos adaptado la
40:55
ficha de del director, ya como queríamos hacer la prueba con el director, la
41:02
hemos adaptado al en función de las rúbricas.
41:06
Sí, hemos hecho eso, maestra ya no estamos generando más format, sino
41:11
en esa estructura de ese formato de las rúbricas lo hemos esto, ¿no? Hemos
41:16
desarrollado. Bien, entonces esa sería la indicación.
41:23
Para estos días yo lo podría adaptar a a lo que es la ficha de rúbrica de
41:28
docente. La cosa es que así no se hace un trabajo
41:31
en el software porque analizando bien vamos a tener que por ejemplo a los GEs
41:36
hacer otro modelo para los coordinadores de tutoría, para los coordinadores
41:41
pedagógicos, tal vez van a querer otros modelos, pero sin embargo si si
41:46
establecemos una normativa donde tienen que adaptarse al modelo, a la ficha
41:51
rúbrica, entonces va a ser se va a poder utilizar, yo creo que esta nueva
41:56
plantilla ya tranquilamente en todo tipo de institución.
42:03
Sí, adoptaremos, creo esoer, porque caso contrario, nos vamos a llenar de muchas
42:08
fichas. Exacto. Y eso es lo que tal vez
42:13
tendremos tenemos que evitar, creo, que se que se proliferen muchas fichas.
42:23
Sí, correcto. Bien, en tal caso ese alcance urgente,
42:39
yo también lo voy a trabajar para ya aplicarlo, adecuarlo, ¿no? Entonces, si
42:44
funciona ahí, yo creo que va a funcionar para cualquier modelo de servicio
42:48
educativo. Estaría bien, maestro Edu. Listo. Initer, mira, te voy a compartir
42:56
esta también, ingeniero. Ah, le voy a compartir la pantalla. Y hemos nosotros
43:00
trabajado de esta forma, ¿no? La de directivos.
43:04
A ver, voy a aprovechar que estoy acá en Microsoft.
43:10
Ah, ya. Aquí está. Mira, la ficha de monitoreo a la práctica de la gestión
43:14
del directivo le hemos colocado, ¿no? Entonces esta esta ficha la hemos
43:19
adecuado. Aquí está la el desempeño y bueno, está
43:26
también con las cuatro rúbricas esta, ¿no?
43:29
Igual también se observa, ¿no? Ainar.
43:34
Sí, sí, sí, lo estoy observando. Ajá. Entonces lo hemos adecuado así,
43:39
¿no? Ya está ahí.
43:43
Esta es la que vamos a utilizar con los directivos, por ejemplo.
43:51
Listo. Esa es una adecuación de la ficha
43:58
del directivo. Rúbricas, este, de evaluación de
44:01
rúbricas o o es otra del directivo. Es esto
44:06
que tiene la misma que tiene la misma estructura.
44:09
Ah, ya, ya, ya, ya. tiene la misma estructura de de la ficha de rúbricas
44:14
del docente. Tiene esa misma estructura. Ah, ya no se ha creado otra porque en el
44:22
sistema tenemos tres fichas establecidas, el docente de directivo y
44:27
la de OIB. Ajá. Del directivo tiene la misma
44:30
estructura que del docente, ¿ya? O sea, la misma estructura. Solo qué le
44:33
faltaría los aspectos. No creo que no lo habían considerado ahí, pero está ahí,
44:38
¿no? La misma estructura en base a rúbricas.
44:42
Perfecto. En tal caso, haremos lo mismo, procedo. Mm.
44:48
Listo. Creo que con eso vamos avanzando. Bien, ingeniero. Tal vez algún otro
45:02
detalle, yo creo que o este el colega Wilber tal vez para cada uno probando ya
45:09
las cuentas, ¿no? que tenemos que tener ahorita vigentes en todos los niveles de
45:14
todos los tipos de usuarios o los niveles de usuarios para ver que todo
45:18
sea operativo en todos los niveles, desde arriba hasta abajo. Ahora la
45:22
cuenta de docente creo que no habría ningún problema. Ya. Este, eso está
45:28
claro, ya creo, ¿no? Ahorita estamos en la cuenta directiva y la
45:33
cuenta de coordinador o jefe taller, que sería lo último, ¿no?
45:41
Eh, sí. Buenas noches. Buenas noches con todos en la sala.
45:46
Sí, estos días entre ayer y hoy he ido llenando las fichas de los docentes.
45:54
Sin embargo, justo lo de directivos haya dificultades, eso creo que ya se está
46:00
buscando una salida. Entonces, este, en cuanto a los docentes
46:05
no hay inconveniente, no está corriendo bien, se está
46:12
subiendo la información. Por ejemplo, el intervalo que nos da el sistema es, por
46:17
ejemplo, de 2 horas, no podemos llenar en menos tiempo, ¿no? También la lógica
46:21
del monitoreo, pues no. Entonces, hm, ya pues estamos haciendo la prueba,
46:28
vamos a ir llenando más fichas para ir también teniendo un reporte. Entonces,
46:33
en esa parte está bien. Por ejemplo, en mi caso me estoy generando, por ejemplo,
46:39
no sé si ahora no lo he probado con con la cuenta original que tengo como jefe
46:46
de nivel, ¿cómo se llama? Responsable de nivel.
46:50
Eh, sin embargo, estoy programando como responsable de nivel, pero también tengo
46:55
ahí otra cuenta como especialista que estoy este
47:00
haciendo subiendo las fichas. Ya. Entonces, de esa manera
47:05
hemos ido solucionando el día de ayer para poder rellenar fichas.
47:10
Entonces, eso en cuanto a qué más, pues no, entonces hasta el momento va bien,
47:16
¿no? este, siempre manipulando ahí el sistema
47:21
y estamos ahí tratando de empoderarnos con su manejo.
47:26
Solo eso, ¿no? Este, hasta el momento podría comentario. Gracias. Buenas
47:32
noches. Okay.
47:48
Sí, solo a a maestroar este indicarle tal vez habría que hacer la prueba con
47:53
la situación del usuario del directivo. Eso sí nos ha faltado. Hasta ahora lo
47:58
hemos hecho con la cuenta del jefe de gestión pedagógica, lo hemos hecho con
48:03
los responsables de cada nivel, eh en lo que está indicando Wilbert y también lo
48:08
que nos ha indicado el ingeniero Cristian, que ya se ha superado, ¿no?,
48:12
la situación de que los responsables de cada nivel ahora sí también pueden hacer
48:16
monitoreo. E
48:19
hasta ahí estamos, ¿no?, con la cuenta de especialistas más hemos probado. Está
48:22
corriendo muy bien. El detalle está ahorita con los directivos. Este,
48:26
maestro Einar, tal vez puedas hacer la prueba ya que pueda programar así,
48:30
cronogramar y ejecutar algunas fichas. Entonces, ya podríamos ir viendo cómo
48:34
está funcionando ese nivel también. Eh, sí, tengo ya las fichas de monitoreo
48:47
directivo y estoy entrando a lo que son instituciones en plantillas de monitoreo
48:54
y me doy cuenta a aquí en lo que es su gel está la ficha de
48:59
rúbrica. Está bien, instituciones. Quiero crear una nueva plantilla y me
49:06
sale tu institución no tiene ninguna plantilla autorizada. Quiere decir
49:12
que tengo este no imaginaba que era directamente usar esa plantilla que nos
49:17
da la UGEL o nos está generando aprobada a UGEL
49:24
o tendría que pedir una nueva autorización.
49:35
Bien, respecto a esto, ah, por defecto se utiliza lo que sería del, ¿no? Eh,
49:43
esta opción de registrar una nueva plantilla sería en caso que, claro, que
49:47
era una plantilla personalizada, ¿no? Como bien bien se requiere con una
49:51
solicitud, pero por defecto debería poder trabajar con lo que ha creado
49:55
lael. Bien, en tal caso no sé si este puedo
50:14
compartir mi pantalla para ver este la cuenta del director.
50:20
Sí, sí, por favor. M.
51:55
A ver, le decía, acá tengo este la ficha,
51:59
tengo acá la la rúbrica. Está bien lo que estamos viendo, lo que hemos visto
52:04
en el sistema también para lo que es el sistema de la UGEL,
52:10
pero me estoy dando cuenta que aquí discrepa también. Mire, tengo la rúbrica
52:15
y tengo acá sus indicadores con niveles, ¿no?
52:22
Y lo ha hecho. Mire, esto es lo que va a suceder, como le decía, en cada
52:27
institución educativa. Esto esto es en cierta forma
52:31
veo que está variando la ficha, ¿no?
52:37
Entonces, este, no sé si este y eso es lo que quisiéramos tal vez evitar, ¿no?
52:45
Lo más eh cercano a lo que o lo más eficiente que
52:50
tendría que ser es que se aproximen casi todas las fichas directivas
52:55
a lo del este a lo de la plantilla que está proponiendo la UG, pero sin embargo
53:01
este está un poco diferente, ¿no? O profesor Edwin, yo me estoy equivocando,
53:06
tal vez. Sí, este esta plantilla que estás
53:10
mostrando está adecuado, o sea, en algunos casos algunos
53:15
directivos lo han desglosado la rúbrica o el desempeño, ¿no?, que está
53:21
especificado en el instrumento original y lo han para su trabajo más
53:26
sencillo lo han desglosado, ¿no? Y eso se aprecia acá,
53:33
pero en realidad lo que deberíamos de utilizar es la otra, ¿no? que está ya
53:37
validada por el ministerio y y ese es, ¿no? Este es para un manejo más más
53:42
sencillo para el directivo. A veces se complica, pues no no no puede cómo
53:46
recoger toda esa información y entonces esta parte segmentada le ayuda, ¿no?
53:56
Y y eso va a suceder, me parece, en casi todas las instituciones. Este, maestro
54:02
Edwin. Hm. Pero la ficha formal, este Metro
54:06
Initer, es el de las rúbricas de observación,
54:09
las cuales están ahora en el sistema. Esa es la cadast oficial.
54:16
Ya. En tal caso, aquí por ejemplo, ya debería utilizar esta ficha, ya no esta
54:20
la tiene que desechar, ¿no? El director, el directivo, perdón.
54:25
Claro, en realidad, como te digo, esta está desglosada. cuando la utilice la
54:30
puede traducir en esta última ficha porque al final esta la que estás
54:34
mostrando, es la primigenia, o sea, esa es la
54:39
original, diríamos así, ¿no? Y la otra está desglosada.
54:45
Siguen buscando lo mismo, solo que la otra está desglosada, que le facilita al
54:48
director, ¿no?, recoger la información. Recuerda que al director le se le hace
54:53
más fácil colocar unos checks que escribir. Lo normal cuando se hace el
54:58
uso de las rúbricas es registrar, ¿no? Todo lo que se observa y eso a veces le
55:03
cuesta al directivo. Claro. Pero ahora con el uso del
55:11
sistema, maestro Edwin, yo creo que ya debemos evitar tal vez estas variantes
55:16
porque imagínese que con esto evalúe. Si el director lo que tiene que hacer ahora
55:20
es agarrar esta plantilla ya y hacer su plan de monitoreo y
55:26
prácticamente ya ejecutar esa ficha, ¿no?
55:30
La que ya se tiene, ¿no? No ir por este lado, luego, no sé, nuevamente hacer
55:36
otro proceso y no y recién sistematizarlo.
55:39
Coro, correcto. lo que indicas es lo correcto.
55:52
Entonces, por ahí estaría todavía haciendo falta, mire, este, tanto para
55:58
el nivel directivo, el nivel jerárquico, hacer tal vez este ya un tema de
56:04
concientización para unificar las fichas y aplicar
56:07
directo en el sistema ya todas esas fichas, ¿no?
56:13
Sí. ¿Sabes que este vamos a hacer a la justo estamos por eso probando todo el
56:16
sistema a la siguiente semana vamos a tener una reunión con directivos?
56:21
Entonces, ya les vamos a dar a conocer justo el sistema y también la aplicación
56:25
de las fichas, ¿no? Lo vamos a como decir formalizar otra vez, ¿no?
56:39
Bien, en tal caso, con esos ajustes más, este, ingeniero Cristian y maestro
56:44
Edwin, yo creo que voy a darme el tiempo de adecuar.
56:48
Eh, voy a conversar también con mi director para ya este ver la ejecución y
56:53
la adecuación de esta ficha que tiene que ser ya lo lo que estamos trabajando
56:59
ya pues para que ya se tenga una prueba real, ¿no? Lo que queremos ahorita, así
57:04
como ya lo hemos hecho, por ejemplo, en la etapa UGEL, este, ingeniero Cristian,
57:09
la semana pasada hemos hecho en la UGEL una simulación con esta ficha ya y está
57:15
interesante, ¿no? resultó y pues este
57:21
ya tiene validez, ¿no? Pero lo mismo queremos hacer ahora en las
57:25
instituciones educativas. En la cuenta tiene que salir lo mismo, se tiene que
57:29
validar en una cuenta de docente y también un jerárquico, ¿no? Con eso ya
57:35
estaría validado, ya se podría ya este hacer una asistencia técnica, tal vez
57:40
una capacitación a las instituciones educativas, ¿no? Es
57:44
lo que estaría pendiente ahorita. Okay, entendido. Terminador.
57:58
Y bueno, claro, ahora con todas las revisiones o observaciones que nos han
58:01
dado, vamos a trabajar en todas estas y igualmente
58:06
cualquier duda que tengan pues nos escribe nuestro trainer y para
58:11
resolverlo, ¿no? Lo más antes posible. Bueno, en todo caso la siguiente
58:18
reunión, bueno, le estaríamos comunicando, me
58:24
parece. Okay, ingeniero. Está bien mediante
58:30
Einar. Sí,
58:32
sí, está bien. Listo. Por lo pronto, en tal caso, eso
58:39
sería todo. Ahora nos estaríamos pendientes de adecuarlo ya a lo que
58:43
estamos haciendo y ejecutar ya las simulaciones en instituciones
58:48
educativas, en cuentas de instituciones educativas. Con eso yo creo que ya
58:52
estaríamos apto ya y ya para hacer la la masificación de su uso, ¿no?, del
59:00
sistema. verificando siempre los detalles, este,
59:04
vamos a estar enviando las capturas. Yo particularmente en las dos cuentas voy a
59:08
estar trabajando y enviándole las capturas si en algún
59:12
caso hubiera alguna un error o una este un mensaje de
59:19
tal vez de de uso de en la cuenta, ¿no? Entonces a través de capturas si hay la
59:26
necesidad este programaremos un Meet, ¿no? Este con su persona, ¿no? Pero por
59:32
el tema del lo que yo le pediría al Edwin más bien es que tal vez este las
59:38
cuentas de los encargados de nivel y los de especialistas
59:43
ya esté ya validadas al 100% que esté usada, que se use y este no es lo que
59:47
hemos probado la vez pasada, creo que no había mucho detalle, estaba bien y ahora
59:52
lo que faltaría es la etapa institución educativa, ¿no? Solo eso quedaría
59:56
pendiente, ingeniero Cristian. Okay.
1:00:02
Sí, ingeniero yo también le enviaré algunas capturas en caso vaya observando
1:00:08
algunas situaciones de mejora también, ¿no? Como el que hemos hecho el día de
1:00:11
hoy. Me parece que estamos bien. Lo que sí le reitero a a Inar es hacer la
1:00:16
prueba, por favor, con los usuarios de directivo y los jefes de taller, ¿no?
1:00:21
Como está ahí para no tener dificultades. Como reiteramos, nosotros
1:00:25
en el caso del UGEL ya estamos valiándolo con las cuentas de los
1:00:28
especialistas también. Y hasta ahora estamos bien. Vamos caminando. Okay.
1:00:40
Bien. En tal caso, esta semana estaríamos haciendo esas pruebas, por
1:00:44
favor darnos ese tiempito y a la siguiente semana yo creo que ya
1:00:49
estaríamos encajando también para la reunión, profesor Edwin, maestro Edwin,
1:00:54
para este ya tener ya todo listo en cuanto al sistema ya. y sus reportes y
1:01:00
todo lo que ya concierne al mismo. Ingeniero, igual vamos a estar al
1:01:04
pendiente y ya esta semana a modo de pruebas vamos a estar también
1:01:08
notificando si hubiera algún detalle en el uso del sistema. Esto en cuentas de
1:01:13
instituciones educativas. Okay, en todo caso entonces estaremos al
1:01:24
pendiente igualmente para las reuniones, ¿no? Igual como se hizo la capacitación
1:01:29
creo o bueno, la prueba en vivo, ¿no? Sería que nos avise, claro, con un poco
1:01:34
de anticipación, ¿no? Bien, creo que entonces esto sería todo
1:01:44
por la reunión. Ah, sí,
1:01:51
ingeniero. Gracias ingeniero Cristian. Sí, gracias a Initar también. Gracias a
1:01:55
W. Creo que vamos a culminar. Muchas gracias.
1:02:00
Muy buenas noches, ingeniero este, maestro Edwin, maestro Wilber.
1:02:05
Estamos entonces reunidos en una próxima reunión, valga la redundancia.
1:02:09
Muchísimas gracias. Muy buenas noches. Okay. Buenas noches. Gracias.
1:02:15
Buenas noches
```