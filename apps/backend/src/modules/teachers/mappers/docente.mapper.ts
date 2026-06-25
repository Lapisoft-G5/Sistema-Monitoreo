import type { Docente as PrismaDocente } from '../../../generated/prisma/client.js';
import { Docente } from '../entities/docente.entity.js';

export function fromPrismaDocente(data: PrismaDocente): Docente {
  const entity = new Docente();
  entity.id = data.id;
  entity.personaId = data.personaId;
  entity.institucionId = data.institucionId;
  entity.gradoAcademico = data.gradoAcademico;
  entity.nivelEducativo = data.nivelEducativo;
  entity.nivelEducativoId = data.nivelEducativoId;
  entity.escalaMagisterial = data.escalaMagisterial;
  entity.condicionLaboral = data.condicionLaboral;
  entity.estado = data.estado;
  entity.modalidad = data.modalidad;
  entity.cargaLaboral = data.cargaLaboral;
  entity.createdAt = data.createdAt;
  entity.updatedAt = data.updatedAt;
  return entity;
}

export function fromPrismaDocenteList(data: PrismaDocente[]): Docente[] {
  return data.map(fromPrismaDocente);
}
