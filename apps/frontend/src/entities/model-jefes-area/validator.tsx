import { z } from 'zod';

export const jefeAreaSchema = z.object({
  nombres: z.string().min(2, 'Los nombres deben tener al menos 2 caracteres'),
  apellidos: z.string().min(2, 'Los apellidos deben tener al menos 2 caracteres'),
  dni: z
    .string()
    .length(8, 'El DNI debe tener exactamente 8 dígitos')
    .regex(/^\d+$/, 'El DNI solo debe contener números'),
  correo: z.string().email('Debe ingresar un correo electrónico válido'),
  celular: z
    .string()
    .length(9, 'El número de celular debe tener exactamente 9 dígitos')
    .regex(/^9\d+$/, 'El celular debe iniciar con 9'),
  cargaHoraria: z.number().int().min(1, 'La carga horaria debe ser mayor a 0'),
  nivelEducativo: z.enum(['INICIAL', 'PRIMARIA', 'SECUNDARIA'], {
    message: 'Debe seleccionar un nivel educativo',
  }),
  activo: z.boolean().optional(),
});

export type JefeAreaFormData = z.infer<typeof jefeAreaSchema>;
