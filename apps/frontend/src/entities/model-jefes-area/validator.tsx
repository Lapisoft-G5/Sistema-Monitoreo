import { z } from 'zod';

export const jefeAreaCreateSchema = z.object({
  nivelEducativo: z.enum(['Inicial', 'Primaria', 'Secundaria'], {
    message: 'Debe seleccionar un nivel educativo',
  }),
  specialistId: z.string().min(1, 'Debe seleccionar un especialista'),
});

export const jefeAreaEditSchema = z.object({
  nombres: z.string().min(2, 'Los nombres deben tener al menos 2 caracteres'),
  apellidos: z.string().min(2, 'Los apellidos deben tener al menos 2 caracteres'),
  dni: z
    .string()
    .length(8, 'El DNI debe tener exactamente 8 dígitos')
    .regex(/^\d+$/, 'El DNI solo debe contener números'),
  correo: z
    .string()
    .email('Debe ingresar un correo electrónico válido')
    .or(z.literal(''))
    .optional(),
  celular: z
    .string()
    .length(9, 'El número de celular debe tener exactamente 9 dígitos')
    .regex(/^9\d+$/, 'El celular debe iniciar con 9')
    .or(z.literal(''))
    .optional(),
  cargaHoraria: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z
      .number({ message: 'La carga horaria es requerida' })
      .min(10, 'Mínimo 10 horas')
      .max(60, 'Máximo 60 horas'),
  ),
  nivelEducativo: z.enum(['Inicial', 'Primaria', 'Secundaria'], {
    message: 'Debe seleccionar un nivel educativo',
  }),
  activo: z.boolean().optional(),
});

export type JefeAreaCreateFormData = z.infer<typeof jefeAreaCreateSchema>;
export type JefeAreaEditFormData = z.infer<typeof jefeAreaEditSchema>;

// Alias para compatibilidad hacia atrás
export type JefeAreaFormData = JefeAreaEditFormData;
export const jefeAreaSchema = jefeAreaEditSchema;
