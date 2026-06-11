import { z } from 'zod';
import type { Docente } from './model';

export const seccionDocenteSchema = z.object({
  id: z.string().optional(),
  grado: z.string().min(1, 'El grado y sección es requerido (ej: 4to A)'),
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
  condicion: z.enum(['Nombrado', 'Contratado']),
  especialidad: z.string().min(3, 'La especialidad es requerida'),
  cargaHoraria: z
    .number({ message: 'Debe ser un número' })
    .min(1, 'Carga horaria mínima es 1 hora')
    .max(40, 'Carga horaria máxima es 40 horas'),
  secciones: z.array(seccionDocenteSchema).default([]),
  escala: z.enum(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']),
  institucionId: z.string().min(1, 'La institución de destino es requerida'),
  activo: z.boolean().default(true),
  cargo: z.enum(['Director', 'Coordinador Pedagógico', 'Docente de Aula']),
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
  condicion: z.enum(['Asignado', 'Encargado', 'Por función']),
  escala: z.enum(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']),
  institucionId: z.string().min(1, 'La institución educativa es requerida'),
});

export type DirectorFormData = z.infer<typeof directorSchema>;
