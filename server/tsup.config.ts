import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'], // точка входа
  format: ['esm'], // используем ES-модули
  dts: true, // генерировать .d.ts
  outDir: 'build',
  clean: true, // очищать dist перед сборкой
  splitting: false, // не разбивать на чанки
  sourcemap: true, // source maps для отладки
  target: 'node20', // целевая версия Node.js
  tsconfig: './tsconfig.json', // явно указать конфиг
  // Если нужно сохранить исходную структуру папок, используйте опцию `bundle: false`
  bundle: true, // объединять все в один файл (по умолчанию true)
});
