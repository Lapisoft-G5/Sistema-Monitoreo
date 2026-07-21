import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import bcrypt from '../../apps/backend/node_modules/bcrypt/bcrypt.js';
import { prisma } from './_lib/prisma.js';

/**
 * Personas, usuarios, especialistas y docentes REALES de UGEL Lampa.
 *
 * Fuente de datos:
 * - UGEL Admin Users: Cuentas de gestión para login (Director UGEL, Jefe de Gestión, Jefes de Área, Especialistas UGEL).
 * - NEXUS JSONs: 910 plazas reales (Directores, Subdirectores, Coordinadores, Profesores, Jefes de Laboratorio/Taller)
 *   leídas dinámicamente desde:
 *   - NEXUS_SISTEMA_MONITOREO-inicial.json
 *   - NEXUS_SISTEMA_MONITOREO-primaria.json
 *   - NEXUS_SISTEMA_MONITOREO-secundaria.json
 */

const RUTA_INICIAL = new URL('./data/NEXUS_SISTEMA_MONITOREO-inicial.json', import.meta.url);
const RUTA_PRIMARIA = new URL('./data/NEXUS_SISTEMA_MONITOREO-primaria.json', import.meta.url);
const RUTA_SECUNDARIA = new URL('./data/NEXUS_SISTEMA_MONITOREO-secundaria.json', import.meta.url);
const RUTA_IES = new URL('./data/ies_completas_db.json', import.meta.url);

const UGEL_ADMIN_USERS = [
  {
    dni: '00000000',
    firstName: 'Super',
    lastName: 'Administrador',
    email: 'superadmin@ugel.gob.pe',
    role: 'superusuario',
  },
  {
    dni: '40000001',
    firstName: 'Carlos',
    lastName: 'Mendoza Quispe',
    email: 'carlos.mendoza@ugel.gob.pe',
    role: 'director_ugel',
  },
  {
    dni: '40000002',
    firstName: 'Maria Elena',
    lastName: 'Huaman Vargas',
    email: 'maria.huaman@ugel.gob.pe',
    role: 'jefe_gestion',
    nivelEducativo: 'Secundaria',
  },
  {
    dni: '40000003',
    firstName: 'Jose Luis',
    lastName: 'Quispe Mamani',
    email: 'jose.quispe@ugel.gob.pe',
    role: 'jefe_area',
    nivelEducativo: 'Secundaria',
    especialidades: ['Comunicacion', 'Matematica', 'EPT'],
  },
  {
    dni: '40000004',
    firstName: 'Martha',
    lastName: 'Perez',
    email: 'martha.perez@ugel.gob.pe',
    role: 'jefe_area',
    nivelEducativo: 'Primaria',
    especialidades: ['PIP', 'Educacion Fisica'],
  },
  {
    dni: '40000005',
    firstName: 'Sofia',
    lastName: 'Gomez',
    email: 'sofia.gomez@ugel.gob.pe',
    role: 'jefe_area',
    nivelEducativo: 'Inicial',
  },
  {
    dni: '40000006',
    firstName: 'Ana Lucia',
    lastName: 'Ticona Coila',
    email: 'ana.ticona@ugel.gob.pe',
    role: 'especialista',
    nivelEducativo: 'Primaria',
    especialidades: ['PIP', 'Educacion Fisica'],
  },
  {
    dni: '40000007',
    firstName: 'Pedro Pablo',
    lastName: 'Mamani Cruz',
    email: 'pedro.mamani@ugel.gob.pe',
    role: 'especialista',
    nivelEducativo: 'Secundaria',
    especialidades: ['CTA', 'Ciencias Sociales', 'EPT'],
  },
  {
    dni: '40000008',
    firstName: 'Lidia',
    lastName: 'Salinas',
    email: 'lidia.salinas@ugel.gob.pe',
    role: 'especialista',
    nivelEducativo: 'Secundaria',
    especialidades: ['Matematica', 'Comunicacion', 'Ingles'],
  },
  {
    dni: '40000009',
    firstName: 'Carmen',
    lastName: 'Rios',
    email: 'carmen.rios@ugel.gob.pe',
    role: 'especialista',
    nivelEducativo: 'Inicial',
  },
  {
    dni: '40000100',
    firstName: 'Roberto',
    lastName: 'Chuquimia',
    email: 'roberto.chuquimia@ugel.gob.pe',
    role: 'especialista',
    nivelEducativo: 'Primaria',
    especialidades: ['PIP'],
  },
  {
    dni: '40000101',
    firstName: 'Juliana',
    lastName: 'Huaricallo',
    email: 'juliana.huaricallo@ugel.gob.pe',
    role: 'especialista',
    nivelEducativo: 'Inicial',
  },
];

const norm = (str) =>
  String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractNumber = (str) => {
  const match = String(str || '').match(/\b\d+\b/);
  return match ? match[0] : null;
};

const normalizarNivel = (nivel) => {
  if (/inicial/i.test(nivel)) return 'Inicial';
  if (/primaria/i.test(nivel)) return 'Primaria';
  if (/secundaria/i.test(nivel)) return 'Secundaria';
  return 'Inicial';
};

function parseEspecialidadSecundaria(raw) {
  if (!raw) return 'Comunicacion';
  const str = raw.toUpperCase();
  if (str.includes('MATEMATICA')) return 'Matematica';
  if (str.includes('COMUNICACION')) return 'Comunicacion';
  if (str.includes('CIENCIA') || str.includes('CTA') || str.includes('TECNOLOGIA') || str.includes('AMBIENTE')) return 'CTA';
  if (str.includes('SOCIAL') || str.includes('HISTORIA')) return 'Ciencias Sociales';
  if (str.includes('INGLES')) return 'Ingles';
  if (str.includes('TRABAJO') || str.includes('EPT')) return 'EPT';
  if (str.includes('DESARROLLO') || str.includes('DPCC') || str.includes('CIVICA')) return 'Desarrollo Personal Ciudadania y Civica';
  if (str.includes('ARTE')) return 'Arte y Cultura';
  if (str.includes('RELIGIOSA')) return 'Educacion Religiosa';
  if (str.includes('FISICA')) return 'Educacion Fisica';
  return 'Comunicacion';
}

function parseEspecialidadPrimaria(rawCargo, rawSpec) {
  const combined = `${rawCargo || ''} ${rawSpec || ''}`.toUpperCase();
  if (combined.includes('FISICA')) return 'Educacion Fisica';
  return 'PIP';
}

function cargarNexusPersonas() {
  const iesBase = JSON.parse(readFileSync(RUTA_IES, 'utf-8')).map((ie) => ({
    codMod: String(ie.codMod),
    normNombre: norm(ie.nombreIE),
    normDistrito: norm(ie.distrito),
    num: extractNumber(ie.nombreIE),
    nivel: normalizarNivel(ie.nivel),
  }));

  const nexusFiles = [RUTA_INICIAL, RUTA_PRIMARIA, RUTA_SECUNDARIA];
  const nexusMap = new Map();
  const sinteticasMap = new Map();
  let nextCodMod = 9900001;

  nexusFiles.forEach((fileUrl) => {
    const data = JSON.parse(readFileSync(fileUrl, 'utf-8'));
    data.forEach((r) => {
      let dni = String(r['DOCUMENTO DE IDENTIDAD'] || '').trim().padStart(8, '0');
      if (!dni || dni.length !== 8 || dni === '00000000') return;

      const nombres = String(r['NOMBRES'] || '').trim().toUpperCase();
      const patero = String(r['APELLIDO PATERNO'] || '').trim().toUpperCase();
      const materno = String(r['APELLIDO MATERNO'] || '').trim().toUpperCase();
      const apellidos = `${patero} ${materno}`.trim();
      const rawCargo = String(r['CARGO'] || '').trim().toUpperCase();
      const rawNivel = String(r['NIVEL EDUCATIVO'] || '').trim();
      const rawIE = String(r['NOMBRE DE LA INSTITUCION EDUCATIVA'] || '');
      const rawDist = String(r['DISTRITO'] || '');
      const situacion = String(r['SITUACION LABORAL'] || 'NOMBRADO').trim();
      const jornada = parseInt(r['JORNADA LABORAL']) || 40;
      const especialidadRaw = String(r['ESPECIALIDAD'] || '').trim();

      const normName = norm(rawIE);
      const normDist = norm(rawDist);
      const num = extractNumber(rawIE);
      const levelNorm = normalizarNivel(rawNivel);

      // Match IE
      let found = iesBase.find((ie) => ie.normDistrito === normDist && ie.normNombre === normName);
      if (!found && num) {
        found = iesBase.find((ie) => ie.normDistrito === normDist && ie.nivel === levelNorm && ie.num === num);
      }
      if (!found && num) {
        const candidates = iesBase.filter((ie) => ie.nivel === levelNorm && ie.num === num);
        if (candidates.length === 1) found = candidates[0];
      }
      if (!found) {
        found = iesBase.find(
          (ie) =>
            ie.normDistrito === normDist &&
            ie.nivel === levelNorm &&
            (ie.normNombre.includes(normName) || normName.includes(ie.normNombre)),
        );
      }
      if (!found) {
        found = iesBase.find((ie) => ie.nivel === levelNorm && ie.normNombre === normName);
      }

      let codMod = found?.codMod;
      if (!codMod) {
        const key = `${normDist}|${normName}|${levelNorm}`;
        if (!sinteticasMap.has(key)) {
          sinteticasMap.set(key, String(nextCodMod++));
        }
        codMod = sinteticasMap.get(key);
      }

      let role = 'docente';
      let cargoNombre = 'Docente de Aula';

      if (rawCargo === 'DIRECTOR I.E.') {
        role = 'director_institucion';
        cargoNombre = 'Director';
      } else if (rawCargo === 'SUB-DIRECTOR I.E.') {
        cargoNombre = 'Subdirector';
      } else if (rawCargo === 'PROFESOR - IP') {
        cargoNombre = 'PIP';
      } else if (rawCargo === 'JEFE DE TALLER') {
        cargoNombre = 'Jefe de Taller';
      } else if (rawCargo === 'JEFE DE LABORATORIO') {
        cargoNombre = 'Jefe de Laboratorio';
      } else if (rawCargo === 'COORDINADOR DE TUTORIA Y DESARROLLO INTEGRAL' || rawCargo === 'DOCENTE COORDINADOR') {
        cargoNombre = 'Coordinador Pedagógico';
      }

      let especialidadNombre = null;
      if (levelNorm === 'Primaria') {
        especialidadNombre = parseEspecialidadPrimaria(rawCargo, especialidadRaw);
      } else if (levelNorm === 'Secundaria') {
        especialidadNombre = parseEspecialidadSecundaria(especialidadRaw);
      }

      const cleanFirst = nombres.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
      const cleanLast = patero.toLowerCase().replace(/[^a-z]/g, '');
      const email = `${cleanFirst}.${cleanLast}_${dni.slice(-4)}@ugel.gob.pe`;

      if (!nexusMap.has(dni)) {
        nexusMap.set(dni, {
          dni,
          firstName: nombres,
          lastName: apellidos,
          email,
          role,
          nivelEducativo: levelNorm,
          condicionLaboral: situacion.charAt(0).toUpperCase() + situacion.slice(1).toLowerCase(),
          cargaLaboral: jornada,
          institucionCodigoModular: codMod,
          cargoNombre,
          especialidad: especialidadNombre,
        });
      } else {
        const existing = nexusMap.get(dni);
        if (role === 'director_institucion') {
          existing.role = 'director_institucion';
          existing.institucionCodigoModular = codMod;
          existing.cargoNombre = 'Director';
        }
      }
    });
  });

  return Array.from(nexusMap.values());
}

async function limpiarPersonasPrevias() {
  console.log('[personas] Limpiando datos de personas, usuarios y registros anteriores...');
  await prisma.fichaRespuestaEjeItem.deleteMany({});
  await prisma.fichaRespuestaAspecto.deleteMany({});
  await prisma.fichaRespuestaDesempeno.deleteMany({});
  await prisma.fichaContexto.deleteMany({});
  await prisma.fichaMonitoreo.deleteMany({});
  await prisma.solicitudReprogramacion.deleteMany({});
  await prisma.solicitudVisita.deleteMany({});
  await prisma.notificacion.deleteMany({});
  await prisma.cronograma.deleteMany({});
  await prisma.planCoberturaIe.deleteMany({});
  await prisma.planMonitoreo.deleteMany({});
  await prisma.plantillaMonitoreo.deleteMany({});
  await prisma.docenteSeccion.deleteMany({});
  await prisma.docenteCurso.deleteMany({});
  await prisma.docenteCargo.deleteMany({});
  await prisma.docenteEspecialidad.deleteMany({});
  await prisma.docenteArea.deleteMany({});
  await prisma.asignacionEvaluador.deleteMany({});
  await prisma.docente.deleteMany({});
  await prisma.especialistaCargo.deleteMany({});
  await prisma.especialistaEspecialidad.deleteMany({});
  await prisma.especialista.deleteMany({});
  await prisma.sesionAuth.deleteMany({});
  await prisma.tokenRecuperacion.deleteMany({});
  await prisma.logAuditoria.deleteMany({});
  await prisma.usuario.deleteMany({});
  await prisma.persona.deleteMany({});
}

export async function seedPersonas(ctx) {
  console.log('[personas] Seeding personas y usuarios reales de UGEL Lampa...');

  await limpiarPersonasPrevias();

  const nexusUsers = cargarNexusPersonas();
  const todosLosUsuarios = [...UGEL_ADMIN_USERS, ...nexusUsers];
  console.log(`[personas] Total de usuarios a procesar: ${todosLosUsuarios.length} (${UGEL_ADMIN_USERS.length} Admin + ${nexusUsers.length} NEXUS)`);

  const passwordCache = new Map();
  const getPasswordHash = (dni) => {
    if (!passwordCache.has(dni)) {
      passwordCache.set(dni, bcrypt.hashSync(dni, 4));
    }
    return passwordCache.get(dni);
  };

  for (const u of todosLosUsuarios) {
    const rolId = ctx.roleMap[u.role];
    if (!rolId) {
      console.warn(`[personas] Rol '${u.role}' no encontrado para DNI ${u.dni}`);
      continue;
    }

    const hash = getPasswordHash(u.dni);

    const persona = await prisma.persona.upsert({
      where: { dni: u.dni },
      update: {
        nombres: u.firstName,
        apellidos: u.lastName,
        correo: u.email,
      },
      create: {
        dni: u.dni,
        nombres: u.firstName,
        apellidos: u.lastName,
        correo: u.email,
      },
    });

    await prisma.usuario.upsert({
      where: { personaId: persona.id },
      update: {
        rolId,
        passwordHash: hash,
        isActive: true,
        isFirstLogin: true,
      },
      create: {
        personaId: persona.id,
        rolId,
        passwordHash: hash,
        isActive: true,
        isFirstLogin: true,
      },
    });

    // 1. Especialista UGEL
    if (['especialista', 'jefe_area', 'jefe_gestion', 'director_ugel'].includes(u.role)) {
      const cargoEspecialista = u.role === 'jefe_area' ? 'Jefe de Área' : u.role === 'jefe_gestion' ? 'Jefe de Gestión' : 'Especialista';
      const esp = await prisma.especialista.upsert({
        where: { personaId: persona.id },
        update: {
          cargo: cargoEspecialista,
          nivelEducativo: u.nivelEducativo || 'Secundaria',
          condicionLaboral: 'Nombrado',
          cargaLaboral: 40,
          estado: 'Activo',
        },
        create: {
          personaId: persona.id,
          cargo: cargoEspecialista,
          nivelEducativo: u.nivelEducativo || 'Secundaria',
          condicionLaboral: 'Nombrado',
          cargaLaboral: 40,
          estado: 'Activo',
        },
      });

      if (u.especialidades && u.especialidades.length > 0) {
        for (const espNombre of u.especialidades) {
          const nivelId = ctx.nivelMap[u.nivelEducativo || 'Secundaria'];
          if (nivelId) {
            const espRecord = await prisma.especialidad.findFirst({
              where: { nombre: espNombre, nivelEducativoId: nivelId },
            });
            if (espRecord) {
              await prisma.especialistaEspecialidad.upsert({
                where: { especialistaId_especialidadId: { especialistaId: esp.id, especialidadId: espRecord.id } },
                update: {},
                create: { especialistaId: esp.id, especialidadId: espRecord.id, esPrincipal: true },
              });
            }
          }
        }
      }
    }

    // 2. Staff Docente / Directivo de IE
    if (u.role === 'director_institucion' || u.role === 'docente') {
      const instId = ctx.instMap[u.institucionCodigoModular];
      if (!instId) {
        console.warn(`[personas] IE con código modular '${u.institucionCodigoModular}' no existe en instMap`);
        continue;
      }

      const nivelDocente = await prisma.nivelEducativo.findFirst({
        where: { codigo: u.nivelEducativo || 'Secundaria', isActive: true },
      });

      const docente = await prisma.docente.upsert({
        where: { personaId: persona.id },
        update: {
          institucionId: instId,
          nivelEducativo: u.nivelEducativo || 'Secundaria',
          nivelEducativoId: nivelDocente?.id ?? null,
          modalidad: 'EBR',
          condicionLaboral: u.condicionLaboral || 'Nombrado',
          cargaLaboral: u.cargaLaboral ?? 40,
          estado: 'Activo',
        },
        create: {
          personaId: persona.id,
          institucionId: instId,
          nivelEducativo: u.nivelEducativo || 'Secundaria',
          nivelEducativoId: nivelDocente?.id ?? null,
          modalidad: 'EBR',
          gradoAcademico: 'Licenciado',
          condicionLaboral: u.condicionLaboral || 'Nombrado',
          cargaLaboral: u.cargaLaboral ?? 40,
          estado: 'Activo',
        },
      });

      if (u.especialidad && nivelDocente) {
        const espRecord = await prisma.especialidad.findFirst({
          where: { nombre: u.especialidad, nivelEducativoId: nivelDocente.id },
        });
        if (espRecord) {
          await prisma.docenteEspecialidad.upsert({
            where: { docenteId_especialidadId: { docenteId: docente.id, especialidadId: espRecord.id } },
            update: {},
            create: { docenteId: docente.id, especialidadId: espRecord.id },
          });
        }

        const cursoKey = `${u.especialidad}||${u.nivelEducativo || 'Secundaria'}`;
        const cursoId = ctx.cursoMap[cursoKey];
        if (cursoId) {
          await prisma.docenteCurso.upsert({
            where: { docenteId_cursoId: { docenteId: docente.id, cursoId } },
            update: {},
            create: { docenteId: docente.id, cursoId },
          });
        }
      }

      const cargoNombre = u.cargoNombre || (u.role === 'director_institucion' ? 'Director' : 'Docente de Aula');
      const cargoId = ctx.cargoMap[cargoNombre];
      if (cargoId) {
        const existing = await prisma.docenteCargo.findFirst({ where: { docenteId: docente.id, cargoId } });
        if (!existing) {
          await prisma.docenteCargo.create({
            data: { docenteId: docente.id, cargoId, fechaInicio: new Date() },
          });
        }
      }

      // Sincronizar Especialista para directivos/coordinadores (capacidad de monitorear)
      const isMonitor = ['Director', 'Subdirector', 'Coordinador Pedagógico', 'Jefe de Taller', 'Jefe de Laboratorio'].includes(cargoNombre);
      if (isMonitor) {
        await prisma.especialista.upsert({
          where: { personaId: persona.id },
          update: {
            cargo: cargoNombre,
            nivelEducativo: u.nivelEducativo || 'Secundaria',
            condicionLaboral: u.condicionLaboral || 'Nombrado',
            cargaLaboral: u.cargaLaboral ?? 40,
            estado: 'Activo',
            modalidad: 'EBR',
          },
          create: {
            personaId: persona.id,
            cargo: cargoNombre,
            nivelEducativo: u.nivelEducativo || 'Secundaria',
            condicionLaboral: u.condicionLaboral || 'Nombrado',
            cargaLaboral: u.cargaLaboral ?? 40,
            estado: 'Activo',
            modalidad: 'EBR',
          },
        });
      }
    }
  }

  // Backfill Fase 2: sync EspecialistaCargo y es_principal de DocenteCargo
  const especialistas = await prisma.especialista.findMany({ select: { id: true, cargo: true, createdAt: true } });
  for (const esp of especialistas) {
    const existing = await prisma.especialistaCargo.findFirst({
      where: { especialistaId: esp.id, fechaFin: null },
    });
    if (!existing) {
      await prisma.especialistaCargo.create({
        data: {
          id: randomUUID(),
          especialistaId: esp.id,
          cargo: esp.cargo,
          fechaInicio: esp.createdAt,
          fechaFin: null,
          esPrincipal: true,
        },
      });
    } else {
      await prisma.especialistaCargo.update({
        where: { id: existing.id },
        data: { cargo: esp.cargo, esPrincipal: true, fechaFin: null },
      });
    }
  }

  const prioridad = {
    'Director': 1,
    'Subdirector': 2,
    'Coordinador Pedagógico': 3,
    'Jefe de Taller': 4,
    'PIP': 5,
    'Docente de Aula': 6,
  };

  const docentesConCargos = await prisma.docente.findMany({
    include: {
      docenteCargos: {
        where: { fechaFin: null },
        include: { cargo: true },
      },
    },
  });
  for (const d of docentesConCargos) {
    if (d.docenteCargos.length === 0) continue;
    await prisma.docenteCargo.updateMany({
      where: { docenteId: d.id },
      data: { esPrincipal: false },
    });
    const sorted = d.docenteCargos
      .slice()
      .sort((a, b) => {
        const pa = prioridad[a.cargo.nombre] ?? 99;
        const pb = prioridad[b.cargo.nombre] ?? 99;
        if (pa !== pb) return pa - pb;
        return b.fechaInicio.getTime() - a.fechaInicio.getTime();
      });
    const principal = sorted[0];
    await prisma.docenteCargo.update({
      where: { id: principal.id },
      data: { esPrincipal: true },
    });
  }

  console.log(`[personas] ${todosLosUsuarios.length} personas sembradas exitosamente con datos reales de NEXUS.`);
}
