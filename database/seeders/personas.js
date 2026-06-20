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
    especialidad: 'CTA',
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
    condicionLaboral: 'Nombrado',
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
    condicionLaboral: 'Nombrado',
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

    const rolId = ctx.roleMap[u.role];
    if (!rolId) {
      console.warn(`[personas] Rol '${u.role}' no existe, saltando ${u.dni}`);
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
      update: { rolId, isActive: true },
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

      if (u.especialidad) {
        const esp = await prisma.especialidad.findFirst({ where: { nombre: u.especialidad, isActive: true } });
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
    }
  }

  console.log(`[personas] ${USERS.length} usuarios listos.`);
}
