// Audio akhir = LAGU SAHAJA (disediakan pengguna, audio-lagu/lagu.m4a; tidak dimasukkan ke git).
// Tiada bunyi rakaman, SFX atau muzik prosedural. Lagu diselaraskan ke grid 120 BPM video (atempo, pic kekal),
// kemudian disusun mengikut beat: drop pertama -> hook (0s), build-up -> reveal juara (60s), kemudian drop kedua.
import {spawnSync} from 'node:child_process'; import path from 'node:path'; import fs from 'node:fs';
const root = path.resolve(new URL('..', import.meta.url).pathname);
const SRC = path.join(root, 'audio-lagu/lagu.wav'), OUT = path.join(root, 'public/audio/mix.wav');
const BPM = 123.0, PHI = 0.203, F = BPM / 120;           // F = faktor regangan masa
const p0 = PHI * F;                                       // beat ke-k jatuh pada p0 + 0.5k (selepas regangan)
const DROP1 = 32, DROP2 = 262, TOTAL = 92, BUILD = 56, PRE = 0.1;
const a0 = p0 + DROP1 * 0.5, b0 = p0 + (DROP2 - 8) * 0.5, c0 = p0 + DROP2 * 0.5;
const fc = [
  `[0:a]atempo=${(120 / BPM).toFixed(6)},aresample=48000,asplit=3[s1][s2][s3]`,
  `[s1]atrim=${a0.toFixed(4)}:${(a0 + BUILD).toFixed(4)},asetpts=PTS-STARTPTS[A]`,
  `[s2]atrim=${(b0 - PRE).toFixed(4)}:${c0.toFixed(4)},asetpts=PTS-STARTPTS[B]`,
  `[s3]atrim=${c0.toFixed(4)}:${(c0 + TOTAL - 60 + 0.05).toFixed(4)},asetpts=PTS-STARTPTS[C]`,
  `[A][B]acrossfade=d=${PRE}:c1=tri:c2=tri[AB]`,
  `[AB][C]concat=n=2:v=0:a=1,atrim=0:${TOTAL},asetpts=PTS-STARTPTS,` +
  `volume='1-0.75*clip((t-59.55)/0.2,0,1)*lt(t,60)':eval=frame,` +           // lencongan sesaat sebelum drop = impak reveal
  `afade=t=out:st=${TOTAL - 2.2}:d=2.2,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.89[out]`
].join(';');
const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', SRC, '-filter_complex', fc, '-map', '[out]', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', '-t', String(TOTAL), OUT], {stdio: 'inherit'});
if (r.status) throw new Error('mix lagu gagal'); console.log('mix.wav (lagu sahaja) siap');
