import { prisma } from './_lib/prisma.js';

/**
 * Auth: roles, permisos y la matriz rol-permiso.
 *
 * Se siembra ANTES de personas porque cada usuario referencia un rolId.
 */

const ROLES = [
  { code: 'admin', name: 'Administrador del sistema', description: 'Acceso total a la plataforma' },
  { code: 'jefe_gestion', name: 'Jefe de Gestion Pedagogica', description: 'Lidera la gestion pedagogica de la UGEL' },
  { code: 'jefe_area', name: 'Jefe de Area', description: 'Coordina un area curricular especifica' },
  { code: 'especialista', name: 'Especialista UGEL', description: 'Realiza visitas de monitoreo' },
  { code: 'director_institucion', name: 'Director de Institucion Educativa', description: 'Dirige una IE' },
  { code: 'docente', name: 'Docente de Aula', description: 'Docente evaluado' },
];

const PERMISOS = [
  { codigo: 'usuarios:crear', nombre: 'Crear usuarios', descripcion: 'Permite crear nuevos usuarios' },
  { codigo: 'usuarios:editar', nombre: 'Editar usuarios', descripcion: 'Permite editar usuarios existentes' },
  { codigo: 'usuarios:eliminar', nombre: 'Eliminar usuarios', descripcion: 'Permite eliminar usuarios' },
  { codigo: 'usuarios:listar', nombre: 'Listar usuarios', descripcion: 'Permite ver el listado de usuarios' },
  { codigo: 'planes:crear', nombre: 'Crear planes', descripcion: 'Permite crear planes de monitoreo' },
  { codigo: 'planes:editar', nombre: 'Editar planes', descripcion: 'Permite editar planes' },
  { codigo: 'planes:aprobar', nombre: 'Aprobar planes', descripcion: 'Permite aprobar planes' },
  { codigo: 'plantillas:crear', nombre: 'Crear plantillas', descripcion: 'Permite crear plantillas' },
  { codigo: 'plantillas:editar', nombre: 'Editar plantillas', descripcion: 'Permite editar plantillas' },
  { codigo: 'plantillas:publicar', nombre: 'Publicar plantillas', descripcion: 'Permite publicar plantillas' },
  { codigo: 'cronogramas:crear', nombre: 'Crear cronogramas', descripcion: 'Permite crear visitas' },
  { codigo: 'cronogramas:reprogramar', nombre: 'Reprogramar visitas', descripcion: 'Permite solicitar/aprobar reprogramaciones' },
  { codigo: 'fichas:llenar', nombre: 'Llenar fichas', descripcion: 'Permite registrar calificaciones' },
  { codigo: 'fichas:finalizar', nombre: 'Finalizar fichas', descripcion: 'Permite cerrar una ficha' },
  { codigo: 'reportes:ver', nombre: 'Ver reportes', descripcion: 'Permite ver reportes' },
  { codigo: 'reportes:exportar', nombre: 'Exportar reportes', descripcion: 'Permite exportar reportes' },
];

const ROL_PERMISOS = {
  admin: PERMISOS.map((p) => p.codigo),
  jefe_gestion: [
    'usuarios:listar',
    'planes:crear',
    'planes:editar',
    'planes:aprobar',
    'plantillas:crear',
    'plantillas:editar',
    'plantillas:publicar',
    'cronogramas:crear',
    'cronogramas:reprogramar',
    'fichas:llenar',
    'fichas:finalizar',
    'reportes:ver',
    'reportes:exportar',
  ],
  jefe_area: [
    'usuarios:listar',
    'planes:listar',
    'plantillas:listar',
    'cronogramas:crear',
    'fichas:llenar',
    'fichas:finalizar',
    'reportes:ver',
  ],
  especialista: [
    'usuarios:listar',
    'cronogramas:crear',
    'fichas:llenar',
    'fichas:finalizar',
    'reportes:ver',
  ],
  director_institucion: [
    'usuarios:listar',
    'planes:crear',
    'planes:editar',
    'plantillas:crear',
    'cronogramas:reprogramar',
    'reportes:ver',
  ],
  docente: ['reportes:ver'],
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
