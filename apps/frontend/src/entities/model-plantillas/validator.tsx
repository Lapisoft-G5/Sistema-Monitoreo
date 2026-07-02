import { z } from 'zod';

const nivelRomano = z.enum(['I', 'II', 'III', 'IV']);

export const plantillaSchema = z.object({
  tipoMonitoreo: z.string().min(3, 'El tipo de monitoreo es requerido'),
  anioAcademico: z
    .number()
    .int()
    .min(2020, 'Año inválido')
    .max(2100, 'Año inválido'),
  baremo: z.enum(['Vigente', 'Porcentual']),
  niveles: z
    .array(
      z.object({
        nivel: nivelRomano,
        denominacion: z.string().min(2, 'La denominación es requerida'),
        rangoMin: z.number().min(0, 'El rango mínimo no puede ser negativo'),
        color: z.string(),
      }),
    )
    .length(4, 'Debe definir los 4 niveles de la escala'),
  desempenos: z
    .array(
      z.object({
        id: z.string(),
        nombre: z.string().min(3, 'El nombre del desempeño es requerido'),
        descripcionCorta: z.string(),
        preguntaExtra: z.preprocess((v) => v ?? '', z.string()),
        aspectos: z.array(
          z.object({ id: z.string(), descripcion: z.string().min(1, 'Describe el aspecto') }),
        ),
        rubrica: z.array(z.object({ nivel: nivelRomano, descripcion: z.string() })),
      }),
    )
    .min(1, 'Agregue al menos un desempeño'),
});

export type PlantillaFormData = z.infer<typeof plantillaSchema>;
