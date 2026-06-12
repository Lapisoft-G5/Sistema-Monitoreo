import { z } from 'zod';

export const especialistaSchema = z.object({
  nombres: z.string().min(2, 'Los nombres deben tener al menos 2 caracteres'),
  apellidos: z.string().min(2, 'Los apellidos deben tener al menos 2 caracteres'),
  dni: z.string().length(8, 'El DNI debe tener exactamente 8 dígitos').regex(/^\d+$/, 'El DNI solo debe contener números'),
  correo: z.string().email('Debe ingresar un correo electrónico válido'),
  celular: z.string().length(9, 'El número de celular debe tener exactamente 9 dígitos').regex(/^9\d+$/, 'El celular debe iniciar con 9'),
  especialidad: z.string().optional(),
  rol: z.enum(['especialista_admin', 'especialista_medio', 'especialista_bajo']),
  niveles: z.array(z.enum(['Inicial', 'Primaria', 'Secundaria'])).min(1, 'Debe seleccionar al menos un nivel educativo'),
  activo: z.boolean().optional(),
  cargaLaboral: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number().min(10, 'Mínimo 10 horas').max(60, 'Máximo 60 horas').optional()
  ).optional(),
});

export type EspecialistaFormData = z.infer<typeof especialistaSchema>;
