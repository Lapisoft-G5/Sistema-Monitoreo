import '../../apps/backend/node_modules/dotenv/config.js';
import { PrismaClient } from '../../apps/backend/src/generated/prisma/client.js';
import { PrismaPg } from '../../apps/backend/node_modules/@prisma/adapter-pg/dist/index.js';
import bcrypt from '../../apps/backend/node_modules/bcrypt/bcrypt.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const MOCK_ROLES = [
  { code: 'director_ugel', name: 'Director UGEL', description: 'Director de la UGEL Lampa' },
  { code: 'jefe_area', name: 'Jefe de Área', description: 'Jefe de Área de la UGEL' },
  { code: 'jefe_gestion', name: 'Jefe de Gestión', description: 'Jefe de Gestión de la UGEL Lampa' },
  { code: 'especialista', name: 'Especialista', description: 'Especialista de Monitoreo de la UGEL' },
  { code: 'director_institucion', name: 'Director de Institución', description: 'Director de Institución Educativa' },
  { code: 'docente', name: 'Docente', description: 'Docente de Aula' },
  { code: 'invitado', name: 'Invitado', description: 'Usuario de Consulta e Invitado' },
];

const MOCK_USERS = [
  {
    dni: '76358911',
    email: 'carlos.quispe@ugel-lampa.gob.pe',
    firstName: 'Carlos Alberto',
    lastName: 'Quispe Mamani',
    role: 'director_ugel',
  },
  {
    dni: '45678901',
    email: 'juan.perez@ugel-lampa.gob.pe',
    firstName: 'Juan',
    lastName: 'Pérez López',
    role: 'jefe_area',
  },
  {
    dni: '32145678',
    email: 'maria.gomez@ugel-lampa.gob.pe',
    firstName: 'María',
    lastName: 'Gómez Ticona',
    role: 'jefe_gestion',
  },
  {
    dni: '12345678',
    email: 'pedro.huanca@ugel-lampa.gob.pe',
    firstName: 'Pedro',
    lastName: 'Huanca Flores',
    role: 'especialista',
    especialidad: 'Matemática',
    nivelEducativo: 'Secundaria',
  },
  {
    dni: '12312312',
    email: 'alberto.condori@ugel-lampa.gob.pe',
    firstName: 'Alberto',
    lastName: 'Condori Ccallo',
    role: 'especialista',
    especialidad: 'Comunicación',
    nivelEducativo: 'Primaria',
  },
  {
    dni: '45645645',
    email: 'sofia.vargas@ugel-lampa.gob.pe',
    firstName: 'Sofía Lorena',
    lastName: 'Vargas Paredes',
    role: 'especialista',
    especialidad: 'Educación Inicial',
    nivelEducativo: 'Inicial',
  },
  {
    dni: '87654321',
    email: 'carlos.ruiz@ie-huayta.edu.pe',
    firstName: 'Carlos',
    lastName: 'Ruiz Condori',
    role: 'director_institucion',
    institucionCodigoModular: '0543210',
  },
  {
    dni: '11223344',
    email: 'rosa.mamani@ie-huayta.edu.pe',
    firstName: 'Rosa',
    lastName: 'Mamani Ccopa',
    role: 'docente',
    institucionCodigoModular: '0543210',
    curso: 'Matemática',
    secciones: [{ grado: '1°', seccion: 'A' }, { grado: '1°', seccion: 'B' }],
  },
  {
    dni: '11223355',
    email: 'elena.flores@ie-huayta.edu.pe',
    firstName: 'Elena',
    lastName: 'Flores Apaza',
    role: 'docente',
    institucionCodigoModular: '0543210',
    curso: 'Comunicación',
    secciones: [{ grado: '2°', seccion: 'A' }],
  },
  {
    dni: '88887777',
    email: 'raul.ticona@ie-lampa.edu.pe',
    firstName: 'Raúl',
    lastName: 'Ticona Quispe',
    role: 'director_institucion',
    institucionCodigoModular: '0123456',
  },
  {
    dni: '22334455',
    email: 'lucia.mendoza@ie-lampa.edu.pe',
    firstName: 'Lucía',
    lastName: 'Mendoza Torres',
    role: 'docente',
    institucionCodigoModular: '0123456',
    curso: 'Personal Social',
    secciones: [{ grado: '3°', seccion: 'A' }, { grado: '4°', seccion: 'A' }],
  },
  {
    dni: '55556666',
    email: 'miguel.paredes@ie-agro.edu.pe',
    firstName: 'Miguel Ángel',
    lastName: 'Paredes Larico',
    role: 'director_institucion',
    institucionCodigoModular: '0712345',
  },
  {
    dni: '33445566',
    email: 'gladys.apaza@ie-agro.edu.pe',
    firstName: 'Gladys',
    lastName: 'Apaza Choque',
    role: 'docente',
    institucionCodigoModular: '0712345',
    curso: 'Ciencia y Tecnología',
    secciones: [{ grado: '5°', seccion: 'A' }, { grado: '5°', seccion: 'B' }],
  },
  {
    dni: '99887766',
    email: 'visitante.demo@ugel-lampa.gob.pe',
    firstName: 'Visitante',
    lastName: 'Demo',
    role: 'invitado',
  },
];

const MOCK_CARGOS = [
  { nombre: 'Director' },
  { nombre: 'Subdirector' },
  { nombre: 'Coordinador Pedagógico' },
  { nombre: 'Docente de Aula' },
  { nombre: 'Jefe de Taller' },
  { nombre: 'PIP' },
];

const MOCK_CURSOS = [
  // 1. Educación Inicial
  { nombre: 'Personal Social', nivelEducativo: 'Inicial', modalidad: 'EBR' },
  { nombre: 'Psicomotricidad', nivelEducativo: 'Inicial', modalidad: 'EBR' },
  { nombre: 'Comunicación', nivelEducativo: 'Inicial', modalidad: 'EBR' },
  { nombre: 'Descubrimiento del Mundo', nivelEducativo: 'Inicial', modalidad: 'EBR' },

  // 2. Educación Primaria
  { nombre: 'Comunicación', nivelEducativo: 'Primaria', modalidad: 'EBR' },
  { nombre: 'Matemática', nivelEducativo: 'Primaria', modalidad: 'EBR' },
  { nombre: 'Ciencia y Tecnología', nivelEducativo: 'Primaria', modalidad: 'EBR' },
  { nombre: 'Personal Social', nivelEducativo: 'Primaria', modalidad: 'EBR' },
  { nombre: 'Arte y Cultura', nivelEducativo: 'Primaria', modalidad: 'EBR' },
  { nombre: 'Educación Física', nivelEducativo: 'Primaria', modalidad: 'EBR' },
  { nombre: 'Educación Religiosa', nivelEducativo: 'Primaria', modalidad: 'EBR' },

  // 3. Educación Secundaria
  { nombre: 'Comunicación', nivelEducativo: 'Secundaria', modalidad: 'EBR' },
  { nombre: 'Matemática', nivelEducativo: 'Secundaria', modalidad: 'EBR' },
  { nombre: 'Ciencia y Tecnología', nivelEducativo: 'Secundaria', modalidad: 'EBR' },
  { nombre: 'Desarrollo Personal, Ciudadanía y Cívica', nivelEducativo: 'Secundaria', modalidad: 'EBR' },
  { nombre: 'Ciencias Sociales', nivelEducativo: 'Secundaria', modalidad: 'EBR' },
  { nombre: 'Educación Física', nivelEducativo: 'Secundaria', modalidad: 'EBR' },
  { nombre: 'Arte y Cultura', nivelEducativo: 'Secundaria', modalidad: 'EBR' },
  { nombre: 'Inglés', nivelEducativo: 'Secundaria', modalidad: 'EBR' },
  { nombre: 'Educación Religiosa', nivelEducativo: 'Secundaria', modalidad: 'EBR' },
  { nombre: 'Educación para el Trabajo', nivelEducativo: 'Secundaria', modalidad: 'EBR' },
];

const MOCK_INSTITUCIONES = [
  {
    codigoModular: '0543210',
    codigoLocal: '08765432',
    nombre: 'I.E. Huayta',
    nivelEducativo: 'Secundaria',
    modalidad: 'EBR',
    departamento: 'Puno',
    provincia: 'Lampa',
    distrito: 'Lampa',
    direccion: 'Jr. Bolognesi 123',
    zona: 'Rural',
    estado: 'Activa',
  },
  {
    codigoModular: '0123456',
    codigoLocal: '02345678',
    nombre: 'I.E. 70025 Lampa',
    nivelEducativo: 'Primaria',
    modalidad: 'EBR',
    departamento: 'Puno',
    provincia: 'Lampa',
    distrito: 'Lampa',
    direccion: 'Av. Panamericana 456',
    zona: 'Urbana',
    estado: 'Activa',
  },
  {
    codigoModular: '0654321',
    codigoLocal: '09876543',
    nombre: 'I.E. Inicial Lampa',
    nivelEducativo: 'Inicial',
    modalidad: 'EBR',
    departamento: 'Puno',
    provincia: 'Lampa',
    distrito: 'Lampa',
    direccion: 'Jr. Puno 789',
    zona: 'Urbana',
    estado: 'Activa',
  },
  {
    codigoModular: '0712345',
    codigoLocal: '05123456',
    nombre: 'I.E. Agroindustrial Pucará',
    nivelEducativo: 'Secundaria',
    modalidad: 'EBR',
    departamento: 'Puno',
    provincia: 'Lampa',
    distrito: 'Pucará',
    direccion: 'Jr. Lima s/n',
    zona: 'Rural',
    estado: 'Activa',
  }
];

const MOCK_PERMISOS = [
  { codigo: 'especialistas:read', nombre: 'Leer Especialistas', descripcion: 'Permite listar y ver detalles de especialistas' },
  { codigo: 'especialistas:write', nombre: 'Gestionar Especialistas', descripcion: 'Permite crear, editar e inactivar especialistas' },
  { codigo: 'instituciones:read', nombre: 'Leer Instituciones', descripcion: 'Permite listar y ver detalles de instituciones' },
  { codigo: 'instituciones:write', nombre: 'Gestionar Instituciones', descripcion: 'Permite crear, editar y dar de baja instituciones' },
  { codigo: 'docentes:read', nombre: 'Leer Docentes', descripcion: 'Permite listar y ver detalles de docentes' },
  { codigo: 'docentes:write', nombre: 'Gestionar Docentes', descripcion: 'Permite registrar, editar y dar de baja docentes' },
  { codigo: 'dashboard:read', nombre: 'Ver Dashboard', descripcion: 'Permite visualizar el panel de control y estadísticas' },
  { codigo: 'reports:read', nombre: 'Ver Reportes', descripcion: 'Permite visualizar reportes del sistema' },
  { codigo: 'reports:own', nombre: 'Ver Reportes Propios', descripcion: 'Permite al docente visualizar sus propios reportes' },
  { codigo: 'jefes_area:write', nombre: 'Gestionar Jefes de Área', descripcion: 'Permite crear, editar y dar de baja jefes de área' },
  { codigo: 'directores:write', nombre: 'Gestionar Directores', descripcion: 'Permite registrar, editar y dar de baja directores de IE' },
  { codigo: 'monitoreo:execute', nombre: 'Realizar Monitoreo', descripcion: 'Permite ejecutar y registrar fichas de monitoreo' },
];

const MOCK_ROL_PERMISOS = {
  director_ugel: ['dashboard:read', 'reports:read'],
  jefe_gestion: ['especialistas:read', 'especialistas:write', 'jefes_area:write', 'monitoreo:execute', 'reports:read'],
  jefe_area: [
    'directores:write', 
    'instituciones:read', 
    'instituciones:write',
    'docentes:read',
    'docentes:write',
  ],
  especialista: ['monitoreo:execute', 'reports:read'],
  director_institucion: ['docentes:read', 'docentes:write', 'reports:read'],
  docente: ['reports:own'],
  invitado: [],
};

async function main() {
  console.log('Starting database seeding (3NF)...');

  // 1. Seed Roles
  console.log('Seeding roles...');

  try {
    await prisma.$executeRawUnsafe(`UPDATE roles SET codigo = 'director_institucion' WHERE codigo = 'director_ie'`);
    console.log('Migrated old director_ie role to director_institucion.');
  } catch (err) {
    console.log('Could not migrate director_ie role:', err.message);
  }

  const roleMap = {};
  for (const roleData of MOCK_ROLES) {
    const role = await prisma.role.upsert({
      where: { codigo: roleData.code },
      update: {
        nombre: roleData.name,
        descripcion: roleData.description,
      },
      create: {
        codigo: roleData.code,
        nombre: roleData.name,
        descripcion: roleData.description,
      },
    });
    roleMap[roleData.code] = role.id;
  }
  console.log('Roles seeded successfully.');

  // 1b. Seed Permisos
  console.log('Seeding permisos...');
  const permisoMap = {};
  for (const perm of MOCK_PERMISOS) {
    const dbPerm = await prisma.permiso.upsert({
      where: { codigo: perm.codigo },
      update: {
        nombre: perm.nombre,
        descripcion: perm.descripcion,
      },
      create: {
        codigo: perm.codigo,
        nombre: perm.nombre,
        descripcion: perm.descripcion,
      },
    });
    permisoMap[perm.codigo] = dbPerm.id;
  }
  console.log('Permisos seeded successfully.');

  // 1c. Seed RolPermisos
  console.log('Seeding rol_permisos...');
  for (const [roleCode, permCodigos] of Object.entries(MOCK_ROL_PERMISOS)) {
    const rolId = roleMap[roleCode];
    if (!rolId) continue;
    
    for (const permCodigo of permCodigos) {
      const permisoId = permisoMap[permCodigo];
      if (!permisoId) continue;

      await prisma.rolPermiso.upsert({
        where: {
          rolId_permisoId: {
            rolId,
            permisoId,
          },
        },
        update: {},
        create: {
          rolId,
          permisoId,
        },
      });
    }
  }
  console.log('RolPermisos seeded successfully.');

  // 2. Seed Cargos
  console.log('Seeding cargos...');
  const cargoMap = {};
  for (const cargoData of MOCK_CARGOS) {
    const cargo = await prisma.cargo.upsert({
      where: { nombre: cargoData.nombre },
      update: {},
      create: {
        nombre: cargoData.nombre,
      },
    });
    cargoMap[cargoData.nombre] = cargo.id;
  }
  console.log('Cargos seeded successfully.');

  // 3. Seed Cursos
  console.log('Seeding cursos...');
  const cursoMap = {};
  for (const cursoData of MOCK_CURSOS) {
    const curso = await prisma.curso.upsert({
      where: {
        nombre_nivelEducativo: {
          nombre: cursoData.nombre,
          nivelEducativo: cursoData.nivelEducativo,
        },
      },
      update: {},
      create: {
        nombre: cursoData.nombre,
        nivelEducativo: cursoData.nivelEducativo,
        modalidad: cursoData.modalidad,
      },
    });
    cursoMap[cursoData.nombre] = curso.id;
  }
  console.log('Cursos seeded successfully.');

  // 4. Seed Instituciones Educativas
  console.log('Seeding instituciones educativas...');
  const instMap = {};
  for (const instData of MOCK_INSTITUCIONES) {
    const ie = await prisma.institucionEducativa.upsert({
      where: { codigoModular: instData.codigoModular },
      update: {
        nombre: instData.nombre,
        nivelEducativo: instData.nivelEducativo,
        modalidad: instData.modalidad,
        provincia: instData.provincia,
        distrito: instData.distrito,
        direccion: instData.direccion,
        zona: instData.zona,
        estado: instData.estado,
        codigoLocal: instData.codigoLocal,
      },
      create: {
        codigoModular: instData.codigoModular,
        codigoLocal: instData.codigoLocal,
        nombre: instData.nombre,
        nivelEducativo: instData.nivelEducativo,
        modalidad: instData.modalidad,
        departamento: instData.departamento,
        provincia: instData.provincia,
        distrito: instData.distrito,
        direccion: instData.direccion,
        zona: instData.zona,
        estado: instData.estado,
      },
    });
    instMap[instData.codigoModular] = ie.id;
  }
  console.log('Instituciones educativas seeded successfully.');

  // 5. Seed Personas, Users, Especialistas, Docentes y DocenteCargos
  console.log('Seeding personas and linked users/roles...');
  const saltRounds = 10;
  for (const userData of MOCK_USERS) {
    const roleId = roleMap[userData.role];
    if (!roleId) {
      console.warn(`Role ${userData.role} not found, skipping user/persona ${userData.dni}`);
      continue;
    }

    // A. Upsert Persona
    const persona = await prisma.persona.upsert({
      where: { dni: userData.dni },
      update: {
        nombres: userData.firstName,
        apellidos: userData.lastName,
        correo: userData.email,
      },
      create: {
        dni: userData.dni,
        nombres: userData.firstName,
        apellidos: userData.lastName,
        correo: userData.email,
      },
    });

    // B. Upsert Usuario
    const passwordHash = await bcrypt.hash(userData.dni, saltRounds);
    await prisma.usuario.upsert({
      where: { personaId: persona.id },
      update: {
        rolId: roleId,
        isActive: true,
      },
      create: {
        personaId: persona.id,
        rolId: roleId,
        passwordHash,
        isActive: true,
        isFirstLogin: true,
      },
    });

    // C. Si es un rol de Especialista o Jefe
    if (['especialista', 'jefe_area', 'jefe_gestion'].includes(userData.role)) {
      const cargoMapEnum = {
        'especialista': 'Especialista',
        'jefe_area': 'Jefe de Área',
        'jefe_gestion': 'Jefe de Gestión'
      };

      await prisma.especialista.upsert({
        where: { personaId: persona.id },
        update: {
          cargo: cargoMapEnum[userData.role],
          nivelEducativo: userData.nivelEducativo || 'Secundaria',
          condicionLaboral: 'Nombrado',
          cargaLaboral: 40,
          estado: 'Activo',
          especialidad: userData.especialidad || 'General',
          modalidad: 'EBR',
        },
        create: {
          personaId: persona.id,
          cargo: cargoMapEnum[userData.role],
          nivelEducativo: userData.nivelEducativo || 'Secundaria',
          condicionLaboral: 'Nombrado',
          cargaLaboral: 40,
          estado: 'Activo',
          especialidad: userData.especialidad || 'General',
          modalidad: 'EBR',
        },
      });
    }

    // D. Si es Director de Institución o Docente
    if (userData.role === 'director_institucion' || userData.role === 'docente') {
      const isDirector = userData.role === 'director_institucion';
      const instId = instMap[userData.institucionCodigoModular];
      
      if (!instId) {
        console.warn(`Institution code ${userData.institucionCodigoModular} not found for user ${userData.dni}, skipping docente creation.`);
        continue;
      }

      const docente = await prisma.docente.upsert({
        where: { personaId: persona.id },
        update: {
          institucionId: instId,
          nivelEducativo: 'Secundaria',
          modalidad: 'EBR',
          gradoAcademico: 'Licenciado',
          estado: 'Activo',
          condicionLaboral: 'Nombrado',
        },
        create: {
          personaId: persona.id,
          institucionId: instId,
          nivelEducativo: 'Secundaria',
          modalidad: 'EBR',
          gradoAcademico: 'Licenciado',
          estado: 'Activo',
          condicionLaboral: 'Nombrado',
        },
      });

      // E. Asociar curso si es Docente y tiene curso especificado
      if (userData.role === 'docente' && userData.curso) {
        const cursoId = cursoMap[userData.curso];
        if (cursoId) {
          await prisma.docenteCurso.upsert({
            where: {
              docenteId_cursoId: {
                docenteId: docente.id,
                cursoId: cursoId,
              },
            },
            update: {},
            create: {
              docenteId: docente.id,
              cursoId: cursoId,
            },
          });
        }
      }

      // F. Asociar Secciones si tiene secciones especificadas
      if (userData.role === 'docente' && userData.secciones) {
        for (const sec of userData.secciones) {
          await prisma.docenteSeccion.upsert({
            where: {
              docenteId_grado_seccion: {
                docenteId: docente.id,
                grado: sec.grado,
                seccion: sec.seccion,
              },
            },
            update: {},
            create: {
              docenteId: docente.id,
              grado: sec.grado,
              seccion: sec.seccion,
            },
          });
        }
      }

      // G. Asociar cargo en DocenteCargo si no tiene ninguno registrado
      const cargoNombre = isDirector ? 'Director' : 'Docente de Aula';
      const cargoId = cargoMap[cargoNombre];
      
      if (cargoId) {
        const existingCargo = await prisma.docenteCargo.findFirst({
          where: {
            docenteId: docente.id,
            cargoId: cargoId,
          },
        });

        if (!existingCargo) {
          await prisma.docenteCargo.create({
            data: {
              docenteId: docente.id,
              cargoId: cargoId,
              fechaInicio: new Date(),
            },
          });
        }
      }
    }
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
