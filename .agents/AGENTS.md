# Sistema de Monitoreo - Workspace Guidelines para Agentes

Estas son reglas y pautas obligatorias que todo agente de IA debe seguir al trabajar en este repositorio. Su incumplimiento puede generar rupturas (build breaks) o inconsistencias.

## 1. Reglas Generales y Flujo de Trabajo (Obligatorio)
- **Validación de Cambios (CERO ERRORES)**: Bajo NINGUNA circunstancia puedes dar un trabajo por concluido sin antes ejecutar localmente las validaciones. Debes correr siempre estos comandos en tu terminal interactiva para garantizar que no rompiste nada:
  1. \`pnpm --filter backend run lint\` (No debe arrojar errores)
  2. \`pnpm --filter backend run build\` (Debe compilar la carpeta dist sin fallos)
  3. \`pnpm typecheck\` (Si estás modificando ambos lados)
- **No inventar código zombie**: Si una funcionalidad fue refactorizada (ej. \`jefes-area\` fue absorbido por \`Especialistas\`), no intentes recrear controladores, tablas o repositorios redundantes. Revisa siempre la estructura actual antes de crear nuevos archivos.

## 2. Desarrollo en el Backend (NestJS + Prisma)
- **Caché y Compilación**: Este backend utiliza TypeScript en modo NodeNext/ESM. Si modificas archivos críticos como `tsconfig.json` o necesitas un build limpio, elimina primero `tsconfig.build.tsbuildinfo` y `tsconfig.tsbuildinfo` con `Remove-Item` en PowerShell (no uses comandos Linux directamente) o desactiva la caché incremental antes del despliegue.
- **Tests (Jest)**: Los tests `*.spec.ts` y archivos en `test/` NO DEBEN ser excluidos del `tsconfig.json` base. Solo deben excluirse en el `tsconfig.build.json`. De lo contrario, `eslint` lanzará errores de parseo o de "project service".
- **Imports**: Siempre añade la extensión `.js` al final de los imports relativos de TypeScript en el backend. Esto es obligatorio para que ESM resuelva los módulos al compilar a NodeNext. (Ej: `import { UserService } from './user.service.js';`).
- **Prisma**: No edites directamente los seeders de forma monolítica, usa los validadores y mantén el dominio limpio.
- **Reglas de Negocio Vitales**:
  - Especialidad: Es obligatoria en nivel Primaria. En Primaria debe ser `PIP` o `Educación Física`.
  - Cargos: `Jefe Area` se mapea usando el discriminador `cargo` en la tabla `Especialista`. La condición laboral `Nombrado` es por defecto en Especialistas, a menos que el cargo indique `Encargado`, `Destacado` o `Designado`.

## 3. Desarrollo en Frontend (React + Vite)
- **Performance de Build**: Si importas componentes enormes, asegúrate de utilizar code-splitting (`React.lazy` o `dynamic import()`) si el componente no es esencial para el renderizado inicial, esto para evitar que los chunks superen el límite de 500kB.
- **Arquitectura de API**: Las llamadas deben centralizarse usando los contratos de API y TanStack Query. Usa variables de entorno para manejar las características de fallback a LocalStorage vs Backend (`FEATURES.apiOnly`).
- **Imports**: Para los contratos y componentes compartidos entre front y back, debes importar del paquete `@sistema-monitoreo/shared-contracts` en lugar de apuntar a las carpetas `src` relativas profundas.

## 4. Resolución de Conflictos y Linter
- **Linter**: Soluciona el linter activamente. Presta especial atención a errores como `Unsafe assignment of an any value` y `Unsafe member access`. El código backend usa configuraciones de tipo estrictas con `@typescript-eslint/recommended-requiring-type-checking`.
- Nunca apagues las reglas de tipado estricto o `@typescript-eslint/no-explicit-any` de forma global para saltarte un error, es mejor inferir el tipo correcto desde Prisma o DTO.
