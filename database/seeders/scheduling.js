import { prisma } from './_lib/prisma.js';
import { randomUUID } from 'node:crypto';

/**
 * Sprint 3: cronogramas (visitas) de ejemplo.
 * Crea UNA visita del primer especialista al primer docente
 * de la primera institucion, usando el plan UGEL.
 */

export async function seedScheduling(ctx) {
  console.log('[scheduling] Seeding cronograma de ejemplo...');
  if (!ctx.planUgelId) {
    console.log('[scheduling] Sin plan UGEL, saltando cronograma.');
    return;
  }

  const monitor = await prisma.especialista.findFirst();
  const primeraIe = await prisma.institucionEducativa.findFirst();
  if (!primeraIe) {
    console.log('[scheduling] Sin instituciones, saltando.');
    return;
  }
  const evaluado = await prisma.docente.findFirst({ where: { institucionId: primeraIe.id } });
  if (!monitor || !evaluado) {
    console.log('[scheduling] Sin monitor o evaluado, saltando.');
    return;
  }

  const fecha = new Date('2026-03-15');
  const existente = await prisma.cronograma.findFirst({
    where: { evaluadoId: evaluado.id, fechaProgramada: fecha },
  });
  if (existente) {
    console.log('  Cronograma DOCENTE 2026-03-15 09:00 ya existe.');
    return;
  }

  await prisma.cronograma.create({
    data: {
      id: randomUUID(),
      monitorId: monitor.id,
      institucionId: primeraIe.id,
      evaluadoId: evaluado.id,
      planId: ctx.planUgelId,
      tipoMonitoreo: 'DOCENTE',
      numeroVisita: 1,
      fechaProgramada: fecha,
      horaInicio: '09:00:00',
      detalles: 'Visita de monitoreo seed (sprint 3).',
      estado: 'PROGRAMADO',
      modalidad: 'EBR',
      nivelEducativo: 'Primaria',
    },
  });
  console.log('  Cronograma DOCENTE 2026-03-15 09:00 creado.');
}
