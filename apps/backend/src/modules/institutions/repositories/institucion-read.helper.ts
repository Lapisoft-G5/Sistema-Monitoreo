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

  if (user?.role === RoleCode.JEFE_AREA) {
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
    data: data.map((record: any) => mapInstitucion(record)),
    total,
  };
}

export async function findById(
  prisma: PrismaService,
  id: string,
): Promise<Institucion | null> {
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
