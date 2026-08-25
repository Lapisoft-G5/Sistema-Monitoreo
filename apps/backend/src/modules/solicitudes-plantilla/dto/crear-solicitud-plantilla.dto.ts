import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import {
  CargoBeneficiario,
  INSTRUMENTOS_SOLICITABLES,
  type TipoPlantilla,
} from '@sistema-monitoreo/shared-contracts';

/** Tope de plantillas por solicitud. Un pedido de veinte no es un pedido, es un catálogo. */
const MAX_ITEMS = 10;

export class ItemSolicitudPlantillaDto {
  @IsIn([...INSTRUMENTOS_SOLICITABLES])
  instrumento!: TipoPlantilla;

  @IsIn(Object.values(CargoBeneficiario))
  cargoBeneficiario!: CargoBeneficiario;

  @IsString()
  @MaxLength(300)
  descripcion!: string;
}

/**
 * Alta de la solicitud.
 *
 * No lleva `institucionId` ni `solicitanteId`: los dos salen de la sesión. Un
 * campo así en el cuerpo sería una invitación a presentar un pedido en nombre
 * de otra institución.
 *
 * El PDF viaja como archivo en la misma petición, no acá.
 *
 * ── Por qué hay transformaciones y no sólo validadores ──
 * La petición es `multipart/form-data`, porque lleva el PDF adjunto. Ese
 * formato transporta únicamente texto: el año llega como `"2026"` y los ítems
 * como una cadena JSON. Sin convertirlos primero, `@IsInt` y `@IsArray`
 * rechazarían datos correctos.
 */
export class CrearSolicitudPlantillaDto {
  @Type(() => Number)
  @IsInt()
  anioEscolar!: number;

  @Transform(({ value }): unknown => {
    if (typeof value !== 'string') return value;
    try {
      const parseado: unknown = JSON.parse(value);
      return parseado;
    } catch {
      // Devolver el texto sin tocar deja que `@IsArray` produzca el mensaje de
      // error, en vez de reventar acá con una traza de parseo.
      return value;
    }
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_ITEMS)
  @ValidateNested({ each: true })
  @Type(() => ItemSolicitudPlantillaDto)
  items!: ItemSolicitudPlantillaDto[];
}

export class ResolverSolicitudPlantillaDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comentario?: string;
}
