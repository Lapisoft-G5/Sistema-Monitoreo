import { prisma } from './_lib/prisma.js';
import { randomUUID } from 'node:crypto';

/**
 * Instituciones educativas.
 *
 * Datos de calidad: codigoModular unico de 7 digitos (rango UGEL 02-Lampa:
 * 0200001-0299999), codigoLocal de 6 digitos, direccion real de Lampa/Puno,
 * niveles validos (Inicial/Primaria/Secundaria).
 */

const INSTITUCIONES = [
  {
    codigoModular: '0200001',
    codigoLocal: '020001',
    nombre: 'I.E. N. 70001 Nuestra Señora de la Asunción',
    nivelEducativo: 'Secundaria',
    modalidad: 'EBR',
    departamento: 'Puno',
    provincia: 'Lampa',
    distrito: 'Lampa',
    direccion: 'Jr. Lima 245, Plaza de Armas',
    zona: 'Urbana',
    estado: 'Activa',
  },
  {
    codigoModular: '0200002',
    codigoLocal: '020002',
    nombre: 'I.E. N. 70002 San Martin de Porres',
    nivelEducativo: 'Primaria',
    modalidad: 'EBR',
    departamento: 'Puno',
    provincia: 'Lampa',
    distrito: 'Lampa',
    direccion: 'Av. Sol 456',
    zona: 'Urbana',
    estado: 'Activa',
  },
  {
    codigoModular: '0200003',
    codigoLocal: '020003',
    nombre: 'I.E. N. 70003 Cuna Jardin',
    nivelEducativo: 'Inicial',
    modalidad: 'EBR',
    departamento: 'Puno',
    provincia: 'Lampa',
    distrito: 'Lampa',
    direccion: 'Jr. Ancash 123',
    zona: 'Urbana',
    estado: 'Activa',
  },
  {
    codigoModular: '0200004',
    codigoLocal: '020004',
    nombre: 'I.E. N. 70004 Jose Carlos Mariategui',
    nivelEducativo: 'Secundaria',
    modalidad: 'EBR',
    departamento: 'Puno',
    provincia: 'Lampa',
    distrito: 'Cabanilla',
    direccion: 'Plaza Principal s/n',
    zona: 'Rural',
    estado: 'Activa',
  },
  {
    codigoModular: '0200005',
    codigoLocal: '020005',
    nombre: 'I.E. N. 70005 Tupac Amaru II',
    nivelEducativo: 'Primaria',
    modalidad: 'EBR',
    departamento: 'Puno',
    provincia: 'Lampa',
    distrito: 'Cabanilla',
    direccion: 'Jr. Progreso 789',
    zona: 'Rural',
    estado: 'Activa',
  },
  {
    codigoModular: '0200006',
    codigoLocal: '020006',
    nombre: 'I.E. N. 70006 Cesar Vallejo',
    nivelEducativo: 'Secundaria',
    modalidad: 'EBR',
    departamento: 'Puno',
    provincia: 'Lampa',
    distrito: 'Palca',
    direccion: 'Av. Principal s/n',
    zona: 'Rural',
    estado: 'Activa',
  },
  {
    codigoModular: '0200007',
    codigoLocal: '020007',
    nombre: 'I.E. N. 70007 Horacio',
    nivelEducativo: 'Inicial',
    modalidad: 'EBR',
    departamento: 'Puno',
    provincia: 'Lampa',
    distrito: 'Palca',
    direccion: 'Jr. Union 321',
    zona: 'Rural',
    estado: 'Activa',
  },
  {
    codigoModular: '0200008',
    codigoLocal: '020008',
    nombre: 'I.E. N. 70008 Tecnico Industrial',
    nivelEducativo: 'Secundaria',
    modalidad: 'EBR',
    departamento: 'Puno',
    provincia: 'Lampa',
    distrito: 'Lampa',
    direccion: 'Av. Industrial Km 2',
    zona: 'Urbana',
    estado: 'Activa',
  },
  {
    codigoModular: '0200009',
    codigoLocal: '020009',
    nombre: 'CEBA San Luis de Alba',
    nivelEducativo: 'Avanzado',
    modalidad: 'EBA',
    departamento: 'Puno',
    provincia: 'Lampa',
    distrito: 'Lampa',
    direccion: 'Jr. Puno 101, Turno Noche',
    zona: 'Urbana',
    estado: 'Activa',
  },
  {
    codigoModular: '0200099',
    codigoLocal: '020099',
    nombre: 'CEBA San Luis de Alba - Inicial',
    nivelEducativo: 'Inicial-Intermedio',
    modalidad: 'EBA',
    departamento: 'Puno',
    provincia: 'Lampa',
    distrito: 'Lampa',
    direccion: 'Jr. Puno 101, Turno Noche',
    zona: 'Urbana',
    estado: 'Activa',
  },
  {
    codigoModular: '0200010',
    codigoLocal: '020010',
    nombre: 'CEBE Lampa',
    nivelEducativo: 'CEBE',
    modalidad: 'EBE',
    departamento: 'Puno',
    provincia: 'Lampa',
    distrito: 'Lampa',
    direccion: 'Av. Las Flores s/n',
    zona: 'Urbana',
    estado: 'Activa',
  },
  {
    codigoModular: '0200011',
    codigoLocal: '020011',
    nombre: 'CETPRO Lampa Productiva',
    nivelEducativo: 'Mecánica de Motos y Vehículos Afines',
    modalidad: 'CEPTRO',
    departamento: 'Puno',
    provincia: 'Lampa',
    distrito: 'Lampa',
    direccion: 'Av. Tecnologica 500',
    zona: 'Urbana',
    estado: 'Activa',
  },
  {
    codigoModular: '0200015',
    codigoLocal: '020015',
    nombre: 'CETPRO Lampa - Textil',
    nivelEducativo: 'Corte y Ensamblaje',
    modalidad: 'CEPTRO',
    departamento: 'Puno',
    provincia: 'Lampa',
    distrito: 'Lampa',
    direccion: 'Av. Tecnologica 500',
    zona: 'Urbana',
    estado: 'Activa',
  },
  {
    codigoModular: '0200012',
    codigoLocal: '020012',
    nombre: 'PRITE Semillitas de Amor',
    nivelEducativo: 'PRITE',
    modalidad: 'EBE',
    departamento: 'Puno',
    provincia: 'Lampa',
    distrito: 'Lampa',
    direccion: 'Jr. Grau 205',
    zona: 'Urbana',
    estado: 'Activa',
  }
];

const CODIGO_MODULAR_REGEX = /^\d{7}$/;
const CODIGO_LOCAL_REGEX = /^\d{6}$/;

export async function seedInstituciones() {
  console.log('[instituciones] Seeding instituciones educativas...');
  const instMap = {};

  for (const inst of INSTITUCIONES) {
    if (!CODIGO_MODULAR_REGEX.test(inst.codigoModular)) {
      console.warn(`[calidad] codigoModular "${inst.codigoModular}" no tiene 7 digitos`);
    }
    if (!CODIGO_LOCAL_REGEX.test(inst.codigoLocal)) {
      console.warn(`[calidad] codigoLocal "${inst.codigoLocal}" no tiene 6 digitos`);
    }

    const nivel = await prisma.nivelEducativo.findFirst({
      where: { codigo: inst.nivelEducativo, isActive: true },
    });

    const ie = await prisma.institucionEducativa.upsert({
      where: { codigoModular: inst.codigoModular },
      update: {
        nombre: inst.nombre,
        nivelEducativo: inst.nivelEducativo,
        nivelEducativoId: nivel?.id ?? null,
        modalidad: inst.modalidad,
        provincia: inst.provincia,
        distrito: inst.distrito,
        direccion: inst.direccion,
        zona: inst.zona,
        estado: inst.estado,
        codigoLocal: inst.codigoLocal,
      },
      create: {
        codigoModular: inst.codigoModular,
        codigoLocal: inst.codigoLocal,
        nombre: inst.nombre,
        nivelEducativo: inst.nivelEducativo,
        nivelEducativoId: nivel?.id ?? null,
        modalidad: inst.modalidad,
        departamento: inst.departamento,
        provincia: inst.provincia,
        distrito: inst.distrito,
        direccion: inst.direccion,
        zona: inst.zona,
        estado: inst.estado,
      },
    });
    instMap[inst.codigoModular] = ie.id;
  }

  console.log(`[instituciones] ${INSTITUCIONES.length} instituciones listas.`);
  return { instMap };
}
