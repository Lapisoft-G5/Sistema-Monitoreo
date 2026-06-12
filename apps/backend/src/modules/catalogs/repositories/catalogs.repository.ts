import { InstitucionEducativa, Cargo, Persona, Role } from '../../../generated/prisma/client.js';

export abstract class CatalogsRepository {
  abstract findInstitucionById(id: string): Promise<InstitucionEducativa | null>;
  abstract findCargoById(id: string): Promise<Cargo | null>;
  abstract findCargos(): Promise<Cargo[]>;
  abstract findRoleByCode(code: string): Promise<Role | null>;
  abstract findPersonaByDni(dni: string): Promise<Persona | null>;
  abstract findPersonaByEmail(email: string): Promise<Persona | null>;
  abstract findPersonaByEmailNotId(
    email: string,
    excludePersonaId: string,
  ): Promise<Persona | null>;
}
