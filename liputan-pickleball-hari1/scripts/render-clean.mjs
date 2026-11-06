import {execFileSync} from 'node:child_process';
for (const [id, out] of [['Bahagian1Bersih', 'out/preview-bahagian1-v3.mp4'], ['Bahagian2Bersih', 'out/preview-bahagian2-v2.mp4']])
  execFileSync('npx', ['remotion', 'render', 'src/index.ts', id, out, '--muted', '--scale=0.5', '--crf=23', '--concurrency=4', '--browser-executable=/opt/pw-browsers/chromium'], {stdio: 'inherit'});
