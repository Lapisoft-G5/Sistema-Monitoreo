import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { NivelEducativoEBR, EspecialidadPrimaria } from '@sistema-monitoreo/shared-contracts';

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

          if (nivel === NivelEducativoEBR.PRIMARIA) {
            // Primaria -> Obligatoria y acotada a ['PIP', 'Educación Física']
            const validEspecialidades = Object.values(EspecialidadPrimaria) as string[];
            return typeof value === 'string' && validEspecialidades.includes(value);
          }

          // Otros niveles -> opcional/nula. Validamos que si llega, sea string o nulo.
          if (value !== undefined && value !== null) {
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

          if (nivel === NivelEducativoEBR.PRIMARIA) {
            const valid = Object.values(EspecialidadPrimaria).join(', ');
            return `Para el nivel Primaria, la especialidad es obligatoria y debe ser una de: ${valid}.`;
          }

          return 'Especialidad inválida para el nivel educativo.';
        },
      },
    });
  };
}
