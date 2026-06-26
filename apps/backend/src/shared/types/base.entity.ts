/**
 * Base entity con campos auditables comunes.
 * Las entidades de dominio deben extender esta clase para garantizar
 * consistencia en los campos de auditoría.
 */
export abstract class BaseEntity {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
