/* eslint-disable @typescript-eslint/no-unused-vars */
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  AspectoInput,
  DesempenoInput,
  NivelCalificacionInput,
  EjeItemInput,
} from './create-plantilla.dto.js';

export class UpdatePlantillaDto {
  @IsOptional()
  @IsString()
  @IsIn(['Vigente', 'Porcentual'])
  baremo?: 'Vigente' | 'Porcentual';

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(4)
  @ValidateNested({ each: true })
  @Type(() => NivelCalificacionInput)
  niveles?: NivelCalificacionInput[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DesempenoInput)
  desempenos?: DesempenoInput[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EjeItemInput)
  ejeItems?: EjeItemInput[];
}

export class PatchEstadoPlantillaDto {
  @IsString()
  @IsIn(['Borrador', 'Vigente', 'Historico'])
  estado!: 'Borrador' | 'Vigente' | 'Historico';
}
