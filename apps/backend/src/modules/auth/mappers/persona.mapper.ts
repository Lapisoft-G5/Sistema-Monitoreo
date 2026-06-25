import type { Persona as PrismaPersona } from '../../../generated/prisma/client.js';
import { Persona } from '../entities/persona.entity.js';

export function fromPrismaPersona(data: PrismaPersona): Persona {
  const entity = new Persona();
  entity.id = data.id;
  entity.dni = data.dni;
  entity.nombres = data.nombres;
  entity.apellidos = data.apellidos;
  entity.correo = data.correo;
  entity.telefono = data.telefono;
  entity.createdAt = data.createdAt;
  entity.updatedAt = data.updatedAt;
  return entity;
}

export function fromPrismaPersonaList(data: PrismaPersona[]): Persona[] {
  return data.map(fromPrismaPersona);
}
