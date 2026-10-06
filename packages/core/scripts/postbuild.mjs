// Writes dist/quizplayer.css and stamps the version into the browser bundle.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const { version } = JSON.parse(readFileSync(root + 'package.json', 'utf8'));
const { css } = await import(root + 'dist/index.js');
writeFileSync(root + 'dist/quizplayer.css', css.trim() + '\n');

const bundle = root + 'dist/quizplayer.min.js';
writeFileSync(bundle, readFileSync(bundle, 'utf8').replace('__VERSION__', version));
console.log(`postbuild: quizplayer.css + version ${version}`);
