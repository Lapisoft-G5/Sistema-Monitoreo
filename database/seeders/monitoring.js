import { prisma } from './_lib/prisma.js';
import { randomUUID } from 'node:crypto';

/**
 * Sprint 3: planes de monitoreo y plantillas de monitoreo.
 *
 * - Plan UGEL: autoria jefe_gestion, cobertura para todas las IEs
 * - Plan IE: autoria director, cobertura limitada a su institucion
 * - Plantilla DOCENTE con 3 desempenos reales (Involucra, Maximiza, Fomenta)
 * - Plantilla DIRECTIVO con 2 desempenos basados en CGE 3 y CGE 4
 */

const DESEMPENOS_DOCENTE = [
  {
    nombre: 'Involucra activamente a los estudiantes en el proceso de aprendizaje',
    descripcionCorta: 'Promueve el interes y la participacion activa.',
    aspectos: [
      'Promueve el interes y motivacion de los alumnos.',
      'Brinda oportunidades equitativas de intervencion.',
      'Adapta estrategias segun necesidades detectadas.',
    ],
  },
  {
    nombre: 'Maximiza el tiempo dedicado al aprendizaje',
    descripcionCorta: 'Gestiona la sesion evitando tiempos muertos.',
    aspectos: [
      'Comienza y cierra actividades respetando tiempos.',
      'Transiciones fluidas entre actividades.',
    ],
  },
  {
    nombre: 'Fomenta el razonamiento y pensamiento critico',
    descripcionCorta: 'Propone retos que exigen analisis.',
    aspectos: [
      'Plantea preguntas abiertas y problematicas.',
      'Promueve argumentacion con bases logicas.',
    ],
  },
];

const DESEMPENOS_DIRECTIVO = [
  { nombre: 'Planificacion y gestion de condiciones operativas (CGE 3)', descripcionCorta: 'Consolidacion de instrumentos de gestion.' },
  { nombre: 'Liderazgo pedagogico y acompanamiento docente (CGE 4)', descripcionCorta: 'Fortalecimiento de capacidades mediante visitas.' },
];

const NIVELES_BASE = [
  { nivelRomano: 'I', denominacion: 'Muy Insatisfactorio', rangoMin: 0, color: '#ef4444', orden: 1 },
  { nivelRomano: 'II', denominacion: 'En Proceso', rangoMin: 11, color: '#f59e0b', orden: 2 },
  { nivelRomano: 'III', denominacion: 'Satisfactorio', rangoMin: 15, color: '#22c55e', orden: 3 },
  { nivelRomano: 'IV', denominacion: 'Destacado', rangoMin: 18, color: '#3b82f6', orden: 4 },
];

export async function seedMonitoring(ctx) {
  console.log('[monitoring] Seeding planes de monitoreo...');

  const jefeGestion = await prisma.usuario.findFirst({ where: { rol: { codigo: 'jefe_gestion' } } });
  const directorIe = await prisma.usuario.findFirst({ where: { rol: { codigo: 'director_institucion' } } });
  const primeraIe = await prisma.institucionEducativa.findFirst();

  const findOrCreatePlan = async (where, create) => {
    const existing = await prisma.planMonitoreo.findFirst({ where });
    if (existing) return existing;
    return prisma.planMonitoreo.create({ data: { id: randomUUID(), ...create } });
  };

  let planUgelId = null;
  if (jefeGestion) {
    const plan = await findOrCreatePlan(
      { titulo: 'Plan Anual de Monitoreo UGEL Lampa 2026', anioAcademico: 2026, tipoEntidad: 'UGEL', deleted: false },
      {
        titulo: 'Plan Anual de Monitoreo UGEL Lampa 2026',
        anioAcademico: 2026,
        tipoEntidad: 'UGEL',
        archivoUrl: '/uploads/planes/plan-ugel-2026-seed.pdf',
        estado: 'Activo',
        autorId: jefeGestion.id,
        rolAutorAlCrear: 'jefe_gestion',
        institucionId: null,
        deleted: false,
      },
    );
    planUgelId = plan.id;
    console.log(`  Plan UGEL 2026: ${plan.id}`);
  }

  if (directorIe && primeraIe) {
    const plan = await findOrCreatePlan(
      { titulo: 'Plan de Monitoreo IE 2026', anioAcademico: 2026, tipoEntidad: 'IE', deleted: false },
      {
        titulo: 'Plan de Monitoreo IE 2026',
        anioAcademico: 2026,
        tipoEntidad: 'IE',
        archivoUrl: '/uploads/planes/plan-ie-2026-seed.pdf',
        estado: 'Activo',
        autorId: directorIe.id,
        rolAutorAlCrear: 'director_institucion',
        institucionId: primeraIe.id,
        deleted: false,
      },
    );
    const coberturaExistente = await prisma.planCoberturaIe.findFirst({
      where: { planId: plan.id, institucionId: primeraIe.id },
    });
    if (!coberturaExistente) {
      await prisma.planCoberturaIe.create({
        data: { id: randomUUID(), planId: plan.id, institucionId: primeraIe.id },
      });
    }
    console.log(`  Plan IE 2026: ${plan.id}`);
  }

  console.log('[monitoring] Seeding plantillas de monitoreo...');

  if (jefeGestion) {
    await seedPlantilla({
      jefeGestionId: jefeGestion.id,
      tipoMonitoreo: 'DOCENTE',
      desempenos: DESEMPENOS_DOCENTE,
      descripcion: 'Ficha oficial UGEL para evaluacion docente 2026 (seed).',
    });
    await seedPlantilla({
      jefeGestionId: jefeGestion.id,
      tipoMonitoreo: 'DIRECTIVO',
      desempenos: DESEMPENOS_DIRECTIVO.map((d) => ({
        ...d,
        aspectos: ['Cumple con el primer criterio clave.', 'Cumple con el segundo criterio clave.'],
      })),
      descripcion: 'Ficha oficial UGEL para evaluacion directivo 2026 (seed).',
    });
  }

  return { planUgelId };
}

async function seedPlantilla(args) {
  const { jefeGestionId, tipoMonitoreo, desempenos, descripcion } = args;
  const existente = await prisma.plantillaMonitoreo.findFirst({
    where: { tipoMonitoreo, anioAcademico: 2026, version: 1 },
  });
  if (existente) {
    console.log(`  Plantilla ${tipoMonitoreo} ya existe (${existente.id})`);
    return;
  }

  const nivelesIds = {};
  for (const n of NIVELES_BASE) {
    nivelesIds[n.nivelRomano] = randomUUID();
  }

  const plantilla = await prisma.plantillaMonitoreo.create({
    data: {
      id: randomUUID(),
      tipoMonitoreo,
      anioAcademico: 2026,
      version: 1,
      baremo: 'Vigente',
      descripcion,
      estado: 'Vigente',
      autorId: jefeGestionId,
      rolAutorAlCrear: 'jefe_gestion',
      institucionId: null,
      nivelesCalificacion: {
        create: NIVELES_BASE.map((n) => ({ id: nivelesIds[n.nivelRomano], ...n })),
      },
    },
  });
  console.log(`  Plantilla ${tipoMonitoreo}: ${plantilla.id}`);

  for (const [idx, d] of desempenos.entries()) {
    const desempeno = await prisma.desempenoPlantilla.create({
      data: {
        id: randomUUID(),
        plantillaId: plantilla.id,
        nombre: d.nombre,
        descripcionCorta: d.descripcionCorta,
        orden: idx + 1,
        aspectos: {
          create: d.aspectos.map((a, i) => ({ id: randomUUID(), descripcion: a, orden: i + 1 })),
        },
      },
    });
    for (const nivel of ['I', 'II', 'III', 'IV']) {
      await prisma.rubricaNivel.create({
        data: {
          id: randomUUID(),
          desempenoId: desempeno.id,
          nivelCalificacionId: nivelesIds[nivel],
          descripcion: `Nivel ${nivel}: comportamiento observado para "${d.nombre.substring(0, 40)}".`,
        },
      });
    }
  }
  console.log(`  ${desempenos.length} desempenos ${tipoMonitoreo.toLowerCase()} creados con rubricas.`);
}
