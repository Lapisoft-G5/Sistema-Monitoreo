import type {
  IMonitoringPlanResponse,
  IPlanInstitucionCubierta,
} from '@sistema-monitoreo/shared-contracts';
import type { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { Prisma } from '../../../generated/prisma/client.js';

type PlanMonitoreoPayload = Prisma.PlanMonitoreoGetPayload<{
  include: { institucion: { select: { nombre: true; codigoModular: true } } };
}>;

export async function fromPrismaPlan(
  prisma: PrismaService,
  plan: PlanMonitoreoPayload | any,
): Promise<IMonitoringPlanResponse> {
  const cobertura = await prisma.planCoberturaIe.findMany({
    where: { planId: plan.id },
    include: {
      institucion: {
        select: { id: true, nombre: true, codigoModular: true },
      },
    },
  });
  const institucionesCubiertas: IPlanInstitucionCubierta[] = cobertura.map((c) => ({
    institucionId: c.institucion.id,
    institucionNombre: c.institucion.nombre,
    institucionCodigoModular: c.institucion.codigoModular,
  }));

  return {
    id: plan.id,
    titulo: plan.titulo,
    anioAcademico: plan.anioAcademico,
    tipoEntidad: plan.tipoEntidad,
    archivoUrl: plan.archivoUrl,
    estado: plan.estado,
    autorId: plan.autorId ?? undefined,
    rolAutorAlCrear: plan.rolAutorAlCrear ?? undefined,
    institucionId: plan.institucionId ?? undefined,
    deleted: plan.deleted,
    deletedAt: plan.deletedAt ? plan.deletedAt.toISOString() : null,
    institucionesCubiertas,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
    institucion: plan.institucion
      ? {
          nombre: plan.institucion.nombre,
          codigoModular: plan.institucion.codigoModular,
        }
      : undefined,
  };
}
