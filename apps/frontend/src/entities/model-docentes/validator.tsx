import { z } from 'zod';
import type { Docente } from './model';

export const seccionDocenteSchema = z.object({
  id: z.string().optional(),
  grado: z.string().min(1, 'El grado es requerido'),
  seccion: z
    .string()
    .length(1, 'La sección debe ser de un solo carácter')
    .regex(/^[A-Za-z0-9]$/, 'La sección debe ser un carácter alfanumérico'),
});

export const docenteSchema = z.object({
  id: z.string().optional(),
  nombres: z.string().min(2, 'El nombre es requerido'),
  apellidos: z.string().min(2, 'Los apellidos son requeridos'),
  dni: z
    .string()
    .length(8, 'El DNI debe tener exactamente 8 dígitos')
    .regex(/^\d+$/, 'El DNI solo debe contener números'),
  correo: z.string().email('Formato de correo electrónico inválido'),
  celular: z
    .string()
    .regex(/^9\d{8}$/, 'Debe ser un número de celular de 9 dígitos (ej. 987654321)'),
  nivelEducativo: z.enum(['INICIAL', 'PRIMARIA', 'SECUNDARIA']),
  condicion: z.enum(['Nombrado', 'Contratado', 'Designado', 'Encargado', 'Por Función']),
  especialidad: z.string().optional().or(z.literal('')),
  cargaHoraria: z
    .number({ message: 'Debe ser un número' })
    .min(1, 'Carga horaria mínima es 1 hora')
    .max(40, 'Carga horaria máxima es 40 horas'),
  secciones: z.array(seccionDocenteSchema).default([]),
  escala: z.enum(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']),
  institucionId: z.string().min(1, 'La institución de destino es requerida'),
  activo: z.boolean().default(true),
  cargo: z.enum(['Director', 'Coordinador Pedagógico', 'Jefe de Taller', 'Docente de Aula']),
}).refine((data) => {
  if (data.nivelEducativo === 'SECUNDARIA' && (!data.especialidad || !data.especialidad.trim())) {
    return false;
  }
  return true;
}, {
  message: 'La especialidad es requerida para el nivel Secundaria',
  path: ['especialidad'],
});

export type DocenteFormData = z.infer<typeof docenteSchema>;

export const docenteValidator = {
  isDirector: (docente: Docente): boolean => {
    return docente.cargo === 'Director';
  },
  isActive: (docente: Docente): boolean => {
    return docente.activo;
  },
};

export const directorSchema = z.object({
  nombres: z.string().min(2, 'El nombre es requerido'),
  apellidos: z.string().min(2, 'Los apellidos son requeridos'),
  dni: z
    .string()
    .length(8, 'El DNI debe tener exactamente 8 dígitos')
    .regex(/^\d+$/, 'El DNI solo debe contener números'),
  correo: z.string().email('Formato de correo electrónico inválido'),
  celular: z
    .string()
    .regex(/^9\d{8}$/, 'Debe ser un número de celular de 9 dígitos (ej. 987654321)'),
  condicion: z.enum(['Designado', 'Encargado', 'Por Función']),
  escala: z.enum(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']),
  institucionId: z.string().min(1, 'La institución educativa es requerida'),
  nivelEducativo: z.enum(['INICIAL', 'PRIMARIA', 'SECUNDARIA'], {
    message: 'Debe seleccionar un nivel educativo',
  }),
  especialidad: z.string().min(3, 'La especialidad es requerida'),
  cargaHoraria: z
    .number({ message: 'Debe ser un número' })
    .min(1, 'Carga horaria mínima es 1 hora')
    .max(40, 'Carga horaria máxima es 40 horas'),
});

export type DirectorFormData = z.infer<typeof directorSchema>;
