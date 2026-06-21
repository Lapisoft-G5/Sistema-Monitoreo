import { prisma } from './_lib/prisma.js';

/**
 * Cargos: director, subdirector, docente de aula, auxiliar, etc.
 * Se siembra ANTES de personas (los docentes requieren docente_cargo).
 *
 * Esta lista incluye TODOS los cargos validos del enum `CargoNombre` (backend)
 * para que el FK de `docente_cargos.cargo_id` siempre pueda satisfacerse cuando
 * un controller registra un DocenteCargo. Tambien incluye cargos secundarios
 * usados por las pantallas de registro historicas.
 */
const CARGOS = [
  'Director',
  'Subdirector',
  'Coordinador Pedagógico',
  'Docente de Aula',
  'Docente de Educacion Fisica',
  'Auxiliar de Educacion',
  'Jefe de Taller',
  'Coordinador de TOE',
  'Psicologo',
  'PIP',
];

export async function seedCargos() {
  console.log('[cargos] Seeding cargos...');
  const cargoMap = {};
  for (const nombre of CARGOS) {
    const cargo = await prisma.cargo.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    cargoMap[nombre] = cargo.id;
  }
  console.log(`[cargos] ${CARGOS.length} cargos listos.`);
  return cargoMap;
}
