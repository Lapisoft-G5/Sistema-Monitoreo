import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { ModalidadEducativa, MODALIDAD_NIVEL_MAP } from '@sistema-monitoreo/shared-contracts';

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

          if (modalidad === ModalidadEducativa.CEPTRO) {
            // For CEPTROs, any non-empty string is valid (texto libre)
            return typeof value === 'string' && value.trim().length > 0;
          }

          const validNiveles = MODALIDAD_NIVEL_MAP[modalidad];
          if (!validNiveles) {
            return false; // Unknown modality
          }

          return validNiveles.includes(value as string);
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [string];
          const modalidad = (args.object as Record<string, unknown>)[relatedPropertyName] as string;

          if (modalidad === ModalidadEducativa.CEPTRO) {
            return 'El nivel educativo debe ser un texto válido para CEPTROs';
          }

          const validNiveles = MODALIDAD_NIVEL_MAP[modalidad] || [];
          return `Para la modalidad ${modalidad}, el nivel educativo debe ser uno de: ${validNiveles.join(', ')}`;
        },
      },
    });
  };
}
