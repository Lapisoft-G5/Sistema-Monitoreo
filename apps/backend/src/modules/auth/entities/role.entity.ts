import { BaseEntity } from '../../../shared/types/base.entity.js';

export class Role extends BaseEntity {
  codigo!: string;
  nombre!: string;
  descripcion!: string | null;
  isActive!: boolean;
}
