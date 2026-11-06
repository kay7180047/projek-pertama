// Final export 1080x1920, 30fps, tanpa audio (sudah termasuk intro logo + penutup logo). Guna: node scripts/render-final.mjs
import {execFileSync} from 'node:child_process';
for (const p of [1, 2, 3])
  execFileSync('npx', ['remotion', 'render', 'src/index.ts', `Bahagian${p}Bersih`, `out/5nov-bahagian${p}.mp4`, '--muted', '--crf=18', '--concurrency=4', '--browser-executable=/opt/pw-browsers/chromium'], {stdio: 'inherit'});
