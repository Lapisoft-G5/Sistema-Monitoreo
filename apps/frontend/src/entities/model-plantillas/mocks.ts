import type { Plantilla } from './model';
import { NIVELES_DEFAULT } from './constants';

export const MOCK_PLANTILLAS: Plantilla[] = [
  {
    id: 'plt-1',
    tipoMonitoreo: 'Monitoreo Docente',
    anioAcademico: 2024,
    baremo: 'Vigente',
    niveles: NIVELES_DEFAULT,
    desempenos: [
      {
        id: 'd-1',
        nombre: 'Involucra activamente a los estudiantes en el proceso de aprendizaje',
        descripcionCorta: 'Promueve el interés y la participación de los estudiantes.',
        aspectos: [
          { id: 'a-1', descripcion: 'Acciones del docente para promover el interés' },
          { id: 'a-2', descripcion: 'Proporción de estudiantes involucrados' },
        ],
        rubrica: [
          { nivel: 'I', descripcion: 'No logra involucrar a los estudiantes.' },
          { nivel: 'II', descripcion: 'Involucra a algunos estudiantes.' },
          { nivel: 'III', descripcion: 'Involucra a la mayoría de estudiantes.' },
          { nivel: 'IV', descripcion: 'Involucra activamente a todos los estudiantes.' },
        ],
      },
    ],
    fechaCreacion: '2024-03-01',
  },
];
