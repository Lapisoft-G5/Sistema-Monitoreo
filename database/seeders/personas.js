import { prisma } from './_lib/prisma.js';
import { randomUUID } from 'node:crypto';
import bcrypt from '../../apps/backend/node_modules/bcrypt/bcrypt.js';
import { validarDNI, validarEmail, validarEdadPlausible } from './_lib/helpers.js';

/**
 * Personas, usuarios, especialistas y docentes.
 *
 * Datos de calidad:
 * - DNI peruano valido (8 digitos, primer digito no 0 tipicamente)
 * - Emails patron nombre.apellido@ugel.gob.pe
 * - Fechas de nacimiento plausibles (25-65 anos)
 * - Nombres y apellidos peruanos realistas
 */

const USERS = [
  {
    dni: '40000001',
    firstName: 'Carlos',
    lastName: 'Mendoza Quispe',
    email: 'carlos.mendoza@ugel.gob.pe',
    role: 'director_ugel',
    fechaNacimiento: '1975-03-15',
  },
  {
    dni: '40000002',
    firstName: 'Maria Elena',
    lastName: 'Huaman Vargas',
    email: 'maria.huaman@ugel.gob.pe',
    role: 'jefe_gestion',
    fechaNacimiento: '1972-08-22',
    nivelEducativo: 'Secundaria',
    especialidad: 'Matematica',
  },
  {
    dni: '40000003',
    firstName: 'Jose Luis',
    lastName: 'Quispe Mamani',
    email: 'jose.quispe@ugel.gob.pe',
    role: 'jefe_area',
    fechaNacimiento: '1980-05-10',
    nivelEducativo: 'Secundaria',
    especialidad: 'Comunicacion',
  },
  {
    dni: '40000004',
    firstName: 'Ana Lucia',
    lastName: 'Ticona Coila',
    email: 'ana.ticona@ugel.gob.pe',
    role: 'especialista',
    fechaNacimiento: '1985-11-03',
    nivelEducativo: 'Primaria',
    especialidad: 'PIP',
  },
  {
    dni: '40000005',
    firstName: 'Pedro Pablo',
    lastName: 'Mamani Cruz',
    email: 'pedro.mamani@ugel.gob.pe',
    role: 'especialista',
    fechaNacimiento: '1982-07-19',
    nivelEducativo: 'Secundaria',
    especialidades: ['CTA', 'Ciencias Sociales'],
  },
  {
    dni: '41000000',
    firstName: 'Juan',
    lastName: 'Jefe CTA',
    email: 'juan.jefecta@ugel.gob.pe',
    role: 'jefe_area',
    fechaNacimiento: '1979-05-10',
    nivelEducativo: 'Secundaria',
    especialidades: ['CTA', 'Matematica'],
  },
  {
    dni: '41000001',
    firstName: 'Super',
    lastName: 'Jefe Gestion',
    email: 'super.gestion@ugel.gob.pe',
    role: 'jefe_gestion',
    fechaNacimiento: '1970-01-01',
    nivelEducativo: 'Secundaria',
    especialidad: 'Matematica',
  },
  {
    dni: '40000006',
    firstName: 'Rosa Maria',
    lastName: 'Apaza Condori',
    email: 'rosa.apaza@ugel.gob.pe',
    role: 'director_institucion',
    fechaNacimiento: '1978-02-28',
    institucionCodigoModular: '0200001',
    nivelEducativo: 'Secundaria',
    especialidad: 'Ciencias Sociales',
    secciones: [{ grado: '5.', seccion: 'A' }, { grado: '5.', seccion: 'B' }],
    condicionLaboral: 'Designado',
  },
  {
    dni: '40000007',
    firstName: 'Juan Carlos',
    lastName: 'Choque Huaranca',
    email: 'juan.choque@ugel.gob.pe',
    role: 'director_institucion',
    fechaNacimiento: '1980-09-14',
    institucionCodigoModular: '0200002',
    nivelEducativo: 'Primaria',
    secciones: [{ grado: '6.', seccion: 'A' }],
    condicionLaboral: 'Designado',
  },
  {
    dni: '40000008',
    firstName: 'Luz Marina',
    lastName: 'Pari Huayta',
    email: 'luz.pari@ugel.gob.pe',
    role: 'docente',
    fechaNacimiento: '1986-04-07',
    institucionCodigoModular: '0200001',
    nivelEducativo: 'Secundaria',
    curso: 'Matematica',
    secciones: [{ grado: '3.', seccion: 'A' }, { grado: '3.', seccion: 'B' }],
    condicionLaboral: 'Nombrado',
    cargaLaboral: 30,
    cargoNombre: 'Coordinador Pedagógico',
  },
  {
    dni: '40000009',
    firstName: 'Miguel Angel',
    lastName: 'Soto Ramos',
    email: 'miguel.soto@ugel.gob.pe',
    role: 'docente',
    fechaNacimiento: '1988-12-01',
    institucionCodigoModular: '0200001',
    nivelEducativo: 'Secundaria',
    curso: 'Comunicacion',
    secciones: [{ grado: '4.', seccion: 'A' }],
    condicionLaboral: 'Contratado',
    cargaLaboral: 24,
    cargoNombre: 'Jefe de Taller',
  },
  {
    dni: '40000010',
    firstName: 'Patricia',
    lastName: 'Mendoza Quispe',
    email: 'patricia.mendoza@ugel.gob.pe',
    role: 'docente',
    fechaNacimiento: '1990-06-25',
    institucionCodigoModular: '0200002',
    nivelEducativo: 'Primaria',
    curso: 'Personal Social',
    secciones: [{ grado: '2.', seccion: 'A' }],
    condicionLaboral: 'Contratado',
    cargaLaboral: 20,
  },
  {
    dni: '40000011',
    firstName: 'Roberto',
    lastName: 'Limachi Quispe',
    email: 'roberto.limachi@ugel.gob.pe',
    role: 'docente',
    fechaNacimiento: '1984-10-18',
    institucionCodigoModular: '0200004',
    nivelEducativo: 'Secundaria',
    curso: 'CTA',
    secciones: [{ grado: '5.', seccion: 'A' }],
    condicionLaboral: 'Nombrado',
    cargaLaboral: 30,
  },
  {
    dni: '40000012',
    firstName: 'Sandra',
    lastName: 'Ccopa Quispe',
    email: 'sandra.ccopa@ugel.gob.pe',
    role: 'docente',
    fechaNacimiento: '1989-03-30',
    institucionCodigoModular: '0200006',
    nivelEducativo: 'Secundaria',
    curso: 'Matematica',
    secciones: [{ grado: '4.', seccion: 'A' }, { grado: '4.', seccion: 'B' }],
    condicionLaboral: 'Nombrado',
    cargaLaboral: 30,
  },
  {
    dni: '40000013',
    firstName: 'Eduardo',
    lastName: 'Coila Mamani',
    email: 'eduardo.coila@ugel.gob.pe',
    role: 'docente',
    fechaNacimiento: '1987-08-12',
    institucionCodigoModular: '0200001',
    nivelEducativo: 'Primaria',
    curso: 'Matematica',
    secciones: [{ grado: '4.', seccion: 'A' }],
    condicionLaboral: 'Nombrado',
    cargaLaboral: 30,
  },
];

const ESPECIALISTA_CARGO_POR_ROL = {
  especialista: 'Especialista',
  jefe_area: 'Jefe de Área',
  jefe_gestion: 'Jefe de Gestión',
};

export async function seedPersonas(ctx) {
  console.log('[personas] Seeding personas, usuarios, especialistas y docentes...');
  const saltRounds = 10;

  for (const u of USERS) {
    const ctxStr = `${u.role}/${u.dni}`;
    validarDNI(u.dni, ctxStr);
    validarEmail(u.email, ctxStr);
    validarEdadPlausible(new Date(u.fechaNacimiento), ctxStr);

    let finalRole = u.role;
    if (u.cargoNombre === 'Coordinador Pedagógico') {
      finalRole = 'coordinador_pedagogico';
    } else if (u.cargoNombre === 'Jefe de Taller') {
      finalRole = 'jefe_taller';
    } else if (u.cargoNombre === 'Director') {
      finalRole = 'director_institucion';
    }

    const rolId = ctx.roleMap[finalRole];
    if (!rolId) {
      console.warn(`[personas] Rol '${finalRole}' no existe, saltando ${u.dni}`);
      continue;
    }

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

    const passwordHash = await bcrypt.hash(u.dni, saltRounds);
    await prisma.usuario.upsert({
      where: { personaId: persona.id },
      update: { rolId, passwordHash, isActive: true, isFirstLogin: true },
      create: {
        personaId: persona.id,
        rolId,
        passwordHash,
        isActive: true,
        isFirstLogin: true,
      },
    });

    if (ESPECIALISTA_CARGO_POR_ROL[u.role]) {
      const cargoEsp = ESPECIALISTA_CARGO_POR_ROL[u.role];
      const condicionLaboral = cargoEsp === 'Jefe de Gestión' ? 'Nombrado' : u.condicionLaboral || 'Encargado';

      await prisma.especialista.upsert({
        where: { personaId: persona.id },
        update: {
          cargo: cargoEsp,
          nivelEducativo: u.nivelEducativo || 'Secundaria',
          condicionLaboral,
          cargaLaboral: 40,
          estado: 'Activo',
          modalidad: 'EBR',
        },
        create: {
          personaId: persona.id,
          cargo: cargoEsp,
          nivelEducativo: u.nivelEducativo || 'Secundaria',
          condicionLaboral,
          cargaLaboral: 40,
          estado: 'Activo',
          modalidad: 'EBR',
        },
      });

      const especialidadesToSeed = u.especialidades || (u.especialidad ? [u.especialidad] : []);
      for (const espNombre of especialidadesToSeed) {
        const esp = await prisma.especialidad.findFirst({ where: { nombre: espNombre, isActive: true } });
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

    if (u.role === 'director_institucion' || u.role === 'docente') {
      const instId = u.institucionCodigoModular ? ctx.instMap[u.institucionCodigoModular] : null;
      if (!instId) {
        console.warn(`[personas] Institucion '${u.institucionCodigoModular}' no existe, saltando ${u.dni}`);
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
          modalidad: u.modalidad || 'EBR',
          gradoAcademico: 'Licenciado',
          estado: 'Activo',
          condicionLaboral: u.condicionLaboral || 'Nombrado',
          cargaLaboral: u.cargaLaboral ?? null,
        },
        create: {
          personaId: persona.id,
          institucionId: instId,
          nivelEducativo: u.nivelEducativo || 'Secundaria',
          nivelEducativoId: nivelDocente?.id ?? null,
          modalidad: u.modalidad || 'EBR',
          gradoAcademico: 'Licenciado',
          estado: 'Activo',
          condicionLaboral: u.condicionLaboral || 'Nombrado',
          cargaLaboral: u.cargaLaboral ?? null,
        },
      });

      if (u.curso) {
        const cursoKey = `${u.curso}||${u.nivelEducativo || 'Secundaria'}`;
        const cursoId = ctx.cursoMap[cursoKey];
        if (cursoId) {
          await prisma.docenteCurso.upsert({
            where: { docenteId_cursoId: { docenteId: docente.id, cursoId } },
            update: {},
            create: { docenteId: docente.id, cursoId },
          });
        } else {
          console.warn(`[personas] Curso '${u.curso}' para nivel '${u.nivelEducativo}' no existe, saltando`);
        }
      }

      if (u.secciones && u.secciones.length > 0) {
        for (const sec of u.secciones) {
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

      const cargoNombre = u.cargoNombre || (u.role === 'director_institucion' ? 'Director' : 'Docente de Aula');
      const cargoId = ctx.cargoMap[cargoNombre];
      if (cargoId) {
        const existing = await prisma.docenteCargo.findFirst({ where: { docenteId: docente.id, cargoId } });
        if (!existing) {
          await prisma.docenteCargo.create({
            data: { docenteId: docente.id, cargoId, fechaInicio: new Date() },
          });
        }
      } else {
        console.warn(`[personas] Cargo '${cargoNombre}' no existe, saltando DocenteCargo de ${u.dni}`);
      }

      // Sincronizar Especialista si el cargo requiere que actúe como monitor/evaluador
      const isMonitor = ['Director', 'Coordinador Pedagógico', 'Jefe de Taller'].includes(cargoNombre);
      if (isMonitor) {
        await prisma.especialista.upsert({
          where: { personaId: persona.id },
          update: {
            cargo: cargoNombre,
            nivelEducativo: u.nivelEducativo || 'Secundaria',
            condicionLaboral: u.condicionLaboral || 'Nombrado',
            cargaLaboral: u.cargaLaboral ?? (cargoNombre === 'Coordinador Pedagógico' ? 40 : 30),
            estado: 'Activo',
            modalidad: u.modalidad || 'EBR',
          },
          create: {
            personaId: persona.id,
            cargo: cargoNombre,
            nivelEducativo: u.nivelEducativo || 'Secundaria',
            condicionLaboral: u.condicionLaboral || 'Nombrado',
            cargaLaboral: u.cargaLaboral ?? (cargoNombre === 'Coordinador Pedagógico' ? 40 : 30),
            estado: 'Activo',
            modalidad: u.modalidad || 'EBR',
          },
        });
      }
    }
  }

  console.log(`[personas] ${USERS.length} usuarios listos.`);

  // ── Backfill Fase 2: EspecialistaCargo + es_principal en DocenteCargo ──
  // El migration SQL hace el backfill cuando se ejecuta sobre una BD vacia,
  // pero el seeder corre DESPUES. Re-ejecutamos aqui para asegurar el sync
  // con la data sembrada.

  // EspecialistaCargo: un registro activo por Especialista, espejando
  // `especialistas.cargo` con es_principal = true.
  const especialistas = await prisma.especialista.findMany({
    select: { id: true, cargo: true, createdAt: true },
  });
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

  // DocenteCargo.es_principal: el cargo activo de mayor prioridad por docente.
  const prioridad = {
    'Director': 1,
    'Subdirector': 2,
    'Coordinador Pedagógico': 3,
    'Jefe de Taller': 4,
    'PIP': 5,
    'Docente de Aula': 6,
  };
  const cargosAll = await prisma.cargo.findMany({ select: { id: true, nombre: true } });
  const cargoIdByNombre = new Map(cargosAll.map((c) => [c.nombre, c.id]));

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
    // Reset todos a false y marcar el de mayor prioridad
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

  console.log(
    `[personas] Backfill Fase 2: ${especialistas.length} EspecialistaCargo, ${docentesConCargos.length} docentes procesados.`,
  );
}
