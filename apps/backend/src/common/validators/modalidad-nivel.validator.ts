import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { MODALIDAD_NIVEL_MAP } from '@sistema-monitoreo/shared-contracts';

export function IsValidNivelForModalidad(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidNivelForModalidad',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [string];
          const modalidad = (args.object as Record<string, unknown>)[relatedPropertyName] as string;

          if (!modalidad || !value) return true; // Let other validators handle emptiness if needed

          const validNiveles = MODALIDAD_NIVEL_MAP[modalidad];
          if (!validNiveles) {
            return false; // Unknown modality
          }

          return validNiveles.includes(value as string);
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [string];
          const modalidad = (args.object as Record<string, unknown>)[relatedPropertyName] as string;

          const validNiveles = MODALIDAD_NIVEL_MAP[modalidad] || [];
          return `Para la modalidad ${modalidad}, el nivel educativo debe ser uno de: ${validNiveles.join(', ')}`;
        },
      },
    });
  };
}
