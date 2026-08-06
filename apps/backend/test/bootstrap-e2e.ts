import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module.js';

/**
 * Arranque de la aplicación para pruebas de extremo a extremo.
 *
 * Fase 3 de PLAN_REMEDIACION.md. Replica la configuración de `main.ts` que no
 * vive en `AppModule`: el prefijo global, el pipe de validación y el lector de
 * cookies.
 *
 * Sin esto, la aplicación bajo prueba no se parece a la real. Es exactamente lo
 * que le pasaba a `app.e2e-spec.ts`: pedía `/api/health` mientras el módulo
 * servía `/health`, de modo que la única prueba de extremo a extremo del
 * proyecto fallaba. Nadie lo notó porque CI no ejecuta esta suite.
 */

/**
 * Impide que la suite se ejecute contra una base que no sea de pruebas.
 *
 * Esta guarda existe por un incidente concreto: una primera versión de la suite
 * se ejecutó contra la base de desarrollo y, al comprobar el rechazo de
 * credenciales incorrectas, incrementó los contadores de intentos fallidos y
 * **dejó bloqueada la cuenta del Director de UGEL**.
 *
 * Un recorrido de extremo a extremo nunca es de sólo lectura: iniciar sesión
 * registra la última conexión y crea la fila de sesión, y fallar al iniciarla
 * bloquea la cuenta. Esos efectos no se ven al leer el caso de prueba.
 *
 * La base debe llamarse de forma que se reconozca como efímera, o hay que
 * declarar la excepción explícitamente con `E2E_PERMITIR_BASE_NO_EFIMERA=1`.
 */
function exigirBaseEfimera(): void {
  if (process.env.E2E_PERMITIR_BASE_NO_EFIMERA === '1') return;

  const url = process.env.DATABASE_URL ?? '';
  const esEfimera = /(_test|_e2e|-test|-e2e)(\?|$)/.test(url) || /localhost:5433/.test(url);

  if (!esEfimera) {
    throw new Error(
      'Las pruebas de extremo a extremo mutan datos: inician sesión, crean filas de sesión y ' +
        'pueden bloquear cuentas al comprobar credenciales incorrectas.\n\n' +
        'Apunte DATABASE_URL a una base efímera cuyo nombre termine en _test o _e2e, o declare ' +
        'la excepción con E2E_PERMITIR_BASE_NO_EFIMERA=1 si sabe lo que está haciendo.\n\n' +
        `DATABASE_URL actual: ${url.replace(/:[^:@]+@/, ':***@')}`,
    );
  }
}

export async function crearAppE2E(): Promise<INestApplication> {
  exigirBaseEfimera();

  const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();

  const app = moduleFixture.createNestApplication();

  // Mismo orden y opciones que `main.ts`.
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  await app.init();
  return app;
}

/**
 * Credenciales sembradas por `database/seeders/personas.js`.
 *
 * La contraseña de cada usuario de prueba **es su propio DNI**: el seeder hace
 * `bcrypt.hashSync(dni, 4)`. Verificado comparando contra el hash almacenado.
 *
 * Es una razón más por la que ese seeder no debe ejecutarse jamás contra
 * producción: dejaría cada cuenta con una contraseña deducible de un dato
 * público.
 */
const credencial = (dni: string) => ({ dni, password: dni });

export const USUARIOS_SEMBRADOS = {
  superusuario: credencial('00000000'),
  directorUgel: credencial('40000001'),
  jefeGestion: credencial('40000002'),
  jefeArea: credencial('40000003'),
} as const;
