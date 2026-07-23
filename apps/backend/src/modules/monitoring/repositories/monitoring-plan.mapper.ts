import type {
  IMonitoringPlanResponse,
  IPlanInstitucionCubierta,
} from '@sistema-monitoreo/shared-contracts';
import type { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { Prisma } from '../../../generated/prisma/client.js';

// La relación `institucion` solo se incluye en algunas consultas; por eso es
// opcional. El mapper ya contempla su ausencia en tiempo de ejecución.
export type PlanMonitoreoPayload = Prisma.PlanMonitoreoGetPayload<object> & {
  institucion?: { nombre: string; codigoModular: string } | null;
  autor?: { persona?: { nombres: string; apellidos: string } | null } | null;
};

export async function fromPrismaPlan(
  prisma: PrismaService,
  plan: PlanMonitoreoPayload,
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
    autorNombre: plan.autor?.persona
      ? `${plan.autor.persona.nombres} ${plan.autor.persona.apellidos}`.trim()
      : undefined,
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
