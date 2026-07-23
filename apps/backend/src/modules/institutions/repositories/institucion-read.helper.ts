import type { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { ScopeFilter, ScopeContext } from '../../../shared/auth/scope-filter.js';
import { QueryInstitucionDto } from '../dto/query-institucion.dto.js';
import { Institucion } from '../entities/institucion.entity.js';
import { Prisma } from '../../../generated/prisma/client.js';
import { JwtPayload } from '../../auth/services/auth-token.service.js';
import { RoleCode } from '../../../common/enums/role.enum.js';
import { mapInstitucion, INCLUDE_DOCENTE_DIRECTOR } from './institucion-mapper.helper.js';

function toScopeContext(user: JwtPayload): ScopeContext {
  return {
    userId: user.sub,
    role: user.role,
    institucionId: user.institucion_id,
    especialistaNivel: user.especialista_nivel,
  };
}

export async function findAll(
  prisma: PrismaService,
  scopeFilter: ScopeFilter,
  query: QueryInstitucionDto,
  user?: JwtPayload,
): Promise<{ data: Institucion[]; total: number }> {
  const { nombre, nivelEducativo, estado, limit = 10, offset = 0, modalidad } = query;
  const where: Prisma.InstitucionEducativaWhereInput = {};
  const andConditions: Prisma.InstitucionEducativaWhereInput[] = [];

  if (nombre) {
    andConditions.push({ nombre: { contains: nombre, mode: 'insensitive' } });
  }
  if (estado) {
    andConditions.push({ estado: { equals: estado } });
  }

  // Jefe de Área y Especialista ven solo las IE de su nivel. El ScopeContext aquí
  // no incluye especialidades a propósito: el LISTADO se acota por NIVEL (consulta
  // general), sin el filtro por especialidad que sí aplica el mapa de Focos de
  // Atención, para no ocultar IEs que el especialista necesita consultar.
  if (user?.role === RoleCode.JEFE_AREA || user?.role === RoleCode.ESPECIALISTA) {
    andConditions.push(scopeFilter.forInstitucion(toScopeContext(user)));
  }

  if (nivelEducativo) {
    andConditions.push({ nivelEducativo: { equals: nivelEducativo, mode: 'insensitive' } });
  }
  if (modalidad) {
    andConditions.push({ modalidad: { equals: modalidad } });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  const [data, total] = await prisma.$transaction([
    prisma.institucionEducativa.findMany({
      where,
      take: limit,
      skip: offset,
      include: INCLUDE_DOCENTE_DIRECTOR,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.institucionEducativa.count({ where }),
  ]);

  return {
    data: data.map((record) => mapInstitucion(record)),
    total,
  };
}

export async function findById(prisma: PrismaService, id: string): Promise<Institucion | null> {
  const record = await prisma.institucionEducativa.findUnique({
    where: { id },
    include: INCLUDE_DOCENTE_DIRECTOR,
  });
  if (!record) return null;
  return mapInstitucion(record);
}

export async function findByCodigoModular(
  prisma: PrismaService,
  codigoModular: string,
): Promise<Institucion | null> {
  const record = await prisma.institucionEducativa.findUnique({
    where: { codigoModular },
    include: INCLUDE_DOCENTE_DIRECTOR,
  });
  if (!record) return null;
  return mapInstitucion(record);
}

export async function getDashboardStats(
  prisma: PrismaService,
  scopeFilter: ScopeFilter,
  user?: JwtPayload,
) {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

  const baseWhere: Prisma.InstitucionEducativaWhereInput = { estado: 'Activa' };

  // Mismo criterio que findAll: Jefe de Área y Especialista acotados por nivel.
  if (user?.role === RoleCode.JEFE_AREA || user?.role === RoleCode.ESPECIALISTA) {
    baseWhere.AND = [scopeFilter.forInstitucion(toScopeContext(user))];
  }

  const total = await prisma.institucionEducativa.count({
    where: baseWhere,
  });

  const monitoreadas = await prisma.institucionEducativa.count({
    where: {
      ...baseWhere,
      cronogramas: {
        some: {
          estado: 'COMPLETADO',
          fechaProgramada: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
      },
    },
  });

  const pendientes = total - monitoreadas;
  const porcentaje = total > 0 ? Math.round((monitoreadas / total) * 100) : 0;

  return { total, monitoreadas, pendientes, porcentaje };
}
