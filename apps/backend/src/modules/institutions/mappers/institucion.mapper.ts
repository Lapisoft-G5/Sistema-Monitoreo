import type { InstitucionEducativa as PrismaInstitucion } from '../../../generated/prisma/client.js';
import { Institucion } from '../entities/institucion.entity.js';

export function fromPrismaInstitucion(data: PrismaInstitucion): Institucion {
  const entity = new Institucion();
  entity.id = data.id;
  entity.codigoModular = data.codigoModular;
  entity.codigoLocal = data.codigoLocal;
  entity.nombre = data.nombre;
  entity.nivelEducativo = data.nivelEducativo;
  entity.departamento = data.departamento;
  entity.provincia = data.provincia;
  entity.distrito = data.distrito;
  entity.direccion = data.direccion;
  entity.zona = data.zona;
  entity.estado = data.estado;
  entity.modalidad = data.modalidad;
  entity.nivelEducativoId = data.nivelEducativoId;
  entity.createdAt = data.createdAt;
  entity.updatedAt = data.updatedAt;
  return entity;
}

export function fromPrismaInstitucionList(data: PrismaInstitucion[]): Institucion[] {
  return data.map(fromPrismaInstitucion);
}
