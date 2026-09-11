import { prisma, disconnect } from './_lib/prisma.js';
import { seedUgeles } from './ugeles.js';
import { seedCatalogos } from './catalogos.js';
import { seedAuth } from './auth.js';
import { seedCargos } from './cargos.js';
import { seedInstituciones } from './instituciones.js';
import { seedPersonas } from './personas.js';
import { seedMonitoring } from './monitoring.js';
import { seedScheduling } from './scheduling.js';
import { seedAnalisisDemo } from './analisis-demo.js';
import { seedIeSecundariaDemo } from './ie-secundaria-demo.js';

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

const isProduction =
  process.env.SEED_MODE === 'production' ||
  process.env.SEED_MODE === 'prod' ||
  process.env.NODE_ENV === 'production' ||
  process.argv.includes('--production') ||
  process.argv.includes('--prod');

async function main() {
  console.log(`=== Sistema de Monitoreo - Seeder [${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}] ===\n`);

  await migrateLegacyRoles();

  const { ugel } = await seedUgeles();
  const { nivelMap, cursoMap } = await seedCatalogos();
  const { roleMap } = await seedAuth();
  const cargoMap = await seedCargos();
  const { instMap } = await seedInstituciones();

  await seedPersonas({ roleMap, cargoMap, instMap, nivelMap, cursoMap, isProduction });

  if (!isProduction) {
    const { planUgelId } = await seedMonitoring({ instMap, isProduction });
    await seedScheduling({ planUgelId });
    await seedAnalisisDemo();
    await seedIeSecundariaDemo();

    console.log('\n=== Seeding DESARROLLO completado (con datos demo para pruebas locales) ===');
    console.log('Credenciales: el DNI es la contraseña inicial (usuarios en isFirstLogin=true).');
    console.log('Usuarios Demo de Prueba:');
    console.log('  director_ugel        → DNI: 40000001');
    console.log('  jefe_gestion         → DNI: 40000002');
    console.log('  jefe_area            → DNI: 40000003 (Sec.), 40000004 (Prim.), 40000005 (Inic.)');
    console.log('  especialistas        → DNI: 40000006 - 40000009, 40000100, 40000101');
    console.log('Superadministrador:');
    console.log('  superusuario         → DNI: ' + (process.env.SUPERADMIN_DNI || '00000000'));
    console.log('Usuarios AGP reales:');
    console.log('  director_ugel        → 01211704 (Edwin Ernesto Chayña Gonzales)');
    console.log('  jefe_gestion         → 01296539 (Edwin Leonet Figueroa Quispe)');
    console.log('  jefe_area (Inicial)  → 01545149 (Olga Mercedes Huaraya Quispe)');
    console.log('  jefe_area (Primaria) → 80157677 (Wilver Dueñas Gutierrez)');
    console.log('  jefe_area (Secund.)  → 29560307 (Godofredo Mamani Quispe)');
    console.log('  secretaria (invitado)→ 70146942 (Milagros Molina Torres)');
  } else {
    console.log('\n=== Seeding PRODUCCIÓN completado con éxito ===');
    console.log('Base de datos inicializada LIMPIA para operación en producción:');
    console.log('  ✔ Super Administrador configurado (DNI: ' + (process.env.SUPERADMIN_DNI || '00000000') + ')');
    console.log('  ✔ Directorio Oficial AGP UGEL Lampa (14 funcionarios)');
    console.log('  ✔ Padrón Oficial de II.EE. (225 instituciones ESCALE)');
    console.log('  ✔ Padrón Oficial NEXUS (Directores y Docentes reales)');
    console.log('  ✔ 0 cuentas de prueba / demo');
    console.log('  ✔ 0 planes o plantillas simuladas (se crearán oficialmente desde el sistema)');
    console.log('  ✔ 0 visitas o evaluaciones simuladas');
  }
}

main()
  .catch((e) => {
    console.error('Error en seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnect();
  });
