import type { Especialista as PrismaEspecialista } from '../../../generated/prisma/client.js';
import { Especialista } from '../entities/especialista.entity.js';

export function fromPrismaEspecialista(data: PrismaEspecialista): Especialista {
  const entity = new Especialista();
  entity.id = data.id;
  entity.personaId = data.personaId;
  entity.cargo = data.cargo;
  entity.nivelEducativo = data.nivelEducativo;
  entity.condicionLaboral = data.condicionLaboral;
  entity.cargaLaboral = data.cargaLaboral;
  entity.estado = data.estado;
  entity.modalidad = data.modalidad;
  entity.escalaMagisterial = data.escalaMagisterial;
  entity.createdAt = data.createdAt;
  entity.updatedAt = data.updatedAt;
  return entity;
}

export function fromPrismaEspecialistaList(data: PrismaEspecialista[]): Especialista[] {
  return data.map(fromPrismaEspecialista);
}
