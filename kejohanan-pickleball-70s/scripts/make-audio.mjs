// SFX prosedural sahaja (whoosh/pop/impact/riser dijana kod). Muzik latar = lagu pengguna (lihat make-music.py).
// Cue diambil daripada src/timing.json supaya masa bunyi sama dengan masa visual. Tiada VO dalam preview ini.
import fs from 'node:fs';
const T = JSON.parse(fs.readFileSync(new URL('../src/timing.json', import.meta.url)));
const K = T.k, S = T.scene;
const SR = 44100, DUR = T.duration / T.fps, N = Math.ceil(SR * DUR);
const mL = new Float32Array(N), mR = new Float32Array(N), sL = new Float32Array(N), sR = new Float32Array(N);
let seed = 11; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const beat = 60 / T.bpm, bar = beat * 4;
const TAU = Math.PI * 2;

function add(bus, t0, dur, fn, g = 1, pan = 0) {
  const [L, R] = bus === 'm' ? [mL, mR] : [sL, sR];
  const s0 = Math.floor(t0 * SR), n = Math.floor(dur * SR);
  const gl = g * (1 - Math.max(0, pan)), gr = g * (1 + Math.min(0, pan));
  for (let i = 0; i < n; i++) {
    const idx = s0 + i; if (idx < 0 || idx >= N) continue;
    const v = fn(i / SR, i / n);
    L[idx] += v * gl; R[idx] += v * gr;
  }
}
const exp = (t, d) => Math.exp(-t / d);
const att = (t, a) => Math.min(1, t / a);
// penapis band-pass (SVF) dengan frekuensi berubah
const bandNoise = (f0, f1, q = 2.5) => { let lp = 0, bp = 0; return (u) => { const f = f0 * Math.pow(f1 / f0, u), c = 2 * Math.sin(Math.PI * Math.min(f, 18000) / SR); const x = rnd(); lp += c * bp; const hp = x - lp - bp / q; bp += c * hp; return bp; }; };

// ---------- SFX ----------
const whoosh = (tPeak, dur = 0.6, g = 0.5, up = true) => { const bn = bandNoise(up ? 300 : 5000, up ? 5000 : 300); add('s', tPeak - dur * 0.55, dur, (t, u) => bn(u) * Math.sin(Math.PI * Math.pow(u, 0.8)) , g); };
const boom = (t0, g = 0.7, len = 1.1) => { add('s', t0, len, (t) => Math.sin(TAU * (38 + 70 * exp(t, 0.06)) * t) * exp(t, 0.35) * att(t, 0.002), g); const bn = bandNoise(2500, 300, 1); add('s', t0, 0.5, (t, u) => bn(u) * exp(t, 0.12), g * 0.45); };
const pop = (t0, g = 0.35, f = 700, pan = 0) => add('s', t0, 0.16, (t) => Math.sin(TAU * (f * 0.45 + f * 0.55 * exp(t, 0.025)) * t) * exp(t, 0.045) * att(t, 0.001), g, pan);
const tick = (t0, g = 0.22, f = 2400) => add('s', t0, 0.05, (t) => (Math.sin(TAU * f * t) + 0.5 * rnd()) * exp(t, 0.008), g);
const tock = (t0, g = 0.3) => add('s', t0, 0.12, (t) => Math.sin(TAU * (420 + 300 * exp(t, 0.015)) * t) * exp(t, 0.03), g);
const sparkle = (t0, g = 0.2) => { for (let i = 0; i < 6; i++) add('s', t0 + i * 0.05, 0.35, (t) => Math.sin(TAU * hz(88 + i * 3 + (i % 2) * 2) * t) * exp(t, 0.12) * att(t, 0.003), g * (1 - i * 0.1), i % 2 ? 0.4 : -0.4); };
const riser = (t0, dur, g = 0.3) => { const bn = bandNoise(400, 7000, 1.5); add('s', t0, dur, (t, u) => (bn(u) * 0.8 + Math.sin(TAU * (200 + 1400 * u * u) * t) * 0.25) * u * u, g); };

// ---------- Muzik ----------
const prog = [[57, 60, 64, 45], [53, 57, 60, 41], [48, 52, 55, 36], [55, 59, 62, 43]]; // Am F C G
const chordAt = (t) => prog[Math.floor(t / bar) % 4];
const kicks = [];
// pad (sepanjang video, kuat sedikit di bahagian pasukan)
for (let b = 0; b * bar < DUR; b++) {
  const tb = b * bar, ch = prog[b % 4];
  const level = tb < S.hook ? 0.7 : tb < S.teams ? 0.8 : tb < S.cta ? 1 : 1.05;
  for (const m of ch.slice(0, 3)) for (const det of [-0.1, 0.1]) {
    const f0 = hz(m + 12) * Math.pow(2, det / 12); let lp = 0;
    add('m', tb, bar + 0.3, (t) => { const ph = (f0 * t) % 1; const saw = ph * 2 - 1; lp += 0.07 * (saw - lp); const e = att(t, 0.4) * Math.min(1, (bar + 0.3 - t) / 0.3); return lp * e; }, 0.1 * level, det * 3);
  }
}
// arp pluck: bermula dalam bahagian logo (jarang) dan makin rapat
for (let t = 0; t < DUR - 0.3; t += beat / 2) {
  const sparse = t < S.hook, dense = t >= S.teams;
  const stepIdx = Math.round(t / (beat / 2));
  if (sparse && stepIdx % 4 !== 0) continue;
  if (!sparse && !dense && stepIdx % 2 !== 0) continue;
  const ch = chordAt(t); const pat = [0, 1, 2, 1, 2, 1, 0, 2]; const m = ch[pat[stepIdx % 8]] + 12 * (dense ? 2 : 1) + (stepIdx % 8 === 3 ? 12 : 0);
  add('m', t, 0.4, (tt) => (Math.sin(TAU * hz(m) * tt) + 0.35 * Math.sin(TAU * 2 * hz(m) * tt)) * exp(tt, 0.1) * att(tt, 0.003), dense ? 0.085 : 0.06, (stepIdx % 2 ? 0.35 : -0.35));
}
// drum + bass bermula pada hook (4s)
for (let t = S.hook; t < DUR - 0.5; t += beat) {
  const bi = Math.round((t - S.hook) / beat);
  kicks.push(t);
  add('m', t, 0.45, (tt) => (Math.sin(TAU * (46 + 95 * exp(tt, 0.028)) * tt) * exp(tt, 0.16) + 0.25 * rnd() * exp(tt, 0.004)) * att(tt, 0.001), 0.62);
  if (t >= S.info && bi % 2 === 1) { // clap pada beat 2 & 4
    const bn = bandNoise(1400, 1800, 1.2);
    for (const o of [0, 0.011, 0.024]) add('m', t + o, 0.2, (tt, u) => bn(u) * exp(tt, 0.05), 0.22);
  }
  if (t >= K.piala) { // hat 8th
    for (const o of [0, beat / 2]) add('m', t + o, 0.06, (tt) => rnd() * exp(tt, 0.012), o ? 0.075 : 0.05, o ? 0.2 : -0.2);
  }
  if (t >= S.hook + 2) { // bass
    const root = chordAt(t)[3];
    for (const [o, oct] of [[0, 0], [beat / 2, 12]]) {
      if (t < S.info && o) continue;
      const f0 = hz(root + oct); let lp = 0;
      add('m', t + o, beat * 0.5, (tt, u) => { const ph = (f0 * tt) % 1; lp += 0.12 * ((ph * 2 - 1) - lp); return (lp * 1.5 + Math.sin(TAU * f0 * tt) * 0.6) * exp(tt, 0.3) * att(tt, 0.004) * (1 - u * 0.3); }, t >= S.teams ? 0.3 : 0.24);
    }
  }
}
// ---------- Cue SFX (sama masa dengan visual) ----------
// Pembukaan logo
riser(0.0, 0.95, 0.12); sparkle(0.95, 0.18); whoosh(1.95, 0.5, 0.3);
for (let i = 0; i < 6; i++) tick(K.kesumba + i * 0.055, 0.2, 2200 + i * 150);
sparkle(K.kesumba + 0.55, 0.2);
riser(2.9, 1.1, 0.3);
// Wipe + hentaman
for (const b of T.wipes) { whoosh(b, 0.6, b >= 20 && b < 60 ? 0.38 : 0.5); if (b >= 20 && b < 60) boom(b + 0.03, 0.22, 0.5); }
boom(S.hook, 0.85); boom(S.grid, 0.8); boom(S.cta, 0.75);
// Hook
boom(K.ten, 0.9); boom(K.satu, 0.8); pop(K.piala, 0.4, 650); pop(K.piala + 0.35, 0.3, 900);
for (const b of [5, 6, 7]) tock(b, 0.28);
// Jabatan / agensi / GLC
for (const [i, k] of [K.jab, K.agensi, K.glc].entries()) { whoosh(k + 0.1, 0.3, 0.22, i % 2 === 0); pop(k + 0.1, 0.3, 500 + i * 160); }
pop(K.siapa, 0.4, 600); whoosh(K.siapa + 0.1, 0.4, 0.3); pop(K.siapa + 0.18, 0.35, 450);
// Info
pop(K.mp + 0.1, 0.3, 500); pop(K.kej, 0.3, 800);
for (const k of [K.date, K.time, K.venue]) { whoosh(k + 0.15, 0.3, 0.2); pop(k + 0.2, 0.3, 700); tick(k + 0.2, 0.15); }
pop(K.rasmi, 0.35, 650); pop(K.vip, 0.3, 850);
// Pemakluman tarikh + wakil pasukan
pop(K.apa, 0.3, 700); boom(K.apa + 0.1, 0.35, 0.6); pop(K.apa + 0.3, 0.3, 560);
riser(K.diag, 0.8, 0.22); pop(K.diag + 0.82, 0.38, 800); sparkle(K.diag + 0.85, 0.14);
pop(K.wk, 0.35, 620); whoosh(K.wk + 0.1, 0.35, 0.22);
for (let i = 0; i < 10; i++) pop(K.chip + i * K.chipStep + 0.04, 0.2, 560 + i * 60, (i % 2 ? 0.3 : -0.3));
// Pasukan: logo mendarat, nama, subjudul
for (let i = 0; i < T.teams.length; i++) {
  const t0 = S.teams + i * S.teamLen;
  whoosh(t0 + 0.28, 0.4, 0.3, false);
  pop(t0 + 0.55, 0.38, 520, i % 2 ? 0.25 : -0.25); tick(t0 + 0.55, 0.18);
  sparkle(t0 + 0.9, 0.09);
  pop(t0 + 0.65, 0.2, 900); pop(t0 + 0.73, 0.2, 1000);
  if (T.teams[i].sub) tick(t0 + 1.05, 0.14, 3000);
}
// Grid
riser(S.grid - 2.0, 2.0, 0.28);
pop(K.gridHead, 0.38, 600); pop(K.gridHead + 0.2, 0.34, 800);
for (let i = 0; i < 10; i++) pop(K.gridStart + i * K.gridStep + 0.05, 0.25, 600 + i * 70, (i % 3 - 1) * 0.35);
sparkle(K.gridStart + 1.9, 0.14); pop(K.gridStart + 1.9, 0.3, 700);
// CTA
pop(K.cta, 0.4, 650); pop(K.cta + 0.15, 0.3, 900);
for (const k of [K.ctaDate, K.ctaVenue]) { whoosh(k + 0.15, 0.3, 0.2); pop(k + 0.2, 0.3, 700); }
pop(K.ctaSupport, 0.35, 600);
pop(K.spons, 0.25, 700);
for (let i = 0; i < 4; i++) { pop(K.spons + 0.2 + i * 0.22 + 0.08, 0.28, 650 + i * 90, (i % 2 - 0.5) * 0.5); tick(K.spons + 0.28 + i * 0.22, 0.14); }
sparkle(K.spons + 1.2, 0.16);

// ---------- Master ----------
const out = [new Float32Array(N), new Float32Array(N)];
let lastK = 0, kp = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  while (kp < kicks.length && kicks[kp] <= t) { lastK = kicks[kp]; kp++; }
  const duck = kicks.length && t >= kicks[0] ? 1 - 0.38 * Math.exp(-(t - lastK) / 0.13) : 1;
  const fadeEnd = Math.min(1, Math.max(0, (DUR - t) / 0.45)), fadeIn = Math.min(1, t / 0.01);
  const g = fadeEnd * fadeIn * 1.15;
  out[0][i] = Math.tanh(sL[i] * g);
  out[1][i] = Math.tanh(sR[i] * g);
}
let peak = 0; for (const c of out) for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(c[i]));
const norm = 0.89 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(out[0][i] * norm * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(out[1][i] * norm * 32767), 46 + i * 4); }
fs.writeFileSync(new URL('../public/sfx.wav', import.meta.url), buf);
console.log(`sfx.wav ${DUR}s, peak(pre-norm)=${peak.toFixed(3)}, norm=${norm.toFixed(3)}`);
