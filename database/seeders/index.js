import { prisma, disconnect } from './_lib/prisma.js';
import { seedCatalogos } from './catalogos.js';
import { seedAuth } from './auth.js';
import { seedCargos } from './cargos.js';
import { seedInstituciones } from './instituciones.js';
import { seedPersonas } from './personas.js';
import { seedMonitoring } from './monitoring.js';
import { seedScheduling } from './scheduling.js';

/**
 * Orquestador del seeder. Ejecuta los modulos en orden de dependencias:
 * 1. Migraciones legacy (director_ie → director_institucion)
 * 2. Catalogos transversales (modalidades, niveles, especialidades, cursos)
 * 3. Auth (roles, permisos)
 * 4. Cargos
 * 5. Instituciones educativas
 * 6. Personas / Usuarios / Especialistas / Docentes
 * 7. Monitoring (planes + plantillas)
 * 8. Scheduling (cronograma)
 */

async function migrateLegacyRoles() {
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE roles SET codigo = 'director_institucion' WHERE codigo = 'director_ie'`,
    );
    console.log('[legacy] Rol director_ie migrado a director_institucion.');
  } catch (err) {
    console.log('[legacy] director_ie ya migrado o no existe:', err.message);
  }
}

async function main() {
  console.log('=== Sistema de Monitoreo - Seeder ===\n');

  await migrateLegacyRoles();

  const { nivelMap, cursoMap } = await seedCatalogos();
  const { roleMap } = await seedAuth();
  const cargoMap = await seedCargos();
  const { instMap } = await seedInstituciones();

  await seedPersonas({ roleMap, cargoMap, instMap, nivelMap, cursoMap });

  const { planUgelId } = await seedMonitoring({ instMap });
  await seedScheduling({ planUgelId });

  console.log('\n=== Seeding completado ===');
  console.log('Credenciales: el DNI es la contrasena inicial (usuarios en isFirstLogin=true).');
  console.log('Usuarios creados:');
  console.log('  admin        → DNI: 40000001  (Carlos Mendoza Quispe)');
  console.log('  jefe_gestion → DNI: 40000002  (Maria Elena Huaman Vargas)');
  console.log('  jefe_area    → DNI: 40000003  (Jose Luis Quispe Mamani)');
  console.log('  especialista → DNI: 40000004  (Ana Lucia Ticona Coila)');
  console.log('  especialista → DNI: 40000005  (Pedro Pablo Mamani Cruz)');
  console.log('  director_ie  → DNI: 40000006  (Rosa Maria Apaza Condori)');
  console.log('  director_ie  → DNI: 40000007  (Juan Carlos Choque Huaranca)');
  console.log('  docente      → DNI: 40000008-40000012  (varios)');
}

main()
  .catch((e) => {
    console.error('Error en seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnect();
  });
