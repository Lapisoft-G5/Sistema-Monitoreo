import { PrismaService } from '../../apps/backend/dist/src/shared/prisma/prisma.service.js';
import bcrypt from '../../apps/backend/node_modules/bcrypt/bcrypt.js';

const prisma = new PrismaService();

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

async function main() {
  console.log('Starting database seeding...');

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

  // 2. Seed Users
  console.log('Seeding users...');
  const saltRounds = 10;
  for (const userData of MOCK_USERS) {
    const roleId = roleMap[userData.role];
    if (!roleId) {
      console.warn(`Role ${userData.role} not found, skipping user ${userData.dni}`);
      continue;
    }

    const passwordHash = await bcrypt.hash(userData.dni, saltRounds);

    await prisma.user.upsert({
      where: { dni: userData.dni },
      update: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        roleId: roleId,
        isActive: true,
      },
      create: {
        dni: userData.dni,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        passwordHash,
        roleId: roleId,
        isActive: true,
        isFirstLogin: true,
      },
    });
  }
  console.log('Users seeded successfully.');
  console.log('Database seeding completed.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
