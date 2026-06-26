import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { NivelEducativoEBR } from '@sistema-monitoreo/shared-contracts';

export function IsValidEspecialidadForNivel(
  propertyNivel: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidEspecialidadForNivel',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [propertyNivel],
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [string];
          const nivel = (args.object as Record<string, unknown>)[relatedPropertyName];

          if (nivel === NivelEducativoEBR.SECUNDARIA) {
            // Secundaria -> 100% obligatoria (cualquier string)
            return typeof value === 'string' && value.trim().length > 0;
          }

          // Otros niveles (Inicial, Primaria, etc.) -> opcional/nula.
          if (value !== undefined && value !== null && value !== '') {
            return typeof value === 'string';
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [string];
          const nivel = (args.object as Record<string, unknown>)[relatedPropertyName];

          if (nivel === NivelEducativoEBR.SECUNDARIA) {
            return 'Para el nivel Secundaria, la especialidad es obligatoria.';
          }

          return 'Especialidad inválida para el nivel educativo.';
        },
      },
    });
  };
}
