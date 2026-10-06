// Assembles the static demo (GitHub Pages) into demo-dist/.
import { cpSync, mkdirSync, rmSync } from 'node:fs';

rmSync('demo-dist', { recursive: true, force: true });
mkdirSync('demo-dist', { recursive: true });
cpSync('demo', 'demo-dist', { recursive: true });
cpSync('packages/core/dist/quizplayer.min.js', 'demo-dist/quizplayer.min.js');
cpSync('packages/core/dist/quizplayer.min.js.map', 'demo-dist/quizplayer.min.js.map');
console.log('demo-dist ready');
