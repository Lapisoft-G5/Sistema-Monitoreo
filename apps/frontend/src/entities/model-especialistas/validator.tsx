import { z } from 'zod';

export const especialistaSchema = z.object({
  nombres: z.string().min(2, 'Los nombres deben tener al menos 2 caracteres'),
  apellidos: z.string().min(2, 'Los apellidos deben tener al menos 2 caracteres'),
  dni: z.string().length(8, 'El DNI debe tener exactamente 8 dígitos').regex(/^\d+$/, 'El DNI solo debe contener números'),
  correo: z.string().email('Debe ingresar un correo electrónico válido'),
  celular: z.string().length(9, 'El número de celular debe tener exactamente 9 dígitos').regex(/^9\d+$/, 'El celular debe iniciar con 9'),
  especialidad: z.string().optional(),
  niveles: z.array(z.enum(['Inicial', 'Primaria', 'Secundaria'])).min(1, 'Debe seleccionar al menos un nivel educativo'),
  activo: z.boolean().optional(),
  condicionLaboral: z.enum(['Contratado', 'Nombrado'], { message: 'Debe seleccionar la condición laboral' }),
  cargaLaboral: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number({ message: 'La carga laboral es requerida' }).min(10, 'Mínimo 10 horas').max(60, 'Máximo 60 horas')
  ),
  escalaMagisterial: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number().min(1, 'Escala mínima es 1').max(8, 'Escala máxima es 8').optional()
  ).optional(),
});

export type EspecialistaFormData = z.infer<typeof especialistaSchema>;
