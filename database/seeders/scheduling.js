import { prisma } from './_lib/prisma.js';
import { randomUUID } from 'node:crypto';

/**
 * Sprint 3: cronogramas (visitas) de ejemplo.
 *
 * Crea un set de cronogramas DIVERSO para que el frontend y los tests RLS
 * tengan data realista sin necesidad de crearlos a mano:
 *
 *   - 2 DOCENTE (visita 1 y 2) del mismo monitor sobre el mismo evaluado
 *     → valida que el sistema permite multiples cronogramas al mismo
 *       docente (numeroVisita 1-4) y dispara la regla "max 3 pendientes
 *       por especialista" si se intenta un 4to.
 *   - 1 DIRECTIVO del mismo monitor a un directivo de la primera IE
 *   - 1 DOCENTE COMPLETADO con su ficha de monitoreo (estado final) para
 *     que los reportes tengan data.
 *   - 1 DOCENTE EN_PROCESO pendiente del segundo monitor (Pedro Pablo),
 *     para que existan cronogramas de mas de un especialista.
 *
 * Se omiten los registros que ya existen (idempotente).
 */

const PENDIENTE_ESTADOS = ['PROGRAMADO', 'EN_PROCESO', 'REPROGRAMADO'];

/** Marcador para identificar (y hacer idempotente) el lote masivo de fichas. */
const BULK_MARKER = 'bulk-seed-ficha';
/** Cantidad objetivo de fichas finalizadas del lote masivo. */
const BULK_TARGET = 40;

/**
 * Deriva el nivel de logro a partir de un promedio (1.0–4.0) usando las bandas
 * del baremo (EDU-0009), con límites inclusivos para no caer en los gaps.
 */
function nivelDesdePromedio(p) {
  if (p <= 1.5) return 'INICIO';
  if (p <= 2.5) return 'EN_PROCESO';
  if (p <= 3.5) return 'LOGRO_ESPERADO';
  return 'LOGRO_DESTACADO';
}

export async function seedScheduling(ctx) {
  console.log('[scheduling] Seeding cronogramas de ejemplo...');
  if (!ctx.planUgelId) {
    console.log('[scheduling] Sin plan UGEL, saltando cronograma.');
    return;
  }

  const monitores = await prisma.especialista.findMany({
    orderBy: { createdAt: 'asc' },
    take: 2,
    include: { persona: { include: { usuario: true } } },
  });
  if (monitores.length < 2) {
    console.log('[scheduling] <2 especialistas, saltando cronograma.');
    return;
  }
  const monitorPrimaria = monitores[0];
  const monitorSecundaria = monitores[1];

  const primeraIe = await prisma.institucionEducativa.findFirst({
    where: {
      docentes: {
        some: { docenteCargos: { some: { cargo: { nombre: 'Docente de Aula' }, fechaFin: null } } },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
  if (!primeraIe) {
    console.log('[scheduling] Sin instituciones, saltando.');
    return;
  }

  // Docente "de aula" en la primera IE (o cualquier docente si no hay uno con ese cargo).
  const docenteDeLaIe = await prisma.docente.findFirst({
    where: {
      institucionId: primeraIe.id,
      docenteCargos: { some: { cargo: { nombre: 'Docente de Aula' } } },
    },
  });
  // Directivo: cualquier docente con cargo Director/Subdirector/Coordinador Pedagógico
  // (los directivos tambien son Docentes en este modelo, con cargo adicional).
  const directivoDeLaIe = await prisma.docente.findFirst({
    where: {
      institucionId: primeraIe.id,
      docenteCargos: {
        some: { cargo: { nombre: { in: ['Director', 'Subdirector', 'Coordinador Pedagógico', 'Jefe de Taller'] } } },
      },
    },
  });
  if (!docenteDeLaIe || !directivoDeLaIe) {
    console.log(
      `[scheduling] Sin docente o directivo en ${primeraIe.nombre} (id ${primeraIe.id.slice(0, 8)}). Necesita al menos un Docente de Aula y un Directivo.`,
    );
    return;
  }

  const plantillaDocente = await prisma.plantillaMonitoreo.findFirst({
    where: { tipoMonitoreo: 'DOCENTE', deleted: false },
  });
  const nivelesDocente = plantillaDocente
    ? await prisma.nivelCalificacion.findMany({ where: { plantillaId: plantillaDocente.id } })
    : [];

  const upsertCronograma = async (where, data) => {
    const existing = await prisma.cronograma.findFirst({ where });
    if (existing) {
      console.log(`  - ya existe: ${where.tipoMonitoreo} ${where.fechaProgramada?.toISOString?.()?.slice(0,10) ?? ''} (monitor ${where.monitorId?.slice(0,8)})`);
      return existing;
    }
    const created = await prisma.cronograma.create({ data: { id: randomUUID(), ...data } });
    console.log(`  + creado: ${data.tipoMonitoreo} ${data.estado} ${data.fechaProgramada.toISOString().slice(0,10)} ${data.horaInicio}`);
    return created;
  };

  // 1) DOCENTE visita 1 — PROGRAMADO (futuro)
  await upsertCronograma(
    { monitorId: monitorPrimaria.id, evaluadoId: docenteDeLaIe.id, fechaProgramada: new Date('2026-03-15') },
    {
      monitorId: monitorPrimaria.id,
      institucionId: primeraIe.id,
      evaluadoId: docenteDeLaIe.id,
      planId: ctx.planUgelId,
      tipoMonitoreo: 'DOCENTE',
      numeroVisita: 1,
      fechaProgramada: new Date('2026-03-15'),
      horaInicio: '09:00:00',
      detalles: 'Visita 1 seed.',
      estado: 'PROGRAMADO',
      modalidad: 'EBR',
      nivelEducativo: 'Primaria',
    },
  );

  // 2) DOCENTE visita 2 — mismo docente/director, para mostrar que el sistema
  //    permite multiples visitas (1-4 por docente segun la doc). PROGRAMADO.
  await upsertCronograma(
    { monitorId: monitorPrimaria.id, evaluadoId: docenteDeLaIe.id, fechaProgramada: new Date('2026-04-20') },
    {
      monitorId: monitorPrimaria.id,
      institucionId: primeraIe.id,
      evaluadoId: docenteDeLaIe.id,
      planId: ctx.planUgelId,
      tipoMonitoreo: 'DOCENTE',
      numeroVisita: 2,
      fechaProgramada: new Date('2026-04-20'),
      horaInicio: '10:00:00',
      detalles: 'Visita 2 seed.',
      estado: 'PROGRAMADO',
      modalidad: 'EBR',
      nivelEducativo: 'Primaria',
    },
  );

  // 3) DIRECTIVO — otro docente de la IE con cargo Director.
  await upsertCronograma(
    { monitorId: monitorPrimaria.id, evaluadoId: directivoDeLaIe.id, fechaProgramada: new Date('2026-05-10') },
    {
      monitorId: monitorPrimaria.id,
      institucionId: primeraIe.id,
      evaluadoId: directivoDeLaIe.id,
      planId: ctx.planUgelId,
      tipoMonitoreo: 'DIRECTIVO',
      numeroVisita: 1,
      fechaProgramada: new Date('2026-05-10'),
      horaInicio: '11:00:00',
      detalles: 'Visita directivo seed.',
      estado: 'PROGRAMADO',
      modalidad: 'EBR',
      nivelEducativo: 'Secundaria',
    },
  );

  // 4) DOCENTE COMPLETADO con ficha de monitoreo (necesita plantilla + niveles + desempenos).
  let fichaExistente = null;
  if (plantillaDocente && nivelesDocente.length > 0) {
    fichaExistente = await prisma.cronograma.findFirst({
      where: {
        monitorId: monitorPrimaria.id,
        evaluadoId: docenteDeLaIe.id,
        fechaProgramada: new Date('2026-02-05'),
      },
    });

    if (!fichaExistente) {
      const desempenos = await prisma.desempenoPlantilla.findMany({
        where: { plantillaId: plantillaDocente.id },
        orderBy: { orden: 'asc' },
      });
      const nivelesByOrden = [...nivelesDocente].sort((a, b) => a.orden - b.orden);
      const nivelesPorDesempeno = nivelesByOrden.length;
      const nivelesParaRespuestas = desempenos.length > 0
        ? nivelesPorDesempeno
        : 0;

      const promedio =
        nivelesParaRespuestas > 0
          ? (nivelesParaRespuestas / desempenos.length).toFixed(2)
          : '3.50';
      const puntajeTotal = nivelesParaRespuestas;
      const nivelLogro =
        Number(promedio) >= 3.6
          ? 'LOGRO_DESTACADO'
          : Number(promedio) >= 2.6
            ? 'LOGRO_ESPERADO'
            : Number(promedio) >= 1.6
              ? 'EN_PROCESO'
              : 'INICIO';

      const contexto = await prisma.fichaContexto.create({
        data: {
          id: randomUUID(),
          areaCurricular: 'Matematica',
          grado: '3.',
          seccion: 'A',
          cantidadEstudiantes: 30,
          cantidadEstudiantesNee: 1,
        },
      });

      const cronogramaCompletado = await prisma.cronograma.create({
        data: {
          id: randomUUID(),
          monitorId: monitorPrimaria.id,
          institucionId: primeraIe.id,
          evaluadoId: docenteDeLaIe.id,
          planId: ctx.planUgelId,
          tipoMonitoreo: 'DOCENTE',
          numeroVisita: 1,
          fechaProgramada: new Date('2026-02-05'),
          horaInicio: '08:00:00',
          detalles: 'Visita ya completada con ficha (seed).',
          estado: 'COMPLETADO',
          modalidad: 'EBR',
          nivelEducativo: 'Primaria',
        },
      });

      const usuarioId = monitorPrimaria.persona?.usuario?.id ?? null;
      const ficha = await prisma.fichaMonitoreo.create({
        data: {
          id: randomUUID(),
          cronogramaId: cronogramaCompletado.id,
          plantillaId: plantillaDocente.id,
          fichaContextoId: contexto.id,
          anioAcademico: 2026,
          puntajeTotal,
          promedio,
          nivelLogro,
          estado: 'FINALIZADO',
          creadoPorId: usuarioId,
          finalizadaPorId: usuarioId,
          // Hora final realista: ~2h después del inicio (08:00) de la visita.
          finalizadaAt: new Date('2026-02-05T10:00:00'),
          observaciones: 'Ficha seed completada.',
        },
      });

      for (const d of desempenos) {
        await prisma.fichaRespuestaDesempeno.create({
          data: {
            id: randomUUID(),
            fichaId: ficha.id,
            desempenoId: d.id,
            nivel: nivelesPorDesempeno,
          },
        });
      }
      console.log(`  + creado: DOCENTE COMPLETADO con ficha (id=${ficha.id.slice(0,8)}).`);
    } else {
      console.log('  - ya existe: DOCENTE COMPLETADO 2026-02-05');
    }
  } else {
    console.log('  - sin plantilla DOCENTE, no se creo COMPLETADO con ficha.');
  }

  // 5) DOCENTE EN_PROCESO pendiente del SEGUNDO monitor (Pedro Pablo) en
  //    otra institucion. Asi tenemos cronogramas de mas de un especialista.
  const segundaIe = await prisma.institucionEducativa.findFirst({
    where: { id: { not: primeraIe.id }, docentes: { some: {} } },
    orderBy: { createdAt: 'asc' },
  });
  if (segundaIe) {
    const docente2 = await prisma.docente.findFirst({
      where: { institucionId: segundaIe.id },
    });
    if (docente2) {
      const yaExiste = await prisma.cronograma.findFirst({
        where: {
          monitorId: monitorSecundaria.id,
          evaluadoId: docente2.id,
          fechaProgramada: new Date('2026-03-25'),
        },
      });
      if (!yaExiste) {
        const cronogramaSec = await prisma.cronograma.create({
          data: {
            id: randomUUID(),
            monitorId: monitorSecundaria.id,
            institucionId: segundaIe.id,
            evaluadoId: docente2.id,
            planId: ctx.planUgelId,
            tipoMonitoreo: 'DOCENTE',
            numeroVisita: 1,
            fechaProgramada: new Date('2026-03-25'),
            horaInicio: '09:30:00',
            detalles: 'Visita 1 seed (segundo monitor, segunda IE).',
            estado: 'EN_PROCESO',
            modalidad: 'EBR',
            nivelEducativo: 'Secundaria',
          },
        });
        
        await prisma.solicitudReprogramacion.create({
          data: {
            id: randomUUID(),
            cronogramaId: cronogramaSec.id,
            solicitanteId: monitorSecundaria.persona.usuario.id,
            solicitanteRolAlCrear: 'especialista',
            fechaOriginal: new Date('2026-03-25'),
            horaOriginal: '09:30:00',
            fechaPropuesta: new Date('2026-04-05'),
            horaPropuesta: '10:00:00',
            justificacion: 'Choque de horarios con otra institucion',
            archivoSustentoUrl: 'https://example.com/sustento.pdf',
            estado: 'PENDIENTE',
          }
        });
        console.log('  + creado: DOCENTE EN_PROCESO del segundo monitor con Solicitud de Reprogramacion PENDIENTE.');
      } else {
        console.log('  - ya existe: DOCENTE EN_PROCESO 2026-03-25');
      }
    }
  }

  // 6) LOTE MASIVO: ~40 fichas FINALIZADAS repartidas en varias IEs y bandas,
  //    para que el dashboard del Director UGEL muestre data representativa
  //    (KPIs, semáforo con las 3 categorías y tabla de recientes).
  if (plantillaDocente) {
    const yaBulk = await prisma.fichaMonitoreo.count({ where: { observaciones: BULK_MARKER } });
    if (yaBulk >= BULK_TARGET) {
      console.log(`  - lote masivo ya existe (${yaBulk} fichas), saltando.`);
    } else {
      const desempenos = await prisma.desempenoPlantilla.findMany({
        where: { plantillaId: plantillaDocente.id },
        orderBy: { orden: 'asc' },
      });
      // Promedio base por IE (ciclando por bandas): así cada IE cae de forma
      // limpia en una categoría del semáforo y el conjunto cubre las 3.
      const basesPorIe = [1.2, 3.8, 2.1, 3.2, 1.4, 2.9, 4.0, 1.3, 2.4, 3.4, 2.0, 3.7, 1.5, 3.0];
      const ies = await prisma.institucionEducativa.findMany({ orderBy: { codigoModular: 'asc' } });

      let creadas = 0;
      let idx = 0;
      for (let i = 0; i < ies.length && creadas < BULK_TARGET; i++) {
        const ie = ies[i];
        const base = basesPorIe[i % basesPorIe.length];
        const docentesIe = await prisma.docente.findMany({
          where: { institucionId: ie.id },
          take: 3,
        });
        for (const doc of docentesIe) {
          if (creadas >= BULK_TARGET) break;
          const promedio = base;
          const nivelLogro = nivelDesdePromedio(promedio);
          const nivelResp = Math.max(1, Math.min(4, Math.round(promedio)));
          const monitor = monitores[idx % monitores.length];
          const usuarioId = monitor.persona?.usuario?.id ?? null;
          const fecha = new Date(2026, 0, 1 + idx);

          const contexto = await prisma.fichaContexto.create({
            data: {
              id: randomUUID(),
              areaCurricular: 'Matematica',
              grado: '3.',
              seccion: 'A',
              cantidadEstudiantes: 25,
              cantidadEstudiantesNee: 0,
            },
          });
          const crono = await prisma.cronograma.create({
            data: {
              id: randomUUID(),
              monitorId: monitor.id,
              institucionId: ie.id,
              evaluadoId: doc.id,
              planId: ctx.planUgelId,
              tipoMonitoreo: 'DOCENTE',
              numeroVisita: 1,
              fechaProgramada: fecha,
              horaInicio: '08:00:00',
              detalles: BULK_MARKER,
              estado: 'COMPLETADO',
              modalidad: ie.modalidad ?? 'EBR',
              nivelEducativo: ie.nivelEducativo ?? 'Primaria',
            },
          });
          const ficha = await prisma.fichaMonitoreo.create({
            data: {
              id: randomUUID(),
              cronogramaId: crono.id,
              plantillaId: plantillaDocente.id,
              fichaContextoId: contexto.id,
              anioAcademico: 2026,
              puntajeTotal: nivelResp * Math.max(desempenos.length, 1),
              promedio: promedio.toFixed(2),
              nivelLogro,
              estado: 'FINALIZADO',
              creadoPorId: usuarioId,
              finalizadaPorId: usuarioId,
              observaciones: BULK_MARKER,
              // Hora final realista: ~2h después del inicio (08:00), no medianoche.
              finalizadaAt: new Date(2026, 0, 1 + idx, 10, 0, 0),
            },
          });
          for (const d of desempenos) {
            await prisma.fichaRespuestaDesempeno.create({
              data: { id: randomUUID(), fichaId: ficha.id, desempenoId: d.id, nivel: nivelResp },
            });
          }
          creadas += 1;
          idx += 1;
        }
      }
      console.log(`  + lote masivo: ${creadas} fichas FINALIZADAS creadas en varias IEs y bandas.`);
    }
  }

  // Resumen
  const total = await prisma.cronograma.count();
  const porEstado = await prisma.cronograma.groupBy({
    by: ['estado'],
    _count: { _all: true },
  });
  console.log(`[scheduling] Total cronogramas: ${total}`);
  for (const e of porEstado) {
    console.log(`  ${e.estado}: ${e._count._all}`);
  }
}
