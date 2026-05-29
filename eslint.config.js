const tseslint = require('@typescript-eslint/eslint-plugin');
const parser = require('@typescript-eslint/parser');

module.exports = [
  {
    files: ['**/*.ts','**/*.tsx'],
    languageOptions:{
      parser
    },
    plugins:{
      '@typescript-eslint':tseslint
    },
    rules:{
      semi:['error','always'],
      quotes:['error','single']
    }
  }
];
