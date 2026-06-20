import '../../apps/backend/node_modules/dotenv/config.js';
import { PrismaClient } from '../../apps/backend/src/generated/prisma/client.js';
import { PrismaPg } from '../../apps/backend/node_modules/@prisma/adapter-pg/dist/index.js';
import bcrypt from '../../apps/backend/node_modules/bcrypt/bcrypt.js';
import { randomUUID } from 'node:crypto';
const crypto = { randomUUID };

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ─────────────────────────────────────────────────────────────────────────────
// CATALOGOS TRANSVERSALES (modalidades, niveles, especialidades) - se siembran antes
// porque instituciones, cursos y docentes dependen de ellos.
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_MODALIDADES = [
  { codigo: 'EBR', nombre: 'Educacion Basica Regular' },
  { codigo: 'EBA', nombre: 'Educacion Basica Alternativa' },
  { codigo: 'EBE', nombre: 'Educacion Basica Especial' },
  { codigo: 'CEPTRO', nombre: 'Centros de Educacion Tecnico-Productiva' },
];

const MOCK_NIVELES_POR_MODALIDAD = {
  EBR: [
    { codigo: 'Inicial', nombre: 'Inicial' },
    { codigo: 'Primaria', nombre: 'Primaria' },
    { codigo: 'Secundaria', nombre: 'Secundaria' },
  ],
  EBA: [
    { codigo: 'Inicial-Intermedio', nombre: 'Inicial-Intermedio' },
    { codigo: 'Avanzado', nombre: 'Avanzado' },
  ],
  EBE: [
    { codigo: 'CEBE', nombre: 'Centro de Educacion Basica Especial' },
    { codigo: 'PRITE', nombre: 'Programa de Intervencion Temprana' },
  ],
  CEPTRO: [
    { codigo: 'Corte y Ensamblaje', nombre: 'Corte y Ensamblaje' },
    { codigo: 'Mecanica de Motos', nombre: 'Mecanica de Motos y Vehiculos Afines' },
  ],
};

const MOCK_ESPECIALIDADES = [
  { nombre: 'PIP', nivel: 'Primaria' },
  { nombre: 'Educacion Fisica', nivel: 'Primaria' },
  { nombre: 'CTA', nivel: 'Secundaria' },
  { nombre: 'Matematica', nivel: 'Secundaria' },
  { nombre: 'Comunicacion', nivel: 'Secundaria' },
];


// ─────────────────────────────────────────────────────────────────────────────
const MOCK_ROLES = [
  { code: 'director_ugel', name: 'Director UGEL', description: 'Director de la UGEL Lampa' },
  { code: 'jefe_area', name: 'Jefe de Área', description: 'Jefe de Área de la UGEL' },
  {
    code: 'jefe_gestion',
    name: 'Jefe de Gestión',
    description: 'Jefe de Gestión de la UGEL Lampa',
  },
  {
    code: 'especialista',
    name: 'Especialista',
    description: 'Especialista de Monitoreo de la UGEL',
  },
  {
    code: 'director_institucion',
    name: 'Director de Institución',
    description: 'Director de Institución Educativa',
  },
  {
    code: 'coordinador_pedagogico',
    name: 'Coordinador Pedagógico',
    description: 'Coordinador Pedagógico de Secundaria',
  },
  {
    code: 'jefe_taller',
    name: 'Jefe de Taller',
    description: 'Jefe de Taller de Secundaria',
  },
  { code: 'docente', name: 'Docente', description: 'Docente de Aula' },
  { code: 'invitado', name: 'Invitado', description: 'Usuario de Consulta e Invitado' },
];

// ─────────────────────────────────────────────────────────────────────────────
// PERMISOS Y ASIGNACIONES
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_PERMISOS = [
  {
    codigo: 'especialistas:read',
    nombre: 'Leer Especialistas',
    descripcion: 'Permite listar y ver detalles de especialistas',
  },
  {
    codigo: 'especialistas:write',
    nombre: 'Gestionar Especialistas',
    descripcion: 'Permite crear, editar e inactivar especialistas',
  },
  {
    codigo: 'instituciones:read',
    nombre: 'Leer Instituciones',
    descripcion: 'Permite listar y ver detalles de instituciones',
  },
  {
    codigo: 'instituciones:write',
    nombre: 'Gestionar Instituciones',
    descripcion: 'Permite crear, editar y dar de baja instituciones',
  },
  {
    codigo: 'docentes:read',
    nombre: 'Leer Docentes',
    descripcion: 'Permite listar y ver detalles de docentes',
  },
  {
    codigo: 'docentes:write',
    nombre: 'Gestionar Docentes',
    descripcion: 'Permite registrar, editar y dar de baja docentes',
  },
  {
    codigo: 'dashboard:read',
    nombre: 'Ver Dashboard',
    descripcion: 'Permite visualizar el panel de control y estadísticas',
  },
  {
    codigo: 'reports:read',
    nombre: 'Ver Reportes',
    descripcion: 'Permite visualizar reportes del sistema',
  },
  {
    codigo: 'reports:own',
    nombre: 'Ver Reportes Propios',
    descripcion: 'Permite al docente visualizar sus propios reportes',
  },
  {
    codigo: 'jefes_area:write',
    nombre: 'Gestionar Jefes de Área',
    descripcion: 'Permite crear, editar y dar de baja jefes de área',
  },
  {
    codigo: 'directores:write',
    nombre: 'Gestionar Directores',
    descripcion: 'Permite registrar, editar y dar de baja directores de IE',
  },
  {
    codigo: 'monitoreo:execute',
    nombre: 'Realizar Monitoreo',
    descripcion: 'Permite ejecutar y registrar fichas de monitoreo',
  },
];

const MOCK_ROL_PERMISOS = {
  director_ugel: ['dashboard:read', 'reports:read'],
  jefe_gestion: [
    'especialistas:read',
    'especialistas:write',
    'jefes_area:write',
    'monitoreo:execute',
    'reports:read',
    'directores:write',
    'instituciones:read',
    'instituciones:write',
    'docentes:read',
    'docentes:write',
  ],
  jefe_area: [
    'directores:write',
    'instituciones:read',
    'instituciones:write',
    'docentes:read',
    'docentes:write',
  ],
  especialista: ['monitoreo:execute', 'reports:read'],
  director_institucion: ['docentes:read', 'docentes:write', 'reports:read', 'monitoreo:execute'],
  coordinador_pedagogico: ['docentes:read', 'reports:read', 'monitoreo:execute'],
  jefe_taller: ['docentes:read', 'reports:read', 'monitoreo:execute'],
  docente: ['reports:own'],
  invitado: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// CARGOS (tabla auxiliar de Docente)
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_CARGOS = [
  { nombre: 'Director' },
  { nombre: 'Subdirector' },
  { nombre: 'Coordinador Pedagógico' },
  { nombre: 'Docente de Aula' },
  { nombre: 'Jefe de Taller' },
  { nombre: 'PIP' },
];

// ─────────────────────────────────────────────────────────────────────────────
// CURSOS
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_CURSOS = [
  // Inicial
  { nombre: 'Personal Social', nivelEducativo: 'Inicial', modalidad: 'EBR' },
  { nombre: 'Psicomotricidad', nivelEducativo: 'Inicial', modalidad: 'EBR' },
  { nombre: 'Comunicación', nivelEducativo: 'Inicial', modalidad: 'EBR' },
  { nombre: 'Descubrimiento del Mundo', nivelEducativo: 'Inicial', modalidad: 'EBR' },
  // Primaria
  { nombre: 'Comunicación', nivelEducativo: 'Primaria', modalidad: 'EBR' },
  { nombre: 'Matemática', nivelEducativo: 'Primaria', modalidad: 'EBR' },
  { nombre: 'Ciencia y Tecnología', nivelEducativo: 'Primaria', modalidad: 'EBR' },
  { nombre: 'Personal Social', nivelEducativo: 'Primaria', modalidad: 'EBR' },
  { nombre: 'Arte y Cultura', nivelEducativo: 'Primaria', modalidad: 'EBR' },
  { nombre: 'Educación Física', nivelEducativo: 'Primaria', modalidad: 'EBR' },
  { nombre: 'Educación Religiosa', nivelEducativo: 'Primaria', modalidad: 'EBR' },
  // Secundaria
  { nombre: 'Comunicación', nivelEducativo: 'Secundaria', modalidad: 'EBR' },
  { nombre: 'Matemática', nivelEducativo: 'Secundaria', modalidad: 'EBR' },
  { nombre: 'Ciencia y Tecnología', nivelEducativo: 'Secundaria', modalidad: 'EBR' },
  {
    nombre: 'Desarrollo Personal, Ciudadanía y Cívica',
    nivelEducativo: 'Secundaria',
    modalidad: 'EBR',
  },
  { nombre: 'Ciencias Sociales', nivelEducativo: 'Secundaria', modalidad: 'EBR' },
  { nombre: 'Educación Física', nivelEducativo: 'Secundaria', modalidad: 'EBR' },
  { nombre: 'Arte y Cultura', nivelEducativo: 'Secundaria', modalidad: 'EBR' },
  { nombre: 'Inglés', nivelEducativo: 'Secundaria', modalidad: 'EBR' },
  { nombre: 'Educación Religiosa', nivelEducativo: 'Secundaria', modalidad: 'EBR' },
  { nombre: 'Educación para el Trabajo', nivelEducativo: 'Secundaria', modalidad: 'EBR' },
];

// ─────────────────────────────────────────────────────────────────────────────
// INSTITUCIONES EDUCATIVAS
// ─────────────────────────────────────────────────────────────────────────────
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
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// USUARIOS / PERSONAS
// Reglas de negocio codificadas en los datos:
//   - Especialista Primaria → especialidad solo puede ser 'PIP' o 'Educación Física'
//   - Especialista con condicionLaboral → solo 'Encargado', 'Destacado', 'Designado'
//   - Coordinador Pedagógico y Jefe de Taller → condicionLaboral 'Nombrado' o 'Destacado', nivelEducativo Secundaria
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_USERS = [
  // ── UGEL ──────────────────────────────────────────────────────────────────
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
    nivelEducativo: 'Secundaria',
  },
  {
    dni: '32145678',
    email: 'maria.gomez@ugel-lampa.gob.pe',
    firstName: 'María',
    lastName: 'Gómez Ticona',
    role: 'jefe_gestion',
    nivelEducativo: 'Secundaria',
  },
  // Especialista Secundaria → especialidad libre
  {
    dni: '12345678',
    email: 'pedro.huanca@ugel-lampa.gob.pe',
    firstName: 'Pedro',
    lastName: 'Huanca Flores',
    role: 'especialista',
    especialidad: 'Matemática',
    nivelEducativo: 'Secundaria',
    condicionLaboral: 'Encargado',
  },
  // Especialista Primaria → especialidad SOLO 'PIP' o 'Educación Física'
  {
    dni: '12312312',
    email: 'alberto.condori@ugel-lampa.gob.pe',
    firstName: 'Alberto',
    lastName: 'Condori Ccallo',
    role: 'especialista',
    especialidad: 'PIP', // ← corregido (antes era 'Comunicación', inválido para Primaria)
    nivelEducativo: 'Primaria',
    condicionLaboral: 'Designado',
  },
  // Especialista Inicial → especialidad no aplica
  {
    dni: '45645645',
    email: 'sofia.vargas@ugel-lampa.gob.pe',
    firstName: 'Sofía Lorena',
    lastName: 'Vargas Paredes',
    role: 'especialista',
    especialidad: null,
    nivelEducativo: 'Inicial',
    condicionLaboral: 'Destacado',
  },

  // ── I.E. HUAYTA (Secundaria) ──────────────────────────────────────────────
  {
    dni: '87654321',
    email: 'carlos.ruiz@ie-huayta.edu.pe',
    firstName: 'Carlos',
    lastName: 'Ruiz Condori',
    role: 'director_institucion',
    institucionCodigoModular: '0543210',
    nivelEducativo: 'Secundaria',
    condicionLaboral: 'Designado',
    cargoNombre: 'Director',
  },
  // Docente de Aula - Matemática
  {
    dni: '11223344',
    email: 'rosa.mamani@ie-huayta.edu.pe',
    firstName: 'Rosa',
    lastName: 'Mamani Ccopa',
    role: 'docente',
    institucionCodigoModular: '0543210',
    nivelEducativo: 'Secundaria',
    modalidad: 'EBR',
    condicionLaboral: 'Nombrado',
    curso: 'Matemática',
    cargoNombre: 'Docente de Aula',
    secciones: [
      { grado: '1°', seccion: 'A' },
      { grado: '1°', seccion: 'B' },
    ],
  },
  // Docente de Aula - Comunicación
  {
    dni: '11223355',
    email: 'elena.flores@ie-huayta.edu.pe',
    firstName: 'Elena',
    lastName: 'Flores Apaza',
    role: 'docente',
    institucionCodigoModular: '0543210',
    nivelEducativo: 'Secundaria',
    modalidad: 'EBR',
    condicionLaboral: 'Nombrado',
    curso: 'Comunicación',
    cargoNombre: 'Docente de Aula',
    secciones: [{ grado: '2°', seccion: 'A' }],
  },
  // Coordinador Pedagógico → condicionLaboral: Nombrado | Destacado, nivel Secundaria
  {
    dni: '55001122',
    email: 'victor.chuquimia@ie-huayta.edu.pe',
    firstName: 'Víctor Hugo',
    lastName: 'Chuquimia Loza',
    role: 'docente',
    institucionCodigoModular: '0543210',
    nivelEducativo: 'Secundaria',
    modalidad: 'EBR',
    condicionLaboral: 'Nombrado', // ← regla: solo Nombrado o Destacado
    cargaLaboral: 40, // ← regla: carga 40h obligatoria
    curso: 'Desarrollo Personal, Ciudadanía y Cívica',
    cargoNombre: 'Coordinador Pedagógico',
    secciones: [],
  },
  // Jefe de Taller → condicionLaboral: Nombrado | Destacado, nivel Secundaria
  {
    dni: '55009988',
    email: 'felix.lupaca@ie-huayta.edu.pe',
    firstName: 'Félix',
    lastName: 'Lupaca Coaquira',
    role: 'docente',
    institucionCodigoModular: '0543210',
    nivelEducativo: 'Secundaria',
    modalidad: 'EBR',
    condicionLaboral: 'Destacado', // ← regla: solo Nombrado o Destacado
    curso: 'Educación para el Trabajo',
    cargoNombre: 'Jefe de Taller',
    secciones: [{ grado: '4°', seccion: 'A' }],
  },

  // ── I.E. 70025 LAMPA (Primaria) ───────────────────────────────────────────
  {
    dni: '88887777',
    email: 'raul.ticona@ie-lampa.edu.pe',
    firstName: 'Raúl',
    lastName: 'Ticona Quispe',
    role: 'director_institucion',
    institucionCodigoModular: '0123456',
    nivelEducativo: 'Primaria',
    condicionLaboral: 'Designado',
    cargoNombre: 'Director',
  },
  {
    dni: '22334455',
    email: 'lucia.mendoza@ie-lampa.edu.pe',
    firstName: 'Lucía',
    lastName: 'Mendoza Torres',
    role: 'docente',
    institucionCodigoModular: '0123456',
    nivelEducativo: 'Primaria',
    modalidad: 'EBR',
    condicionLaboral: 'Nombrado',
    curso: 'Personal Social',
    cargoNombre: 'Docente de Aula',
    secciones: [
      { grado: '3°', seccion: 'A' },
      { grado: '4°', seccion: 'A' },
    ],
  },
  // PIP (Programa de Intervención Pedagógica) → cargo 'PIP', nivel Primaria
  {
    dni: '22335566',
    email: 'beatriz.callata@ie-lampa.edu.pe',
    firstName: 'Beatriz',
    lastName: 'Callata Flores',
    role: 'docente',
    institucionCodigoModular: '0123456',
    nivelEducativo: 'Primaria',
    modalidad: 'EBR',
    condicionLaboral: 'Nombrado',
    curso: 'Matemática',
    cargoNombre: 'PIP',
    secciones: [
      { grado: '1°', seccion: 'A' },
      { grado: '2°', seccion: 'A' },
    ],
  },

  // ── I.E. INICIAL LAMPA ────────────────────────────────────────────────────
  {
    dni: '77001234',
    email: 'patricia.quispe@ie-inicial.edu.pe',
    firstName: 'Patricia',
    lastName: 'Quispe Tito',
    role: 'director_institucion',
    institucionCodigoModular: '0654321',
    nivelEducativo: 'Inicial',
    condicionLaboral: 'Designado',
    cargoNombre: 'Director',
  },
  {
    dni: '77005678',
    email: 'ana.ramos@ie-inicial.edu.pe',
    firstName: 'Ana María',
    lastName: 'Ramos Huanca',
    role: 'docente',
    institucionCodigoModular: '0654321',
    nivelEducativo: 'Inicial',
    modalidad: 'EBR',
    condicionLaboral: 'Nombrado',
    curso: 'Personal Social',
    cargoNombre: 'Docente de Aula',
    secciones: [{ grado: '5 años', seccion: 'A' }],
  },

  // ── I.E. AGROINDUSTRIAL PUCARÁ (Secundaria) ───────────────────────────────
  {
    dni: '55556666',
    email: 'miguel.paredes@ie-agro.edu.pe',
    firstName: 'Miguel Ángel',
    lastName: 'Paredes Larico',
    role: 'director_institucion',
    institucionCodigoModular: '0712345',
    nivelEducativo: 'Secundaria',
    condicionLaboral: 'Designado',
    cargoNombre: 'Director',
  },
  {
    dni: '33445566',
    email: 'gladys.apaza@ie-agro.edu.pe',
    firstName: 'Gladys',
    lastName: 'Apaza Choque',
    role: 'docente',
    institucionCodigoModular: '0712345',
    nivelEducativo: 'Secundaria',
    modalidad: 'EBR',
    condicionLaboral: 'Nombrado',
    curso: 'Ciencia y Tecnología',
    cargoNombre: 'Docente de Aula',
    secciones: [
      { grado: '5°', seccion: 'A' },
      { grado: '5°', seccion: 'B' },
    ],
  },
  // Coordinador Pedagógico de I.E. Agroindustrial
  {
    dni: '33449977',
    email: 'jorge.ccama@ie-agro.edu.pe',
    firstName: 'Jorge',
    lastName: 'Ccama Villanueva',
    role: 'docente',
    institucionCodigoModular: '0712345',
    nivelEducativo: 'Secundaria',
    modalidad: 'EBR',
    condicionLaboral: 'Destacado', // ← regla cumplida
    cargaLaboral: 40, // ← regla cumplida
    curso: 'Ciencias Sociales',
    cargoNombre: 'Coordinador Pedagógico',
    secciones: [],
  },

  // ── INVITADO ──────────────────────────────────────────────────────────────
  {
    dni: '99887766',
    email: 'visitante.demo@ugel-lampa.gob.pe',
    firstName: 'Visitante',
    lastName: 'Demo',
    role: 'invitado',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Starting database seeding (3NF)...');

  // ── 1. Migración legacy ───────────────────────────────────────────────────
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE roles SET codigo = 'director_institucion' WHERE codigo = 'director_ie'`,
    );
    console.log('Migrated old director_ie role to director_institucion.');
  } catch (err) {
    console.log('Could not migrate director_ie role:', err.message);
  }

  // ── 2. Roles ──────────────────────────────────────────────────────────────
  console.log('Seeding roles...');
  const roleMap = {};
  for (const roleData of MOCK_ROLES) {
    const role = await prisma.role.upsert({
      where: { codigo: roleData.code },
      update: { nombre: roleData.name, descripcion: roleData.description },
      create: { codigo: roleData.code, nombre: roleData.name, descripcion: roleData.description },
    });
    roleMap[roleData.code] = role.id;
  }
  console.log('Roles seeded.');

  // ── 3. Permisos ───────────────────────────────────────────────────────────
  console.log('Seeding permisos...');
  const permisoMap = {};
  for (const perm of MOCK_PERMISOS) {
    const dbPerm = await prisma.permiso.upsert({
      where: { codigo: perm.codigo },
      update: { nombre: perm.nombre, descripcion: perm.descripcion },
      create: { codigo: perm.codigo, nombre: perm.nombre, descripcion: perm.descripcion },
    });
    permisoMap[perm.codigo] = dbPerm.id;
  }
  console.log('Permisos seeded.');

  // ── 4. Rol-Permisos ───────────────────────────────────────────────────────
  console.log('Seeding rol_permisos...');
  for (const [roleCode, permCodigos] of Object.entries(MOCK_ROL_PERMISOS)) {
    const rolId = roleMap[roleCode];
    if (!rolId) continue;
    for (const permCodigo of permCodigos) {
      const permisoId = permisoMap[permCodigo];
      if (!permisoId) continue;
      await prisma.rolPermiso.upsert({
        where: { rolId_permisoId: { rolId, permisoId } },
        update: {},
        create: { rolId, permisoId },
      });
    }
  }
  console.log('RolPermisos seeded.');

  // ── 5. Cargos ─────────────────────────────────────────────────────────────
  console.log('Seeding cargos...');
  const cargoMap = {};
  for (const cargoData of MOCK_CARGOS) {
    const cargo = await prisma.cargo.upsert({
      where: { nombre: cargoData.nombre },
      update: {},
      create: { nombre: cargoData.nombre },
    });
    cargoMap[cargoData.nombre] = cargo.id;
  }
  console.log('Cargos seeded.');

  // ── 5.5. Catalogos: modalidades, niveles_educativos, especialidades ──────────
  console.log('Seeding catalogos (modalidades, niveles, especialidades)...');
  const nivelMap = {};
  for (const modData of MOCK_MODALIDADES) {
    const mod = await prisma.modalidad.upsert({
      where: { codigo: modData.codigo },
      update: { nombre: modData.nombre },
      create: { codigo: modData.codigo, nombre: modData.nombre },
    });
    const niveles = MOCK_NIVELES_POR_MODALIDAD[modData.codigo] || [];
    for (const nivData of niveles) {
      const niv = await prisma.nivelEducativo.upsert({
        where: { codigo_modalidadId: { codigo: nivData.codigo, modalidadId: mod.id } },
        update: { nombre: nivData.nombre },
        create: { codigo: nivData.codigo, nombre: nivData.nombre, modalidadId: mod.id },
      });
      nivelMap[nivData.codigo] = niv.id;
    }
  }
  for (const espData of MOCK_ESPECIALIDADES) {
    const nivelId = nivelMap[espData.nivel];
    if (!nivelId) continue;
    await prisma.especialidad.upsert({
      where: { nombre_nivelEducativoId: { nombre: espData.nombre, nivelEducativoId: nivelId } },
      update: {},
      create: { nombre: espData.nombre, nivelEducativoId: nivelId },
    });
  }
  console.log('Catalogos seeded.');

  // ── 6. Cursos ─────────────────────────────────────────────────────────────
  console.log('Seeding cursos...');
  const cursoMap = {};
  for (const cursoData of MOCK_CURSOS) {
    const nivel = await prisma.nivelEducativo.findFirst({
      where: { codigo: cursoData.nivelEducativo, isActive: true },
    });
    if (!nivel) {
      console.warn(`Nivel ${cursoData.nivelEducativo} no encontrado, saltando curso ${cursoData.nombre}`);
      continue;
    }
    const curso = await prisma.curso.upsert({
      where: {
        nombre_nivelEducativoId: {
          nombre: cursoData.nombre,
          nivelEducativoId: nivel.id,
        },
      },
      update: {},
      create: {
        nombre: cursoData.nombre,
        nivelEducativoId: nivel.id,
      },
    });
    // Key compuesto nombre+nivel para evitar colisiones (ej. "Comunicación" existe en Inicial, Primaria y Secundaria)
    cursoMap[`${cursoData.nombre}||${cursoData.nivelEducativo}`] = curso.id;
  }
  console.log('Cursos seeded.');

  // ── 7. Instituciones Educativas ───────────────────────────────────────────
  console.log('Seeding instituciones educativas...');
  const instMap = {};
  for (const instData of MOCK_INSTITUCIONES) {
    const nivelIe = await prisma.nivelEducativo.findFirst({
      where: { codigo: instData.nivelEducativo, isActive: true },
    });
    const ie = await prisma.institucionEducativa.upsert({
      where: { codigoModular: instData.codigoModular },
      update: {
        nombre: instData.nombre,
        nivelEducativo: instData.nivelEducativo,
        nivelEducativoId: nivelIe?.id ?? null,
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
        nivelEducativoId: nivelIe?.id ?? null,
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
  console.log('Instituciones educativas seeded.');

  // ── 8. Personas / Usuarios / Especialistas / Docentes ─────────────────────
  console.log('Seeding personas, usuarios, especialistas y docentes...');
  const saltRounds = 10;

  // Mapa de cargo de la tabla Especialista según rol del sistema
  const especialistaCargoPorRol = {
    especialista: 'Especialista',
    jefe_area: 'Jefe de Área',
    jefe_gestion: 'Jefe de Gestión',
  };

  for (const userData of MOCK_USERS) {
    const roleId = roleMap[userData.role];
    if (!roleId) {
      console.warn(`Role '${userData.role}' not found — skipping ${userData.dni}`);
      continue;
    }

    // A. Persona
    const persona = await prisma.persona.upsert({
      where: { dni: userData.dni },
      update: { nombres: userData.firstName, apellidos: userData.lastName, correo: userData.email },
      create: {
        dni: userData.dni,
        nombres: userData.firstName,
        apellidos: userData.lastName,
        correo: userData.email,
      },
    });

    // B. Usuario
    const passwordHash = await bcrypt.hash(userData.dni, saltRounds);
    await prisma.usuario.upsert({
      where: { personaId: persona.id },
      update: { rolId: roleId, isActive: true },
      create: {
        personaId: persona.id,
        rolId: roleId,
        passwordHash,
        isActive: true,
        isFirstLogin: true,
      },
    });

    // C. Especialista (aplica para roles UGEL que operan sobre la tabla especialistas)
    if (especialistaCargoPorRol[userData.role]) {
      const cargoEsp = especialistaCargoPorRol[userData.role];
      // Jefe de Gestión → condicionLaboral siempre Nombrado (regla de negocio)
      const condicionLaboral =
        cargoEsp === 'Jefe de Gestión' ? 'Nombrado' : userData.condicionLaboral || 'Encargado';

      await prisma.especialista.upsert({
        where: { personaId: persona.id },
        update: {
          cargo: cargoEsp,
          nivelEducativo: userData.nivelEducativo || 'Secundaria',
          condicionLaboral,
          cargaLaboral: 40,
          estado: 'Activo',
          modalidad: 'EBR',
        },
        create: {
          personaId: persona.id,
          cargo: cargoEsp,
          nivelEducativo: userData.nivelEducativo || 'Secundaria',
          condicionLaboral,
          cargaLaboral: 40,
          estado: 'Activo',
          modalidad: 'EBR',
        },
      });

      // Vincular especialidad si existe (M:N via especialista_especialidades)
      if (userData.especialidad) {
        const esp = await prisma.especialidad.findFirst({
          where: { nombre: userData.especialidad, isActive: true },
        });
        if (esp) {
          const espRow = await prisma.especialista.findUnique({ where: { personaId: persona.id } });
          if (espRow) {
            await prisma.especialistaEspecialidad.upsert({
              where: { especialistaId_especialidadId: { especialistaId: espRow.id, especialidadId: esp.id } },
              update: {},
              create: { especialistaId: espRow.id, especialidadId: esp.id },
            });
          }
        }
      }
    }

    // D. Docente (aplica para directores y docentes de IE)
    if (userData.role === 'director_institucion' || userData.role === 'docente') {
      const instId = instMap[userData.institucionCodigoModular];
      if (!instId) {
        console.warn(
          `Institución '${userData.institucionCodigoModular}' no encontrada — skipping ${userData.dni}`,
        );
        continue;
      }

      const nivelDocente = await prisma.nivelEducativo.findFirst({
        where: { codigo: userData.nivelEducativo || 'Secundaria', isActive: true },
      });
      const docente = await prisma.docente.upsert({
        where: { personaId: persona.id },
        update: {
          institucionId: instId,
          nivelEducativo: userData.nivelEducativo || 'Secundaria',
          nivelEducativoId: nivelDocente?.id ?? null,
          modalidad: userData.modalidad || 'EBR',
          gradoAcademico: 'Licenciado',
          estado: 'Activo',
          condicionLaboral: userData.condicionLaboral || 'Nombrado',
          cargaLaboral: userData.cargaLaboral ?? null,
        },
        create: {
          personaId: persona.id,
          institucionId: instId,
          nivelEducativo: userData.nivelEducativo || 'Secundaria',
          nivelEducativoId: nivelDocente?.id ?? null,
          modalidad: userData.modalidad || 'EBR',
          gradoAcademico: 'Licenciado',
          estado: 'Activo',
          condicionLaboral: userData.condicionLaboral || 'Nombrado',
          cargaLaboral: userData.cargaLaboral ?? null,
        },
      });

      // E. Curso asignado
      if (userData.curso) {
        const cursoKey = `${userData.curso}||${userData.nivelEducativo || 'Secundaria'}`;
        const cursoId = cursoMap[cursoKey];
        if (cursoId) {
          await prisma.docenteCurso.upsert({
            where: { docenteId_cursoId: { docenteId: docente.id, cursoId } },
            update: {},
            create: { docenteId: docente.id, cursoId },
          });
        } else {
          console.warn(
            `Curso '${userData.curso}' para nivel '${userData.nivelEducativo}' no encontrado — skipping curso de ${userData.dni}`,
          );
        }
      }

      // F. Secciones
      if (userData.secciones && userData.secciones.length > 0) {
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
            create: { docenteId: docente.id, grado: sec.grado, seccion: sec.seccion },
          });
        }
      }

      // G. DocenteCargo: asignar el cargo correspondiente
      const cargoNombre =
        userData.cargoNombre ||
        (userData.role === 'director_institucion' ? 'Director' : 'Docente de Aula');
      const cargoId = cargoMap[cargoNombre];
      if (cargoId) {
        const existingCargo = await prisma.docenteCargo.findFirst({
          where: { docenteId: docente.id, cargoId },
        });
        if (!existingCargo) {
          await prisma.docenteCargo.create({
            data: { docenteId: docente.id, cargoId, fechaInicio: new Date() },
          });
        }
      } else {
        console.warn(
          `Cargo '${cargoNombre}' no encontrado en cargoMap — skipping DocenteCargo de ${userData.dni}`,
        );
      }
    }
  }

  // ── 9. SPRINT 3 - Planes de Monitoreo ──────────────────────────────────────
  console.log('Seeding planes de monitoreo (sprint 3)...');
  const jefeGestion = await prisma.usuario.findFirst({
    where: { rol: { codigo: 'jefe_gestion' } },
  });
  const directorIe = await prisma.usuario.findFirst({
    where: { rol: { codigo: 'director_institucion' } },
  });
  const primeraIe = await prisma.institucionEducativa.findFirst();

  // Helper: get-or-create por campos no-id (no podemos upsert por id en UUID auto)
  const findOrCreatePlan = async (where, create) => {
    const existing = await prisma.planMonitoreo.findFirst({ where });
    if (existing) return existing;
    return prisma.planMonitoreo.create({ data: { id: crypto.randomUUID(), ...create } });
  };

  let planUgel2026 = null;
  if (jefeGestion) {
    planUgel2026 = await findOrCreatePlan(
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
    console.log(`  Plan UGEL 2026: ${planUgel2026.id}`);
  }

  let planIe2026 = null;
  if (directorIe && primeraIe) {
    planIe2026 = await findOrCreatePlan(
      { titulo: 'Plan de Monitoreo IE 2026', anioAcademico: 2026, tipoEntidad: 'IE', deleted: false },
      {
        titulo: 'Plan de Monitoreo IE 2026',
        anioAcademico: 2026,
        tipoEntidad: 'IE',
        archivoUrl: '/uploads/planes/plan-ie-2026-seed.pdf',
        estado: 'Activo',
        autorId: directorIe.id,
        rolAutorAlCrear: 'director_ie',
        institucionId: primeraIe.id,
        deleted: false,
      },
    );
    if (primeraIe) {
      const coberturaExistente = await prisma.planCoberturaIe.findFirst({
        where: { planId: planIe2026.id, institucionId: primeraIe.id },
      });
      if (!coberturaExistente) {
        await prisma.planCoberturaIe.create({
          data: {
            id: crypto.randomUUID(),
            planId: planIe2026.id,
            institucionId: primeraIe.id,
          },
        });
      }
    }
    console.log(`  Plan IE 2026: ${planIe2026.id}`);
  }

  // ── 10. SPRINT 3 - Plantillas de Monitoreo ─────────────────────────────────
  console.log('Seeding plantillas de monitoreo (sprint 3)...');
  if (jefeGestion) {
    // Plantilla Docente Vigente 2026
    const plantillaDocenteExistente = await prisma.plantillaMonitoreo.findFirst({
      where: { tipoMonitoreo: 'DOCENTE', anioAcademico: 2026, version: 1 },
    });

    if (!plantillaDocenteExistente) {
      const nivelesIds = {
        I: crypto.randomUUID(),
        II: crypto.randomUUID(),
        III: crypto.randomUUID(),
        IV: crypto.randomUUID(),
      };

      const plantillaDocente = await prisma.plantillaMonitoreo.create({
        data: {
          id: crypto.randomUUID(),
          tipoMonitoreo: 'DOCENTE',
          anioAcademico: 2026,
          version: 1,
          baremo: 'Vigente',
          descripcion: 'Ficha oficial UGEL para evaluacion docente 2026 (seed).',
          estado: 'Vigente',
          autorId: jefeGestion.id,
          rolAutorAlCrear: 'jefe_gestion',
          institucionId: null,
          nivelesCalificacion: {
            create: [
              { id: nivelesIds.I, nivelRomano: 'I', denominacion: 'Muy Insatisfactorio', rangoMin: 0, color: '#ef4444', orden: 1 },
              { id: nivelesIds.II, nivelRomano: 'II', denominacion: 'En Proceso', rangoMin: 11, color: '#f59e0b', orden: 2 },
              { id: nivelesIds.III, nivelRomano: 'III', denominacion: 'Satisfactorio', rangoMin: 15, color: '#22c55e', orden: 3 },
              { id: nivelesIds.IV, nivelRomano: 'IV', denominacion: 'Destacado', rangoMin: 18, color: '#3b82f6', orden: 4 },
            ],
          },
        },
      });
      console.log(`  Plantilla Docente: ${plantillaDocente.id}`);

      const desempenosData = [
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

      for (const [idx, d] of desempenosData.entries()) {
        const desempeno = await prisma.desempenoPlantilla.create({
          data: {
            id: crypto.randomUUID(),
            plantillaId: plantillaDocente.id,
            nombre: d.nombre,
            descripcionCorta: d.descripcionCorta,
            orden: idx + 1,
            aspectos: {
              create: d.aspectos.map((a, i) => ({
                id: crypto.randomUUID(),
                descripcion: a,
                orden: i + 1,
              })),
            },
          },
        });
        for (const nivel of ['I', 'II', 'III', 'IV']) {
          await prisma.rubricaNivel.create({
            data: {
              id: crypto.randomUUID(),
              desempenoId: desempeno.id,
              nivelCalificacionId: nivelesIds[nivel],
              descripcion: `Nivel ${nivel}: comportamiento observado para "${d.nombre.substring(0, 40)}".`,
            },
          });
        }
      }
      console.log(`  3 desempenos docente con aspectos y rubricas creados.`);
    }

    // Plantilla Directivo Vigente 2026
    const plantillaDirectivoExistente = await prisma.plantillaMonitoreo.findFirst({
      where: { tipoMonitoreo: 'DIRECTIVO', anioAcademico: 2026, version: 1 },
    });
    if (!plantillaDirectivoExistente) {
      const nivelesIdsDir = {
        I: crypto.randomUUID(),
        II: crypto.randomUUID(),
        III: crypto.randomUUID(),
        IV: crypto.randomUUID(),
      };

      const plantillaDirectivo = await prisma.plantillaMonitoreo.create({
        data: {
          id: crypto.randomUUID(),
          tipoMonitoreo: 'DIRECTIVO',
          anioAcademico: 2026,
          version: 1,
          baremo: 'Vigente',
          descripcion: 'Ficha oficial UGEL para evaluacion directivo 2026 (seed).',
          estado: 'Vigente',
          autorId: jefeGestion.id,
          rolAutorAlCrear: 'jefe_gestion',
          institucionId: null,
          nivelesCalificacion: {
            create: [
              { id: nivelesIdsDir.I, nivelRomano: 'I', denominacion: 'Muy Insatisfactorio', rangoMin: 0, color: '#ef4444', orden: 1 },
              { id: nivelesIdsDir.II, nivelRomano: 'II', denominacion: 'En Proceso', rangoMin: 11, color: '#f59e0b', orden: 2 },
              { id: nivelesIdsDir.III, nivelRomano: 'III', denominacion: 'Satisfactorio', rangoMin: 15, color: '#22c55e', orden: 3 },
              { id: nivelesIdsDir.IV, nivelRomano: 'IV', denominacion: 'Destacado', rangoMin: 18, color: '#3b82f6', orden: 4 },
            ],
          },
        },
      });
      console.log(`  Plantilla Directivo: ${plantillaDirectivo.id}`);

      const desempenosDirectivo = [
        { nombre: 'Planificacion y gestion de condiciones operativas (CGE 3)', descripcionCorta: 'Consolidacion de instrumentos de gestion.' },
        { nombre: 'Liderazgo pedagogico y acompanamiento docente (CGE 4)', descripcionCorta: 'Fortalecimiento de capacidades mediante visitas.' },
      ];

      for (const [idx, d] of desempenosDirectivo.entries()) {
        const desempeno = await prisma.desempenoPlantilla.create({
          data: {
            id: crypto.randomUUID(),
            plantillaId: plantillaDirectivo.id,
            nombre: d.nombre,
            descripcionCorta: d.descripcionCorta,
            orden: idx + 1,
            aspectos: {
              create: [
                { id: crypto.randomUUID(), descripcion: 'Cumple con el primer criterio clave.', orden: 1 },
                { id: crypto.randomUUID(), descripcion: 'Cumple con el segundo criterio clave.', orden: 2 },
              ],
            },
          },
        });
        for (const nivel of ['I', 'II', 'III', 'IV']) {
          await prisma.rubricaNivel.create({
            data: {
              id: crypto.randomUUID(),
              desempenoId: desempeno.id,
              nivelCalificacionId: nivelesIdsDir[nivel],
              descripcion: `Nivel ${nivel} para "${d.nombre.substring(0, 30)}".`,
            },
          });
        }
      }
      console.log(`  2 desempenos directivo con rubricas creados.`);
    }
  }

  // ── 11. SPRINT 3 - Cronograma de ejemplo ───────────────────────────────────
  console.log('Seeding cronograma de ejemplo (sprint 3)...');
  const monitorEjemplo = await prisma.especialista.findFirst();
  const evaluadoEjemplo = primeraIe
    ? await prisma.docente.findFirst({ where: { institucionId: primeraIe.id } })
    : null;

  if (monitorEjemplo && evaluadoEjemplo && primeraIe && planUgel2026) {
    const fechaEjemplo = new Date('2026-03-15');
    const cronogramaExistente = await prisma.cronograma.findFirst({
      where: { evaluadoId: evaluadoEjemplo.id, fechaProgramada: fechaEjemplo },
    });
    if (!cronogramaExistente) {
      await prisma.cronograma.create({
        data: {
          id: crypto.randomUUID(),
          monitorId: monitorEjemplo.id,
          institucionId: primeraIe.id,
          evaluadoId: evaluadoEjemplo.id,
          planId: planUgel2026.id,
          tipoMonitoreo: 'DOCENTE',
          numeroVisita: 1,
          fechaProgramada: fechaEjemplo,
          horaInicio: '09:00:00',
          detalles: 'Visita de monitoreo seed (sprint 3).',
          estado: 'PROGRAMADO',
          modalidad: 'EBR',
          nivelEducativo: 'Primaria',
        },
      });
      console.log(`  Cronograma DOCENTE 2026-03-15 09:00 creado.`);
    }
  }

  console.log('Database seeding completed successfully.');
  console.log('');
  console.log('Credenciales de acceso: DNI como contraseña inicial.');
  console.log('Usuarios disponibles:');
  for (const u of MOCK_USERS) {
    console.log(`  ${u.role.padEnd(22)} → DNI: ${u.dni}  (${u.firstName} ${u.lastName})`);
  }
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
