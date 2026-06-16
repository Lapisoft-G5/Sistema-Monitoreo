import type { Config } from 'jest';

/**
 * Configuración de Jest para tests unitarios del backend NestJS.
 *
 * Estrategia: ESM nativo (--experimental-vm-modules).
 * Al mantener el mismo modelo de módulos que el proyecto (nodenext/ESM),
 * se elimina la necesidad de un tsconfig.spec.json separado, mocks de
 * Prisma por incompatibilidad de import.meta, y downgrades a CommonJS.
 *
 * Requisito de ejecución: NODE_OPTIONS=--experimental-vm-modules
 * (configurado en los scripts de package.json vía cross-env).
 */
const config: Config = {
  // ── Descubrimiento de tests ──────────────────────────────────────────────
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],

  // ── Entorno ──────────────────────────────────────────────────────────────
  testEnvironment: 'node',

  // ── ESM: indica a Jest qué extensiones tratar como módulos ES ───────────
  extensionsToTreatAsEsm: ['.ts'],

  // ── Resolución de módulos ────────────────────────────────────────────────
  moduleNameMapper: {
    // El proyecto usa imports con extensión explícita .js (convención NodeNext).
    // Jest en modo CJS no encontraría los .ts; este mapper los reescribe.
    '^(\\.{1,2}/.+)\\.js$': '$1',
  },

  // ── Transformación ───────────────────────────────────────────────────────
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        // Activa el preset ESM de ts-jest; coherente con module: nodenext.
        useESM: true,
        // Usa el tsconfig principal sin modificaciones: un solo tsconfig,
        // sin split-brain entre compilación y tests.
        tsconfig: '<rootDir>/../tsconfig.json',
      },
    ],
  },

  // ── Cobertura ────────────────────────────────────────────────────────────
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.spec.ts',
    '!**/generated/**', // código autogenerado de Prisma
    '!**/main.ts', // bootstrap de NestJS, no testeable unitariamente
  ],
  coverageDirectory: '../coverage',
};

export default config;
