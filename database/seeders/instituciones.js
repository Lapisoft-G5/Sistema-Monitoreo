import { readFileSync } from 'node:fs';
import { prisma } from './_lib/prisma.js';

/**
 * Instituciones educativas — datos REALES de la UGEL Lampa.
 *
 * Fuente: ies_completas_db.json (198 II.EE. con latitud/longitud reales).
 * Se normalizan modalidad (todo EBR) y nivel ("Inicial - Jardín" -> "Inicial"),
 * se descartan coordenadas atípicas (fuera de Lampa/Puno) y se importan por
 * upsert usando el codigoModular real.
 *
 * Como el seeder de personas engancha su staff demo a códigos ficticios
 * (0200001–0200012), se crea un ALIAS: cada código demo apunta a una IE real,
 * repartidas por distrito, para que el monitoreo demo caiga sobre IEs reales.
 */

const RUTA_JSON = new URL('../../ies_completas_db.json', import.meta.url);

// Códigos ficticios que personas.js referencia (cada uno recibe staff demo).
const CODIGOS_DEMO = [
  '0200001', '0200002', '0200003', '0200004', '0200005', '0200006',
  '0200007', '0200008', '0200009', '0200010', '0200011', '0200012',
];

const tituloCaso = (s) =>
  String(s)
    .toLowerCase()
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');

const normalizarNivel = (nivel) => {
  if (/inicial/i.test(nivel)) return 'Inicial';
  if (/primaria/i.test(nivel)) return 'Primaria';
  if (/secundaria/i.test(nivel)) return 'Secundaria';
  return nivel;
};

// Bounding box amplio de la provincia de Lampa (Puno) para descartar outliers.
const coordEnLampa = (lat, lng) =>
  typeof lat === 'number' &&
  typeof lng === 'number' &&
  lat >= -16.2 &&
  lat <= -14.8 &&
  lng >= -71.6 &&
  lng <= -69.9;

function cargarInstituciones() {
  const raw = JSON.parse(readFileSync(RUTA_JSON, 'utf-8'));
  return raw.map((x) => {
    const enLampa = coordEnLampa(x.latitud, x.longitud);
    return {
      codigoModular: String(x.codMod),
      codigoLocal: String(x.codLocal),
      nombre: String(x.nombreIE),
      nivelEducativo: normalizarNivel(x.nivel),
      modalidad: 'EBR',
      departamento: 'Puno',
      provincia: tituloCaso(x.provincia),
      distrito: tituloCaso(x.distrito),
      direccion: x.direccion || 'S/N',
      zona:
        String(x.cenPob).toUpperCase() === String(x.distrito).toUpperCase()
          ? 'Urbana'
          : 'Rural',
      estado: 'Activa',
      latitud: enLampa ? x.latitud : null,
      longitud: enLampa ? x.longitud : null,
    };
  });
}

export async function seedInstituciones() {
  console.log('[instituciones] Importando II.EE. reales de la UGEL Lampa...');
  const instituciones = cargarInstituciones();
  const instMap = {};
  let sinCoord = 0;

  for (const inst of instituciones) {
    const nivel = await prisma.nivelEducativo.findFirst({
      where: { codigo: inst.nivelEducativo, isActive: true },
    });
    if (inst.latitud === null) sinCoord += 1;

    const datos = {
      nombre: inst.nombre,
      codigoLocal: inst.codigoLocal,
      nivelEducativo: inst.nivelEducativo,
      nivelEducativoId: nivel?.id ?? null,
      modalidad: inst.modalidad,
      departamento: inst.departamento,
      provincia: inst.provincia,
      distrito: inst.distrito,
      direccion: inst.direccion,
      zona: inst.zona,
      estado: inst.estado,
      latitud: inst.latitud,
      longitud: inst.longitud,
    };

    const ie = await prisma.institucionEducativa.upsert({
      where: { codigoModular: inst.codigoModular },
      update: datos,
      create: { codigoModular: inst.codigoModular, ...datos },
    });
    instMap[inst.codigoModular] = ie.id;
  }

  // Alias: repartir los 12 códigos demo sobre IEs reales de distintos distritos,
  // para que el staff/monitoreo demo caiga sobre instituciones reales.
  const porDistrito = new Map();
  for (const inst of instituciones) {
    if (!porDistrito.has(inst.distrito)) porDistrito.set(inst.distrito, []);
    porDistrito.get(inst.distrito).push(inst.codigoModular);
  }
  const distritos = [...porDistrito.keys()];
  const objetivos = [];
  let ronda = 0;
  while (objetivos.length < CODIGOS_DEMO.length) {
    let agregoAlguno = false;
    for (const d of distritos) {
      const lista = porDistrito.get(d);
      if (ronda < lista.length) {
        objetivos.push(lista[ronda]);
        agregoAlguno = true;
        if (objetivos.length >= CODIGOS_DEMO.length) break;
      }
    }
    if (!agregoAlguno) break;
    ronda += 1;
  }
  CODIGOS_DEMO.forEach((codigoDemo, i) => {
    const real = objetivos[i];
    if (real) instMap[codigoDemo] = instMap[real];
  });

  console.log(
    `[instituciones] ${instituciones.length} II.EE. reales importadas ` +
      `(${sinCoord} sin coordenada válida). ${CODIGOS_DEMO.length} alias demo → IEs reales.`,
  );
  return { instMap };
}
