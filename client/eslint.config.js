import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import reactPlugin from 'eslint-plugin-react' // добавлен импорт react
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config(
  globalIgnores(['dist']),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Отключаем базовые правила, чтобы использовать версии для TypeScript
      'semi': 'off',
      'indent': 'off',
      'quotes': 'off',

      'no-multiple-empty-lines': ['error', {
        'max': 1,
        'maxEOF': 1,      // разрешает одну пустую строку в конце файла
        'maxBOF': 0       // запрещает пустые строки в начале файла
      }],

      'react-refresh/only-export-components': 'off',

      // Точка с запятой — обязательно
      '@/semi': ['error', 'always'],

      // Отступы — 2 пробела
      '@/indent': ['error', 2],

      // Кавычки для обычного JS/TS (не JSX) — одинарные
      '@/quotes': ['error', 'single'],

      // Кавычки для JSX-атрибутов — одинарные (специальное правило)
      '@/jsx-quotes': ['error', 'prefer-single'],

      // В многострочных JSX-элементах — не более одного атрибута на строку
      'react/jsx-max-props-per-line': ['error', { maximum: 1, when: 'multiline' }],

      // В многострочных элементах первый атрибут должен быть на новой строке
      'react/jsx-first-prop-new-line': ['error', 'multiline'],

      // Закрывающая скобка в многострочных элементах — на новой строке, под открывающим тегом
      'react/jsx-closing-bracket-location': ['error', 'tag-aligned'],

      // Правила из react-hooks (если не подключаются через extends)
      ...reactHooks.configs.recommended.rules
    },
  },
)