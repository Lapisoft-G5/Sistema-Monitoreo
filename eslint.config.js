import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['**/node_modules', '**/dist', '**/build', '**/.next', '**/.vite', '**/generated'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [tseslint.configs.recommended],
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
    },
  },
  eslintConfigPrettier,
);
