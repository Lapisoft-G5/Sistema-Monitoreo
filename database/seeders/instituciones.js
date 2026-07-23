import { readFileSync } from 'node:fs';
import { prisma } from './_lib/prisma.js';

/**
 * Instituciones educativas — datos REALES de la UGEL Lampa.
 *
 * Fuente:
 * 1. ies_completas_db.json (198 II.EE. con latitud/longitud reales).
 * 2. NEXUS_SISTEMA_MONITOREO-inicial.json, primaria.json, secundaria.json
 *    (II.EE. adicionales como PRONOEI o sedes de coordinación).
 */

const RUTA_IES = new URL('./data/ies_completas_db.json', import.meta.url);
const RUTA_INICIAL = new URL('./data/NEXUS_SISTEMA_MONITOREO-inicial.json', import.meta.url);
const RUTA_PRIMARIA = new URL('./data/NEXUS_SISTEMA_MONITOREO-primaria.json', import.meta.url);
const RUTA_SECUNDARIA = new URL('./data/NEXUS_SISTEMA_MONITOREO-secundaria.json', import.meta.url);

const CODIGOS_DEMO = [
  '0200001', '0200002', '0200003', '0200004', '0200005', '0200006',
  '0200007', '0200008', '0200009', '0200010', '0200011', '0200012',
];

const tituloCaso = (s) =>
  String(s || '')
    .toLowerCase()
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');

const normalizarNivel = (nivel) => {
  if (/inicial/i.test(nivel)) return 'Inicial';
  if (/primaria/i.test(nivel)) return 'Primaria';
  if (/secundaria/i.test(nivel)) return 'Secundaria';
  return nivel || 'Inicial';
};

const norm = (str) =>
  String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractNumber = (str) => {
  const match = String(str || '').match(/\b\d+\b/);
  return match ? match[0] : null;
};

// Bounding box amplio de la provincia de Lampa (Puno) para descartar outliers.
const coordEnLampa = (lat, lng) =>
  typeof lat === 'number' &&
  typeof lng === 'number' &&
  lat >= -16.2 &&
  lat <= -14.8 &&
  lng >= -71.6 &&
  lng <= -69.9;

function cargarTodasInstituciones() {
  const rawIes = JSON.parse(readFileSync(RUTA_IES, 'utf-8'));
  const listaBase = rawIes.map((x) => {
    const enLampa = coordEnLampa(x.latitud, x.longitud);
    return {
      codigoModular: String(x.codMod),
      codigoLocal: String(x.codLocal),
      nombre: String(x.nombreIE).trim(),
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
      isSynthetic: false,
    };
  });

  const ieListMapped = listaBase.map((ie) => ({
    ...ie,
    normNombre: norm(ie.nombre),
    normDistrito: norm(ie.distrito),
    num: extractNumber(ie.nombre),
  }));

  const nexusFiles = [RUTA_INICIAL, RUTA_PRIMARIA, RUTA_SECUNDARIA];
  const sinteticasMap = new Map();
  let nextCodMod = 9900001;

  nexusFiles.forEach((fileUrl) => {
    const data = JSON.parse(readFileSync(fileUrl, 'utf-8'));
    data.forEach((r) => {
      const rawName = String(r['NOMBRE DE LA INSTITUCION EDUCATIVA'] || '');
      const rawDist = String(r['DISTRITO'] || '');
      const rawNivel = String(r['NIVEL EDUCATIVO'] || '');

      const normName = norm(rawName);
      const normDist = norm(rawDist);
      const num = extractNumber(rawName);
      const levelNorm = normalizarNivel(rawNivel);

      // Intento de match con IEs base
      let found = ieListMapped.find((ie) => ie.normDistrito === normDist && ie.normNombre === normName);

      if (!found && num) {
        found = ieListMapped.find((ie) => ie.normDistrito === normDist && ie.nivelEducativo === levelNorm && ie.num === num);
      }
      if (!found && num) {
        const candidates = ieListMapped.filter((ie) => ie.nivelEducativo === levelNorm && ie.num === num);
        if (candidates.length === 1) found = candidates[0];
      }
      if (!found) {
        found = ieListMapped.find(
          (ie) =>
            ie.normDistrito === normDist &&
            ie.nivelEducativo === levelNorm &&
            (ie.normNombre.includes(normName) || normName.includes(ie.normNombre)),
        );
      }
      if (!found) {
        found = ieListMapped.find((ie) => ie.nivelEducativo === levelNorm && ie.normNombre === normName);
      }

      if (!found) {
        const key = `${normDist}|${normName}|${levelNorm}`;
        if (!sinteticasMap.has(key)) {
          sinteticasMap.set(key, {
            codigoModular: String(nextCodMod++),
            codigoLocal: String(Math.floor(100000 + Math.random() * 900000)),
            nombre: rawName.trim().toUpperCase(),
            nivelEducativo: levelNorm,
            modalidad: 'EBR',
            departamento: 'Puno',
            provincia: 'Lampa',
            distrito: tituloCaso(rawDist),
            direccion: 'S/N',
            zona: 'Rural',
            estado: 'Activa',
            latitud: null,
            longitud: null,
            isSynthetic: true,
          });
        }
      }
    });
  });

  return [...listaBase, ...Array.from(sinteticasMap.values())];
}

export async function seedInstituciones() {
  console.log('[instituciones] Importando II.EE. reales de la UGEL Lampa (incluyendo datos NEXUS)...');
  const instituciones = cargarTodasInstituciones();
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

  // Alias demo para asegurar compatibilidad
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
    `[instituciones] ${instituciones.length} II.EE. importadas ` +
      `(${sinCoord} sin coordenada válida). ${CODIGOS_DEMO.length} alias demo → IEs reales.`,
  );
  return { instMap };
}
