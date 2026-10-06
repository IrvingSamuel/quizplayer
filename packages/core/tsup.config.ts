import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts', data: 'src/data.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    target: 'es2019',
  },
  {
    entry: { quizplayer: 'src/global.ts' },
    format: ['iife'],
    minify: true,
    sourcemap: true,
    target: 'es2019',
    outExtension: () => ({ js: '.min.js' }),
  },
]);
