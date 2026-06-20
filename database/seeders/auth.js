import { prisma } from './_lib/prisma.js';

/**
 * Auth: roles, permisos y la matriz rol-permiso.
 *
 * Se siembra ANTES de personas porque cada usuario referencia un rolId.
 */

const ROLES = [
  { code: 'director_ugel', name: 'Director UGEL', description: 'Director de la UGEL Lampa' },
  { code: 'jefe_area', name: 'Jefe de Área', description: 'Jefe de Área de la UGEL' },
  { code: 'jefe_gestion', name: 'Jefe de Gestión', description: 'Jefe de Gestión de la UGEL Lampa' },
  { code: 'especialista', name: 'Especialista', description: 'Especialista de Monitoreo de la UGEL' },
  { code: 'director_institucion', name: 'Director de Institución', description: 'Director de Institución Educativa' },
  { code: 'coordinador_pedagogico', name: 'Coordinador Pedagógico', description: 'Coordinador Pedagógico de Secundaria' },
  { code: 'jefe_taller', name: 'Jefe de Taller', description: 'Jefe de Taller de Secundaria' },
  { code: 'docente', name: 'Docente', description: 'Docente de Aula' },
  { code: 'invitado', name: 'Invitado', description: 'Usuario de Consulta e Invitado' },
];

const PERMISOS = [
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

const ROL_PERMISOS = {
  director_ugel: ['dashboard:read', 'reports:read'],
  jefe_gestion: [
    'especialistas:read', 'especialistas:write', 'jefes_area:write', 'monitoreo:execute',
    'reports:read', 'directores:write', 'instituciones:read', 'instituciones:write',
    'docentes:read', 'docentes:write',
  ],
  jefe_area: [
    'directores:write', 'instituciones:read', 'instituciones:write', 'docentes:read', 'docentes:write',
  ],
  especialista: ['monitoreo:execute', 'reports:read'],
  director_institucion: ['docentes:read', 'docentes:write', 'reports:read', 'monitoreo:execute'],
  coordinador_pedagogico: ['docentes:read', 'reports:read', 'monitoreo:execute'],
  jefe_taller: ['docentes:read', 'reports:read', 'monitoreo:execute'],
  docente: ['reports:own'],
  invitado: [],
};

export async function seedAuth() {
  console.log('[auth] Seeding roles, permisos, rol_permisos...');

  const roleMap = {};
  for (const r of ROLES) {
    const role = await prisma.role.upsert({
      where: { codigo: r.code },
      update: { nombre: r.name, descripcion: r.description },
      create: { codigo: r.code, nombre: r.name, descripcion: r.description },
    });
    roleMap[r.code] = role.id;
  }

  const permisoMap = {};
  for (const p of PERMISOS) {
    const perm = await prisma.permiso.upsert({
      where: { codigo: p.codigo },
      update: { nombre: p.nombre, descripcion: p.descripcion },
      create: { codigo: p.codigo, nombre: p.nombre, descripcion: p.descripcion },
    });
    permisoMap[p.codigo] = perm.id;
  }

  for (const [roleCode, permCodes] of Object.entries(ROL_PERMISOS)) {
    const rolId = roleMap[roleCode];
    if (!rolId) continue;
    for (const permCode of permCodes) {
      const permisoId = permisoMap[permCode];
      if (!permisoId) continue;
      await prisma.rolPermiso.upsert({
        where: { rolId_permisoId: { rolId, permisoId } },
        update: {},
        create: { rolId, permisoId },
      });
    }
  }

  console.log(`[auth] ${ROLES.length} roles, ${PERMISOS.length} permisos listos.`);
  return { roleMap };
}
