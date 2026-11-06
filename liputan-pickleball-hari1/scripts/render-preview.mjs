import {execFileSync} from 'node:child_process';
for (const p of [1, 2, 3]) execFileSync('npx', ['remotion', 'render', 'src/index.ts', `Bahagian${p}`, `out/preview-bahagian${p}.mp4`, '--scale=0.5', '--crf=24', '--concurrency=4', '--browser-executable=/opt/pw-browsers/chromium'], {stdio: 'inherit'});
