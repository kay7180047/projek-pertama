// Soundtrack + SFX prosedural (tiada sampel / muzik luar). 100 BPM, 1 bar = 2.4s = 1 gambar.
// Tiada dialog dalam bahan -> tiada ducking diperlukan. Perkembangan: intro -> groove -> penuh -> breakdown -> drop -> outro.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const OUT = process.argv[2] || 'out';
fs.mkdirSync(OUT, {recursive: true});
const SR = 44100, BPM = 100, BEAT = 60 / BPM, BAR = BEAT * 4, NBARS = 75, DUR = NBARS * BAR, N = Math.ceil(SR * DUR);
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
// chord tiap bahagian (MIDI), kitaran 4 bar. B1: I-V-vi-IV (C) | B2: IV-I-V-vi | B3: vi-IV-I-V
const PROG = {
  1: [[60, 64, 67, 36], [55, 59, 62, 43], [57, 60, 64, 33], [53, 57, 60, 41]],
  2: [[53, 57, 60, 41], [60, 64, 67, 36], [55, 59, 62, 43], [57, 60, 64, 33]],
  3: [[57, 60, 64, 33], [53, 57, 60, 41], [60, 64, 67, 36], [55, 59, 62, 43]],
};
// bab (indeks gambar) yang bermula: untuk whoosh. Dibaca daripada selection.json.
const sel = JSON.parse(fs.readFileSync(new URL('../src/selection.json', import.meta.url)));

for (const part of [1, 2, 3]) {
  const L = new Float32Array(N), R = new Float32Array(N);
  let seed = 11 * part; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
  const add = (t0, dur, fn, g = 1, pan = 0) => {
    const s0 = Math.floor(t0 * SR), n = Math.floor(dur * SR);
    for (let i = 0; i < n && s0 + i < N; i++) { const v = fn(i / SR, i / n) * g; L[s0 + i] += v * (1 - Math.max(0, pan)); R[s0 + i] += v * (1 + Math.min(0, pan)); }
  };
  const env = (t, a, d) => Math.min(1, t / a) * Math.exp(-t / d);
  const prog = PROG[part];
  // seksyen ikut nombor bar
  const lvl = (b) => b < 4 ? 0.7 : b < 16 ? 0.85 : b < 36 ? 1 : b < 40 ? 0.8 : b < 72 ? 1.1 : 0.75;
  const drums = (b) => (b >= 4 && b < 36) || (b >= 40 && b < 72);
  const full = (b) => (b >= 16 && b < 36) || (b >= 40 && b < 72);

  for (let b = 0; b < NBARS; b++) {
    const tb = b * BAR, ch = prog[b % 4], g = lvl(b);
    // pad (sidechain ringan ikut kick)
    for (const m of ch.slice(0, 3)) for (const det of [-0.1, 0.1]) {
      const f0 = hz(m) * Math.pow(2, det / 12);
      add(tb, BAR + 0.3, (t) => { const e = Math.min(1, t / 0.4) * Math.min(1, (BAR + 0.3 - t) / 0.3); const sc = drums(b) ? 1 - 0.4 * Math.exp(-(t % BEAT) / 0.12) : 1;
        return e * sc * (Math.sin(2 * Math.PI * f0 * t) + 0.25 * Math.sin(4 * Math.PI * f0 * t)) * 0.03 * g; }, 1, det * 4);
    }
    // pluck arpeggio: ringan di intro, lapan-nota selepas bar 4
    const step = b < 4 ? BEAT : BEAT / 2;
    for (let k = 0, t = tb; t < tb + BAR - 1e-6; k++, t += step) {
      if (b >= 36 && b < 40 && k % 2) continue;
      const m = ch[[0, 1, 2, 1, 2, 1, 0, 2][k % 8] % 3] + 12 * (1 + (k % 8 === 4 ? 1 : 0));
      add(t, 0.45, (tt) => env(tt, 0.004, 0.14) * (Math.sin(2 * Math.PI * hz(m) * tt) + 0.2 * Math.sin(6 * Math.PI * hz(m) * tt)), 0.07 * g, k % 2 ? 0.3 : -0.3);
    }
    // kick + bass + hat + clap
    if (drums(b)) {
      const beats = full(b) ? [0, 1, 2, 3] : [0, 2];
      for (const bb of beats) add(tb + bb * BEAT, 0.28, (tt) => Math.sin(2 * Math.PI * (46 + 95 * Math.exp(-tt * 30)) * tt) * Math.exp(-tt / 0.075), 0.34);
      if (b >= 8) for (let k = 0; k < 8; k++) { const t = tb + k * BEAT / 2; if (k % 2) add(t, 0.07, (tt) => rnd() * Math.exp(-tt / 0.014), 0.05, 0.25); else if (full(b)) add(t, 0.04, (tt) => rnd() * Math.exp(-tt / 0.008), 0.02, -0.2); }
      if (full(b)) for (const bb of [1, 3]) { const t = tb + bb * BEAT; let lp = 0; add(t, 0.2, (tt) => { lp += 0.5 * (rnd() - lp); return (rnd() * 0.5 + lp) * Math.exp(-tt / 0.05); }, 0.1); }
      if (b >= 8) for (let k = 0; k < 8; k++) { const t = tb + k * BEAT / 2; const m = ch[3] + (k % 4 === 3 ? 12 : 0);
        add(t, BEAT / 2 + 0.05, (tt) => env(tt, 0.006, 0.18) * (Math.sin(2 * Math.PI * hz(m) * tt) + 0.3 * Math.sin(4 * Math.PI * hz(m) * tt)), 0.17 * g * (k % 2 ? 0.7 : 1)); }
    }
    // melodi loceng pentatonik di seksyen penuh kedua (bar 40-71)
    if (b >= 40 && b < 72) {
      const pent = [72, 74, 76, 79, 81, 84]; const pat = [0, 2, 3, 2, 4, 3, 2, 1];
      for (let k = 0; k < 8; k += 1) { if (!(k % 2 === 0 || b % 2)) continue; const m = pent[pat[(k + b) % 8] % 6];
        add(tb + k * BEAT / 2, 0.6, (tt) => env(tt, 0.003, 0.22) * (Math.sin(2 * Math.PI * hz(m) * tt) + 0.35 * Math.sin(2 * Math.PI * hz(m) * 2.01 * tt)), 0.05, 0.4); }
    }
  }
  // ---- SFX (hanya di titik visual) ----
  const whoosh = (t, d = 0.5) => { let lp = 0, bp = 0; add(t, d, (tt, u) => { const a = 0.03 + 0.5 * Math.sin(Math.PI * u) ** 2; lp += a * (rnd() - lp); bp += 0.5 * (lp - bp); return (lp - bp) * 5 * Math.sin(Math.PI * u) ** 1.5; }, 0.45); };
  const impact = (t) => { add(t, 0.8, (tt) => Math.sin(2 * Math.PI * (52 + 80 * Math.exp(-tt * 16)) * tt) * Math.exp(-tt / 0.25), 0.5); let lp = 0; add(t, 0.3, (tt) => { lp += 0.25 * (rnd() - lp); return lp * Math.exp(-tt / 0.07); }, 0.45); };
  const pop = (t) => add(t, 0.16, (tt) => Math.sin(2 * Math.PI * (220 + 560 * Math.exp(-tt * 40)) * tt) * Math.exp(-tt / 0.045), 0.22);
  const riser = (t, d) => { let lp = 0; add(t, d, (tt, u) => { lp += (0.02 + 0.5 * u * u) * (rnd() - lp); return lp * u * u * 3 + Math.sin(2 * Math.PI * (200 + 1000 * u * u) * tt) * u * u * 0.12; }, 0.3); };
  const chime = (t) => { for (const [f0, g] of [[1046.5, 1], [1568, 0.6], [2093, 0.35]]) add(t, 2.2, (tt) => env(tt, 0.005, 0.6) * Math.sin(2 * Math.PI * f0 * tt), 0.1 * g, g > 0.5 ? 0.2 : -0.2); };
  whoosh(0.0, 0.7); pop(0.5);                         // kad pembuka muncul
  const items = sel[part - 1];
  for (let k = 1; k < NBARS; k++) if (items[k].chapter !== items[k - 1].chapter) { whoosh(k * BAR - 0.3); pop(k * BAR); } // tukar bab + flash
  riser(36 * BAR, 4 * BAR); impact(40 * BAR);           // breakdown -> drop
  whoosh((NBARS - 1) * BAR - 0.2); chime((NBARS - 1) * BAR + 0.3); // kad penutup
  // ---- master: fade, soft-limit, normalisasi puncak -3 dBFS ----
  let pk = 0;
  for (let i = 0; i < N; i++) { const t = i / SR; const fi = Math.min(1, t / 0.15), fo = Math.min(1, (DUR - t) / 2.5);
    L[i] = Math.tanh(L[i] * 1.2) * fi * fo; R[i] = Math.tanh(R[i] * 1.2) * fi * fo; pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); }
  const gain = 0.708 / pk; const buf = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(L[i] * gain * 32767), i * 4); buf.writeInt16LE(Math.round(R[i] * gain * 32767), i * 4 + 2); }
  const raw = `${OUT}/bahagian${part}.raw`; fs.writeFileSync(raw, buf);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 's16le', '-ar', String(SR), '-ac', '2', '-i', raw, '-af', 'loudnorm=I=-16:TP=-2:LRA=7', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '192k', `public/audio/bahagian${part}.mp3`]);
  fs.unlinkSync(raw); console.log('audio bahagian', part, 'ok');
}
