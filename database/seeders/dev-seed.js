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
  { code: 'coordinador_pedagogico', name: 'Coordinador Pedagógico', description: 'Coordinador Pedagógico de la UGEL Lampa' },
  { code: 'especialista', name: 'Especialista', description: 'Especialista de Monitoreo de la UGEL' },
  { code: 'director_ie', name: 'Director de Institución', description: 'Director de Institución Educativa' },
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
    role: 'coordinador_pedagogico',
  },
  {
    dni: '12345678',
    email: 'pedro.huanca@ugel-lampa.gob.pe',
    firstName: 'Pedro',
    lastName: 'Huanca Flores',
    role: 'especialista',
  },
  {
    dni: '87654321',
    email: 'carlos.ruiz@ie-huayta.edu.pe',
    firstName: 'Carlos',
    lastName: 'Ruiz Condori',
    role: 'director_ie',
  },
  {
    dni: '11223344',
    email: 'rosa.mamani@ie-huayta.edu.pe',
    firstName: 'Rosa',
    lastName: 'Mamani Ccopa',
    role: 'docente',
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
];

const MOCK_CURSOS = [
  { nombre: 'Matemáticas', nivelEducativo: 'Secundaria' },
  { nombre: 'Comunicación', nivelEducativo: 'Secundaria' },
  { nombre: 'Ciencia y Tecnología', nivelEducativo: 'Secundaria' },
];

const MOCK_INSTITUCION = {
  codigoModular: '0543210',
  nombre: 'I.E. Huayta',
  nivelEducativo: 'Secundaria',
  departamento: 'Puno',
  provincia: 'Lampa',
  distrito: 'Lampa',
  direccion: 'Jr. Bolognesi 123',
  zona: 'Rural',
  estado: 'Activa',
};

async function main() {
  console.log('Starting database seeding (3NF)...');

  // 1. Seed Roles
  console.log('Seeding roles...');
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
      },
    });
    cursoMap[cursoData.nombre] = curso.id;
  }
  console.log('Cursos seeded successfully.');

  // 4. Seed Institución Educativa
  console.log('Seeding institucion educativa...');
  const ie = await prisma.institucionEducativa.upsert({
    where: { codigoModular: MOCK_INSTITUCION.codigoModular },
    update: {
      nombre: MOCK_INSTITUCION.nombre,
      nivelEducativo: MOCK_INSTITUCION.nivelEducativo,
      provincia: MOCK_INSTITUCION.provincia,
      distrito: MOCK_INSTITUCION.distrito,
      direccion: MOCK_INSTITUCION.direccion,
      zona: MOCK_INSTITUCION.zona,
      estado: MOCK_INSTITUCION.estado,
    },
    create: {
      codigoModular: MOCK_INSTITUCION.codigoModular,
      nombre: MOCK_INSTITUCION.nombre,
      nivelEducativo: MOCK_INSTITUCION.nivelEducativo,
      departamento: MOCK_INSTITUCION.departamento,
      provincia: MOCK_INSTITUCION.provincia,
      distrito: MOCK_INSTITUCION.distrito,
      direccion: MOCK_INSTITUCION.direccion,
      zona: MOCK_INSTITUCION.zona,
      estado: MOCK_INSTITUCION.estado,
    },
  });
  console.log('Institucion educativa seeded successfully.');

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

    // C. Si es un rol de Especialista
    if (userData.role === 'especialista') {
      await prisma.especialista.upsert({
        where: { personaId: persona.id },
        update: {
          cargo: 'Especialista',
          nivelEducativo: 'Secundaria',
          condicionLaboral: 'Nombrado',
          cargaLaboral: 40,
          estado: 'Activo',
        },
        create: {
          personaId: persona.id,
          cargo: 'Especialista',
          nivelEducativo: 'Secundaria',
          condicionLaboral: 'Nombrado',
          cargaLaboral: 40,
          estado: 'Activo',
        },
      });
    }

    // D. Si es Director de Institución o Docente
    if (userData.role === 'director_ie' || userData.role === 'docente') {
      const isDirector = userData.role === 'director_ie';
      
      const docente = await prisma.docente.upsert({
        where: { personaId: persona.id },
        update: {
          institucionId: ie.id,
          nivelEducativo: 'Secundaria',
          gradoAcademico: 'Licenciado',
          estado: 'Activo',
          condicionLaboral: 'Nombrado',
        },
        create: {
          personaId: persona.id,
          institucionId: ie.id,
          nivelEducativo: 'Secundaria',
          gradoAcademico: 'Licenciado',
          estado: 'Activo',
          condicionLaboral: 'Nombrado',
        },
      });

      // E. Asociar curso si es Docente
      if (userData.role === 'docente') {
        const cursoId = cursoMap['Matemáticas'];
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

      // F. Asociar cargo en DocenteCargo si no tiene ninguno registrado
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
