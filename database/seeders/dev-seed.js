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
  { code: 'especialista_admin', name: 'Especialista Admin', description: 'Especialista de Monitoreo Administrativo' },
  { code: 'especialista_medio', name: 'Especialista Medio', description: 'Especialista de Monitoreo de Nivel Medio' },
  { code: 'especialista_bajo', name: 'Especialista Bajo', description: 'Especialista de Monitoreo de Nivel Bajo' },
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
    role: 'especialista_admin',
  },
  {
    dni: '32145678',
    email: 'maria.gomez@ugel-lampa.gob.pe',
    firstName: 'María',
    lastName: 'Gómez Ticona',
    role: 'especialista_medio',
  },
  {
    dni: '12345678',
    email: 'pedro.huanca@ugel-lampa.gob.pe',
    firstName: 'Pedro',
    lastName: 'Huanca Flores',
    role: 'especialista_bajo',
  },
  {
    dni: '87654321',
    email: 'carlos.ruiz@ie-huayta.edu.pe',
    firstName: 'Carlos',
    lastName: 'Ruiz Condori',
    role: 'director_institucion',
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
      where: { code: roleData.code },
      update: {
        name: roleData.name,
        description: roleData.description,
      },
      create: {
        code: roleData.code,
        name: roleData.name,
        description: roleData.description,
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

  // 3. Seed Institución Educativa
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

  // 4. Seed Personas, Users, Especialistas, Docentes y DocenteCargos
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

    // B. Upsert User
    const passwordHash = await bcrypt.hash(userData.dni, saltRounds);
    await prisma.user.upsert({
      where: { personaId: persona.id },
      update: {
        roleId: roleId,
        isActive: true,
      },
      create: {
        personaId: persona.id,
        roleId: roleId,
        passwordHash,
        isActive: true,
        isFirstLogin: true,
      },
    });

    // C. Si es un rol de Especialista
    if (userData.role.startsWith('especialista')) {
      await prisma.especialista.upsert({
        where: { personaId: persona.id },
        update: {
          especialidad: 'Monitoreo Pedagógico',
          nivelEducativo: 'Secundaria',
          estado: 'Activo',
        },
        create: {
          personaId: persona.id,
          especialidad: 'Monitoreo Pedagógico',
          nivelEducativo: 'Secundaria',
          estado: 'Activo',
        },
      });
    }

    // D. Si es Director de Institución o Docente
    if (userData.role === 'director_institucion' || userData.role === 'docente') {
      const isDirector = userData.role === 'director_institucion';
      
      const docente = await prisma.docente.upsert({
        where: { personaId: persona.id },
        update: {
          institucionId: ie.id,
          nivelEducativo: 'Secundaria',
          gradoAcademico: 'Licenciado',
          estado: 'Activo',
          cursoAsignado: isDirector ? null : 'Matemáticas',
        },
        create: {
          personaId: persona.id,
          institucionId: ie.id,
          nivelEducativo: 'Secundaria',
          gradoAcademico: 'Licenciado',
          estado: 'Activo',
          cursoAsignado: isDirector ? null : 'Matemáticas',
        },
      });

      // E. Asociar cargo en DocenteCargo si no tiene ninguno registrado
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
