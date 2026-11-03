// Soundtrack + SFX prosedural (tiada sampel / muzik luar). Cue diambil daripada src/timing.json.
import fs from 'node:fs';
const T = JSON.parse(fs.readFileSync(new URL('../src/timing.json', import.meta.url)));
const SR = 44100, DUR = T.duration / T.fps, N = Math.ceil(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const add = (t0, dur, fn, g = 1, pan = 0) => {
  const s0 = Math.floor(t0 * SR), n = Math.floor(dur * SR);
  for (let i = 0; i < n && s0 + i < N; i++) {
    const v = fn(i / SR, i / n) * g;
    L[s0 + i] += v * (1 - Math.max(0, pan)); R[s0 + i] += v * (1 + Math.min(0, pan));
  }
};
const env = (t, a, d) => Math.min(1, t / a) * Math.exp(-t / d);
const beat = 60 / T.bpm;

// ---- Muzik: Am | Am | F | F | C | G | C | C  (minor/tegang -> hangat) ----
const chords = [[57,60,64],[57,60,64],[53,57,60],[53,57,60],[48,55,64],[55,59,62],[48,55,64],[48,55,64]];
const roots = [45,45,41,41,36,43,36,36];
const secGain = (t) => t < 3 ? 0.55 : t < 6 ? 0.75 : t < 12.5 ? 1 : 1.1; // perkembangan hook -> penutup
for (let bar = 0; bar < 8; bar++) {
  const t0 = bar * 2 * beat * 2 / 2 * 1; // 1 bar = 4 beat = 2s
  const tb = bar * 4 * beat, ch = chords[bar];
  if (tb >= DUR) break;
  // pad
  for (const m of ch) for (const det of [-0.12, 0.12]) {
    const f0 = hz(m + 12) * Math.pow(2, det / 12);
    add(tb, 4 * beat + 0.4, (t) => { const e = Math.min(1, t / 0.5) * Math.min(1, (4 * beat + 0.4 - t) / 0.4);
      return e * (Math.sin(2 * Math.PI * f0 * t) + 0.3 * Math.sin(4 * Math.PI * f0 * t)) * 0.028 * secGain(tb); }, 1, det * 4);
  }
  // pluck arpeggio (jarang di hook, rapat selepas itu)
  const step = tb < 3 ? beat : tb < 6 ? beat : beat / 2;
  for (let k = 0, t = tb; t < tb + 4 * beat; k++, t += step) {
    if (tb < 3 && k % 2 === 1) continue;
    const m = ch[k % 3] + 12 * (1 + (k % 4 === 3 ? 1 : 0));
    add(t, 0.5, (tt) => env(tt, 0.004, 0.13) * Math.sin(2 * Math.PI * hz(m) * tt) , 0.07 * secGain(t), (k % 2 ? 0.3 : -0.3));
  }
  // bass + kick + hat dari S3 (6s) ke atas
  if (tb >= 6 - 1e-6) {
    for (const bb of [0, 2]) {
      const t = tb + bb * beat;
      add(t, 0.9, (tt) => env(tt, 0.01, 0.35) * Math.sin(2 * Math.PI * hz(roots[bar]) * tt), 0.22);
      add(t, 0.25, (tt) => Math.sin(2 * Math.PI * (48 + 90 * Math.exp(-tt * 28)) * tt) * Math.exp(-tt / 0.07), 0.3);
    }
    for (let k = 0; k < 8; k++) { const t = tb + k * beat / 2; if (k % 2 === 1) add(t, 0.06, (tt) => { const n = rnd(); return n * Math.exp(-tt / 0.012); }, 0.045, 0.2); }
  }
}

// ---- SFX ----
const fr = (x) => (typeof x === 'number' ? x : T.f[x]) / T.fps;
const sfx = {
  pop: (t) => add(t, 0.16, (tt) => Math.sin(2 * Math.PI * (200 + 520 * Math.exp(-tt * 40)) * tt) * Math.exp(-tt / 0.045), 0.28),
  impact: (t) => { add(t, 0.7, (tt) => Math.sin(2 * Math.PI * (55 + 80 * Math.exp(-tt * 18)) * tt) * Math.exp(-tt / 0.22), 0.55);
    let lp = 0; add(t, 0.25, (tt) => { lp += 0.25 * (rnd() - lp); return lp * Math.exp(-tt / 0.06); }, 0.5); },
  whoosh: (t) => { let lp = 0, bp = 0; add(t, 0.42, (tt, u) => { const a = 0.04 + 0.5 * Math.sin(Math.PI * u) ** 2; lp += a * (rnd() - lp); bp += 0.5 * (lp - bp);
    return (lp - bp) * 5 * Math.sin(Math.PI * u) ** 1.5; }, 0.5, 0); },
  riser: (t) => { let lp = 0; add(t, 26 / T.fps, (tt, u) => { lp += (0.02 + 0.5 * u * u) * (rnd() - lp); return lp * u * u * 3 + Math.sin(2 * Math.PI * (200 + 900 * u * u) * tt) * u * u * 0.15; }, 0.35); },
  chime: (t) => { for (const [f0, g] of [[1046.5, 1], [1568, 0.6], [2093, 0.35]])
    add(t, 1.8, (tt) => env(tt, 0.005, 0.5) * Math.sin(2 * Math.PI * f0 * tt), 0.1 * g, g > 0.5 ? 0.2 : -0.2); },
};
for (const [name, ref] of T.sfx) sfx[name](fr(ref));
// tik ketikan semasa teks "ditaip"
for (let f = T.f.typeStart; f < T.f.typeEnd; f += 2) add(f / T.fps, 0.02, (tt) => rnd() * Math.exp(-tt / 0.004), 0.12, 0.1);

// ---- Master: fade akhir, soft limiter, normalise puncak ~ -5 dBFS ----
for (let i = 0; i < N; i++) { const t = i / SR; const fo = Math.min(1, Math.max(0, (DUR - t) / 0.6)); const fi = Math.min(1, t / 0.02);
  L[i] = Math.tanh(L[i] * 1.2) * fo * fi; R[i] = Math.tanh(R[i] * 1.2) * fo * fi; }
let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
const k = 0.56 / pk;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(L[i] * k * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(R[i] * k * 32767), 46 + i * 4); }
fs.writeFileSync(new URL('../public/soundtrack.wav', import.meta.url), buf);
console.log(`soundtrack.wav ${DUR}s, peak asal ${pk.toFixed(3)} -> dinormalkan`);
