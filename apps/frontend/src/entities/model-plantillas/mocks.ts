import type { Plantilla } from './model';

export const MOCK_PLANTILLAS: Plantilla[] = [
  {
    id: 'pl-docente-2023',
    tipoMonitoreo: 'Monitoreo Docente',
    anioAcademico: 2023,
    baremo: 'Vigente',
    fechaCreacion: '2023-03-12',
    estado: 'Vigente',
    descripcion: 'Ficha oficial de UGEL para evaluar el desempeño pedagógico y didáctico de docentes en aula para niveles de Inicial, Primaria y Secundaria (EBR).',
    creadoPorRole: 'jefe_gestion',
    niveles: [
      { nivel: 'I', denominacion: 'Muy Insatisfactorio', rangoMin: 0, color: '#ef4444' },
      { nivel: 'II', denominacion: 'En Proceso', rangoMin: 11, color: '#f59e0b' },
      { nivel: 'III', denominacion: 'Satisfactorio', rangoMin: 15, color: '#22c55e' },
      { nivel: 'IV', denominacion: 'Destacado', rangoMin: 18, color: '#3b82f6' },
    ],
    desempenos: [
      {
        id: 'd1',
        nombre: 'Involucra activamente a los estudiantes en el proceso de aprendizaje',
        descripcionCorta: 'Promueve el interés y la participación de los estudiantes en las actividades curriculares propuestas.',
        aspectos: [
          { id: 'a1_1', descripcion: 'Promueve el interés y motivación de los alumnos a través de actividades lúdicas o de aplicación real.' },
          { id: 'a1_2', descripcion: 'Brinda oportunidades equitativas de intervención y diálogo a todos los estudiantes de la sesión.' },
          { id: 'a1_3', descripcion: 'Adapta las estrategias y el ritmo de trabajo en aula de acuerdo a las necesidades y ritmos detectados.' }
        ],
        rubrica: [
          { nivel: 'I', descripcion: 'El docente no logra concitar la atención ni participación de los alumnos. Las actividades son monótonas y la mayoría se muestra pasivo o distraído.' },
          { nivel: 'II', descripcion: 'El docente intenta involucrar a los estudiantes, pero de manera inconsistente o superficial. Solo participan algunos alumnos de manera activa.' },
          { nivel: 'III', descripcion: 'El docente promueve activamente el interés. La gran mayoría de alumnos participa con entusiasmo y se mantiene enfocado en el aprendizaje.' },
          { nivel: 'IV', descripcion: 'El docente integra a todos de forma constante. Los estudiantes guían parte de las actividades, proponen ideas y asumen retos con alta autonomía.' }
        ]
      },
      {
        id: 'd2',
        nombre: 'Maximiza el tiempo dedicado al aprendizaje',
        descripcionCorta: 'Gestiona la duración de la sesión y las transiciones de manera óptima para evitar la pérdida del tiempo pedagógico.',
        aspectos: [
          { id: 'a2_1', descripcion: 'Comienza y cierra las actividades académicas respetando los tiempos pactados.' },
          { id: 'a2_2', descripcion: 'Implementa transiciones fluidas entre actividades individuales y grupales sin generar desorden.' },
          { id: 'a2_3', descripcion: 'Mantiene a los alumnos enfocados en tareas que aporten valor formativo directo.' }
        ],
        rubrica: [
          { nivel: 'I', descripcion: 'Se pierde más del 40% del tiempo de la sesión debido a desorganización administrativa, llamadas de atención o transiciones sumamente ineficaces.' },
          { nivel: 'II', descripcion: 'Hay retrasos recurrentes en el inicio de actividades. El aula tiene "tiempos muertos" de espera donde se pierde la continuidad pedagógica.' },
          { nivel: 'III', descripcion: 'El tiempo se aprovecha de forma eficiente. Las rutinas se ejecutan con agilidad, logrando cumplir los objetivos propuestos de la clase.' },
          { nivel: 'IV', descripcion: 'El tiempo es optimizado al máximo. Las actividades y dinámicas están perfectamente cronometradas y articuladas sin interrupciones.' }
        ]
      },
      {
        id: 'd3',
        nombre: 'Fomenta el razonamiento, la creatividad y el pensamiento crítico',
        descripcionCorta: 'Propone retos y preguntas que demandan análisis, argumentación e investigación, y no solo memorización.',
        aspectos: [
          { id: 'a3_1', descripcion: 'Plantea preguntas abiertas o situaciones problemáticas que exigen formular hipótesis.' },
          { id: 'a3_2', descripcion: 'Promueve que los estudiantes argumenten y justifiquen sus respuestas con bases lógicas.' },
          { id: 'a3_3', descripcion: 'Incentiva soluciones creativas u originales a problemas de la vida cotidiana.' }
        ],
        rubrica: [
          { nivel: 'I', descripcion: 'El docente solo promueve el copiado, la memorización o la repetición mecánica de información. No hay preguntas retadoras.' },
          { nivel: 'II', descripcion: 'El docente propone problemas pero guía excesivamente las respuestas, impidiendo que los alumnos analicen y razonen por cuenta propia.' },
          { nivel: 'III', descripcion: 'El docente conduce actividades donde los alumnos debaten, investigan y construyen sus propios argumentos de forma coherente.' },
          { nivel: 'IV', descripcion: 'El clima de aula estimula constantemente el debate reflexivo. Los alumnos cuestionan hipótesis, analizan fuentes y crean soluciones innovadoras colectivas.' }
        ]
      }
    ]
  },
  {
    id: 'pl-directivo-2023',
    tipoMonitoreo: 'Monitoreo Directivo',
    anioAcademico: 2023,
    baremo: 'Vigente',
    fechaCreacion: '2023-04-05',
    estado: 'Vigente',
    descripcion: 'Pauta de monitoreo al liderazgo pedagógico y la gestión de compromisos escolares (CGE 3, 4 y 5) orientada a la mejora continua del servicio educativo.',
    creadoPorRole: 'jefe_gestion',
    niveles: [
      { nivel: 'I', denominacion: 'Muy Insatisfactorio', rangoMin: 0, color: '#ef4444' },
      { nivel: 'II', denominacion: 'En Proceso', rangoMin: 11, color: '#f59e0b' },
      { nivel: 'III', denominacion: 'Satisfactorio', rangoMin: 15, color: '#22c55e' },
      { nivel: 'IV', denominacion: 'Destacado', rangoMin: 18, color: '#3b82f6' },
    ],
    desempenos: [
      {
        id: 'dd1',
        nombre: 'Planificación, Organización y Gestión de Condiciones Operativas (CGE 3)',
        descripcionCorta: 'Evalúa el liderazgo del director en la consolidación de los instrumentos de gestión institucional y comités.',
        aspectos: [
          { id: 'ad1_1', descripcion: 'Cuenta con PEI, PAT, PCI y Reglamento Interno (RI) vigentes, aprobados por RD y socializados.' },
          { id: 'ad1_2', descripcion: 'Lidera la conformación e inscripción oportuna de los Comités de Gestión Escolar en los plazos previstos.' },
          { id: 'ad1_3', descripcion: 'Planifica y ejecuta eficientemente el presupuesto asignado de mantenimiento preventivo de locales escolares.' }
        ],
        rubrica: [
          { nivel: 'I', descripcion: 'Los documentos de gestión están desactualizados desde hace años y el director no muestra iniciativas para su actualización o validación con el CONEI.' },
          { nivel: 'II', descripcion: 'Existen borradores de documentos pero sin aprobación formal ni articulación. Los comités están conformados solo en papel, sin reuniones efectivas.' },
          { nivel: 'III', descripcion: 'Los instrumentos están vigentes, aprobados y guían adecuadamente las metas anuales. Los comités operan y registran actas de trabajo regulares.' },
          { nivel: 'IV', descripcion: 'La planificación es participativa y con evaluación trimestral de metas físicas. Los comités colideran proyectos institucionales de alto impacto.' }
        ]
      },
      {
        id: 'dd2',
        nombre: 'Liderazgo Pedagógico, Acompañamiento y Monitoreo Docente (CGE 4)',
        descripcionCorta: 'Mide la gestión del director sobre el fortalecimiento de capacidades docentes mediante visitas a aula.',
        aspectos: [
          { id: 'ad2_1', descripcion: 'Elabora y ejecuta el plan de monitoreo docente anual, registrando visitas a aula.' },
          { id: 'ad2_2', descripcion: 'Desarrolla reuniones de reflexión pedagógica y círculos de interaprendizaje (GIA) a partir del consolidado del monitoreo.' },
          { id: 'ad2_3', descripcion: 'Brinda retroalimentación formativa inmediata a los docentes tras la observación de su sesión.' }
        ],
        rubrica: [
          { nivel: 'I', descripcion: 'No se realiza ningún tipo de monitoreo pedagógico ni de acompañamiento formativo a los docentes de la institución en el año.' },
          { nivel: 'II', descripcion: 'Se realiza monitoreo superficial sin plan formalizado ni registro de retroalimentación constructiva para el equipo docente.' },
          { nivel: 'III', descripcion: 'Se cumple con al menos 2 visitas de monitoreo anuales a cada docente, sistematizando debilidades y acordando planes de mejora pedagógica.' },
          { nivel: 'IV', descripcion: 'Ejecuta un robusto plan de acompañamiento con asesoría personalizada continua y evaluación de impacto en el rendimiento estudiantil.' }
        ]
      },
      {
        id: 'dd3',
        nombre: 'Gestión del Clima Institucional y la Convivencia Escolar (CGE 5)',
        descripcionCorta: 'Monitorea las acciones de prevención, reporte y atención de la violencia escolar, promoviendo la inclusión.',
        aspectos: [
          { id: 'ad3_1', descripcion: 'Cuenta con las Normas de Convivencia Escolar elaboradas participativamente, aprobadas y difundidas.' },
          { id: 'ad3_2', descripcion: 'Reporta, registra y atiende de manera diligente y según protocolo todo caso de violencia escolar en el portal SíseVe.' },
          { id: 'ad3_3', descripcion: 'Promueve espacios democráticos y de participación estudiantil (Municipio Escolar, fiscalías escolares, etc.).' }
        ],
        rubrica: [
          { nivel: 'I', descripcion: 'No existe plan de convivencia escolar. Los casos de violencia física, verbal o acoso se ignoran o se manejan de manera inadecuada.' },
          { nivel: 'II', descripcion: 'Se tienen las normas redactadas pero archivadas. Hay inacción o demoras extremas al registrar e intervenir ante incidentes de violencia.' },
          { nivel: 'III', descripcion: 'Se aplican las normas de convivencia activa, con registro oportuno y seguimiento a los protocolos sectoriales de atención a la violencia.' },
          { nivel: 'IV', descripcion: 'Se goza de un excelente clima institucional. Se desarrollan programas preventivos innovadores liderados por estudiantes y familias.' }
        ]
      }
    ]
  }
];
