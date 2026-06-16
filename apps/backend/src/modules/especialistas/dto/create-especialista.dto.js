var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  IsIn,
} from 'class-validator';
import {
  CargoEspecialista,
  CondicionLaboralEspecialista,
} from '@sistema-monitoreo/shared-contracts';
import { IsValidNivelForModalidad } from '../../../common/validators/modalidad-nivel.validator.js';
import { IsValidEspecialidadForNivel } from '../../../common/validators/especialidad.validator.js';
export class CreateEspecialistaDto {
  dni;
  nombres;
  apellidos;
  correo;
  telefono;
  cargo;
  modalidad;
  nivelEducativo;
  especialidad;
  rolCode;
  condicionLaboral;
  cargaLaboral;
  escalaMagisterial;
}
__decorate(
  [
    IsString(),
    IsNotEmpty(),
    Length(8, 8, { message: 'El DNI debe tener exactamente 8 caracteres' }),
    __metadata('design:type', String),
  ],
  CreateEspecialistaDto.prototype,
  'dni',
  void 0,
);
__decorate(
  [IsString(), IsNotEmpty(), __metadata('design:type', String)],
  CreateEspecialistaDto.prototype,
  'nombres',
  void 0,
);
__decorate(
  [IsString(), IsNotEmpty(), __metadata('design:type', String)],
  CreateEspecialistaDto.prototype,
  'apellidos',
  void 0,
);
__decorate(
  [IsEmail(), IsOptional(), __metadata('design:type', String)],
  CreateEspecialistaDto.prototype,
  'correo',
  void 0,
);
__decorate(
  [
    IsOptional(),
    IsString(),
    Length(9, 9, { message: 'El celular debe tener exactamente 9 dígitos' }),
    Matches(/^\d{9}$/, { message: 'El celular debe contener solo números' }),
    __metadata('design:type', String),
  ],
  CreateEspecialistaDto.prototype,
  'telefono',
  void 0,
);
__decorate(
  [
    IsString(),
    IsNotEmpty(),
    IsIn(Object.values(CargoEspecialista), {
      message: 'El cargo debe ser Especialista, Jefe de Área o Jefe de Gestión',
    }),
    __metadata('design:type', String),
  ],
  CreateEspecialistaDto.prototype,
  'cargo',
  void 0,
);
__decorate(
  [IsString(), IsNotEmpty(), __metadata('design:type', String)],
  CreateEspecialistaDto.prototype,
  'modalidad',
  void 0,
);
__decorate(
  [
    IsString(),
    IsNotEmpty(),
    IsValidNivelForModalidad('modalidad'),
    __metadata('design:type', String),
  ],
  CreateEspecialistaDto.prototype,
  'nivelEducativo',
  void 0,
);
__decorate(
  [IsValidEspecialidadForNivel('nivelEducativo'), __metadata('design:type', String)],
  CreateEspecialistaDto.prototype,
  'especialidad',
  void 0,
);
__decorate(
  [IsString(), IsNotEmpty(), __metadata('design:type', String)],
  CreateEspecialistaDto.prototype,
  'rolCode',
  void 0,
);
__decorate(
  [
    IsString(),
    IsOptional(),
    IsIn(CondicionLaboralEspecialista, {
      message: 'La condición laboral debe ser Encargado, Destacado o Designado',
    }),
    __metadata('design:type', String),
  ],
  CreateEspecialistaDto.prototype,
  'condicionLaboral',
  void 0,
);
__decorate(
  [IsInt(), IsOptional(), __metadata('design:type', Number)],
  CreateEspecialistaDto.prototype,
  'cargaLaboral',
  void 0,
);
__decorate(
  [IsInt(), IsOptional(), __metadata('design:type', Object)],
  CreateEspecialistaDto.prototype,
  'escalaMagisterial',
  void 0,
);
//# sourceMappingURL=create-especialista.dto.js.map
