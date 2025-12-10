import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
  {
    ignores: ['node_modules/', 'dist/', 'build/'],
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Warns on unused vars, ignores vars starting with _
      'no-console': 'warn', // Warns if console.log is left in production code
      eqeqeq: 'error', // Enforces === stcrict equality
    },
  },
  eslintConfigPrettier,
]);
