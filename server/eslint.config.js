import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Игнорируемые директории
  { ignores: ['build', 'node_modules'] },

  // Базовые рекомендованные конфиги
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginUnicorn.configs['recommended'],
  eslintPluginPrettierRecommended,

  // Основная конфигурация для JS/TS файлов (Node.js окружение)
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // Сортировка импортов
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'unicorn/prefer-event-target': 'off',
      // Настройка Unicorn (можно подстроить под проект)
      'unicorn/better-regex': 'warn',
      'unicorn/no-process-exit': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/prevent-abbreviations': 'off',
    },
  },

  // Конфигурация для тестов (Vitest)
  {
    files: ['src/**/*.test.{js,ts}'],
    ...vitest.configs.recommended,
  },
);
