// Format setiap shot daripada rakaman asal -> klip 1080x1920 30fps (video) + wav 48k (audio ambien asal).
// Rakaman asal TIDAK diubah; semua output ke public/clips dan public/audio.
import fs from 'node:fs'; import {spawnSync} from 'node:child_process'; import path from 'node:path';
const root = path.resolve(new URL('..', import.meta.url).pathname);
const E = JSON.parse(fs.readFileSync(path.join(root, 'src/edl.json')));
const SRC = path.join(root, 'footage-asal'), OUT = path.join(root, 'public/clips'), AUD = path.join(root, 'public/audio/shots');
fs.mkdirSync(OUT, {recursive: true}); fs.mkdirSync(AUD, {recursive: true});
const run = (args) => { const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...args], {stdio: 'inherit'}); if (r.status) throw new Error('ffmpeg gagal: ' + args.join(' ')); };
const probe = (f) => JSON.parse(spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', f]).stdout).streams[0];
let t = 0; const timing = [];
for (const s of E.shots) {
  const f = path.join(SRC, s.clip), {width: W, height: H} = probe(f);
  const dur = s.beats * 60 / E.bpm, frames = Math.round(dur * E.fps);
  if (s.src > 5.0001) throw new Error(s.id + ' melebihi 5s');
  const slow = s.speed !== 1 ? `setpts=PTS/${s.speed},minterpolate=fps=${E.fps}:mi_mode=mci:mc_mode=aobmc:vsbmc=1,` : `setpts=PTS/${s.speed},`;
  const grade = 'eq=contrast=1.06:saturation=1.12,unsharp=5:5:0.5';
  let fc;
  if (s.layout === 'cover') {
    fc = `[0:v]fps=${E.fps},${slow}scale=1080:-2:flags=lanczos,crop=1080:1920:0:'(ih-1920)*${s.cy}',${grade},format=yuv420p[v]`;
  } else {
    const cw = Math.round(H * 4 / 3 / 2) * 2, [p0, p1] = s.pan;
    fc = `[0:v]fps=${E.fps},${slow}split=2[a][b];` +
      `[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=40:4,eq=brightness=-0.28:saturation=1.1[bg];` +
      `[b]crop=${cw}:${H}:'(iw-${cw})*(${p0}+(${p1}-${p0})*min(1,t/${dur}))':0,scale=1080:810:flags=lanczos,${grade}[fg];` +
      `[bg][fg]overlay=0:555,format=yuv420p[v]`;
  }
  run(['-ss', String(s.ss), '-t', String(s.src), '-i', f, '-filter_complex', fc, '-map', '[v]', '-frames:v', String(frames), '-an',
    '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-r', String(E.fps), path.join(OUT, s.id + '.mp4')]);
  // audio: asal (dikekalkan, tidak dipercepat); slow-mo/penutup disenyapkan supaya tak "pitch drop"
  const wav = path.join(AUD, s.id + '.wav');
  if (s.audio === 'keep') {
    run(['-ss', String(s.ss), '-t', String(s.src), '-i', f, '-vn', '-ac', '2', '-ar', '48000',
      '-af', `loudnorm=I=-23:TP=-3:LRA=9,afade=t=in:d=0.03,afade=t=out:st=${(dur - 0.05).toFixed(3)}:d=0.05,apad=whole_dur=${dur}`, '-t', String(dur), wav]);
  } else {
    run(['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', String(dur), wav]);
  }
  timing.push({id: s.id, section: s.section, start: +t.toFixed(3), dur, frames, from: Math.round(t * E.fps)});
  t += dur; console.log(s.id, 'ok', dur + 's');
}
fs.writeFileSync(path.join(root, 'src/timing.json'), JSON.stringify({fps: E.fps, total: t, shots: timing}, null, 1));
const list = E.shots.map((s) => `file '${path.join(AUD, s.id + '.wav')}'`).join('\n');
fs.writeFileSync(path.join(root, 'public/audio/list.txt'), list);
run(['-f', 'concat', '-safe', '0', '-i', path.join(root, 'public/audio/list.txt'), '-c:a', 'pcm_s16le', path.join(root, 'public/audio/ambience.wav')]);
console.log('jumlah', t, 's');
