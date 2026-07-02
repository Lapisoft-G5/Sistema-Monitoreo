# Sistema de Monitoreo - Workspace Guidelines para Agentes

Estas son reglas y pautas obligatorias que todo agente de IA debe seguir al trabajar en este repositorio. Su incumplimiento puede generar rupturas (build breaks) o inconsistencias.

## 1. Reglas Generales y Flujo de Trabajo (Obligatorio)
- **Validación de Cambios (CERO ERRORES)**: Bajo NINGUNA circunstancia puedes dar un trabajo por concluido sin antes ejecutar localmente las validaciones. Debes correr siempre estos comandos en tu terminal interactiva para garantizar que no rompiste nada:
  1. `pnpm --filter backend run lint` (No debe arrojar errores)
  2. `pnpm --filter backend run build` (Debe compilar la carpeta dist sin fallos)
  3. `pnpm --filter frontend exec eslint .` (Frontend debe estar en 0 errores de Lint)
  4. `pnpm --filter frontend run build` (El TypeScript Check y el Build de Vite no deben fallar)
  5. `pnpm typecheck` (Si estás modificando ambos lados)
- **No inventar código zombie**: Si una funcionalidad fue refactorizada (ej. `jefes-area` fue absorbido por `Especialistas`), no intentes recrear controladores, tablas o repositorios redundantes. Revisa siempre la estructura actual antes de crear nuevos archivos.

## 2. Desarrollo en el Backend (NestJS + Prisma)
- **Caché y Compilación**: Este backend utiliza TypeScript en modo NodeNext/ESM. Si modificas archivos críticos como `tsconfig.json` o necesitas un build limpio, elimina primero `tsconfig.build.tsbuildinfo` y `tsconfig.tsbuildinfo` con PowerShell, o desactiva la caché incremental. 
- **El plugin `@nestjs/swagger` ROMPE ESM**: NO HABILITES la carga automática de Swagger en `nest-cli.json` usando el CLI plugin. El plugin de Swagger inyecta llamadas a `require()` en tiempo de compilación y destruye la compatibilidad ESM (`ReferenceError: require is not defined`). Utiliza siempre los decoradores de Swagger manualmente (`@ApiProperty()`) en los DTOs.
- **Tests (Jest)**: Los tests `*.spec.ts` y archivos en `test/` NO DEBEN ser excluidos del `tsconfig.json` base. Solo deben excluirse en el `tsconfig.build.json`. 
- **Imports**: Siempre añade la extensión `.js` al final de los imports relativos de TypeScript en el backend. Esto es obligatorio para que ESM resuelva los módulos.
- **Reglas de Negocio Vitales**:
  - Especialidad: Obligatoria en Primaria (`PIP` o `Educación Física`).
  - Cargos: `Jefe Area` se mapea con discriminador `cargo` en la tabla `Especialista`. Condición laboral `Nombrado` por defecto.

## 3. Desarrollo en Frontend (React + Vite)
- **Regla Estricta de React - Evitar Render Loops en useEffect**: Está TOTALMENTE PROHIBIDO usar setters síncronos de `useState` directamente dentro del cuerpo principal de un `useEffect` (`react-hooks/set-state-in-effect`), ya que causa renders en cascada y penaliza el performance. Si es imprescindible sincronizar estado desde un efecto, envuelve el setter en un `setTimeout(..., 0)` o rediseña el ciclo de vida.
- **Componentes y Hooks de Vite**: Nunca exportes funciones puras y componentes en el mismo archivo si es procesado por React Refresh (`react-refresh/only-export-components`). Separa tu contexto de tus componentes.
- **Performance de Build**: Utiliza code-splitting (`React.lazy`) si el componente no es esencial para el renderizado inicial.
- **Imports**: Para componentes compartidos entre front y back, debes importar de `@sistema-monitoreo/shared-contracts`.

## 4. Resolución de Conflictos y Tipos de TypeScript (¡Prohibido el `any` Global!)
- **Prohibido el `any` Perezoso**: Nunca apagues las reglas de tipado estricto o `@typescript-eslint/no-explicit-any` de forma global para saltarte un error.
- **Inferencia Real**: Si te topas con errores `Unsafe assignment of an any value`, NO intentes solucionarlo cegando al linter ni usando `unknown` si el estado espera valores estrictos (como `"INICIAL" | "PRIMARIA"`). **Infiere el tipo correcto** mirando el DTO, el `Prisma schema` o la propia firma de TypeScript, e inyecta la unión (cast) de tipos explícita (`as "Ejemplo"`). Solo en callbacks asíncronos y respuestas HTTP anónimas puedes relajar el tipado localmente.

## 5. Pruebas Unitarias (Jest)
- **Tipado de Mocks (`never` constraint)**: Nunca uses `jest.fn()` desnudo al simular métodos de repositorios en Prisma. La firma actual de Tipos de Jest fuerza los argumentos a `never`, lo que hará que el Build explote con `error TS2345: Argument of type 'any' is not assignable to parameter of type 'never'`. **Usa siempre `jest.fn<any>()`** o castea las funciones de prisma con `(prisma.modelo.metodo as jest.Mock<any>)`.
- **Rutas Relativas sin Aliases**: En la carpeta `test/unit/`, está estrictamente prohibido usar aliases como `@modules/` para importar el código fuente. Debes calcular la ruta relativa de la prueba hacia la clase bajo test (ejemplo: `../../../src/modules/auth/dto/login.dto.js`). ¡No olvides el `.js` al final!
