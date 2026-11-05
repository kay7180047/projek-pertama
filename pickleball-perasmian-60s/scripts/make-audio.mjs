// Soundtrack instrumental + SFX dijana secara procedural (tiada sampel/lagu luar).
// Cue SFX dibaca daripada src/timeline.json supaya sama dengan visual.
import fs from 'node:fs';
import T from '../src/timeline.json' with {type: 'json'};

const SR = 44100, DUR = T.duration / T.fps, N = Math.floor(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 12345;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const mix = (t, x, g = 1, pan = 0) => {
  const i = Math.floor(t * SR);
  const gl = g * Math.cos((pan + 1) * Math.PI / 4), gr = g * Math.sin((pan + 1) * Math.PI / 4);
  for (let k = 0; k < x.length; k++) { const j = i + k; if (j < 0 || j >= N) continue; L[j] += x[k] * gl; R[j] += x[k] * gr; }
};
const gen = (len, fn) => { const n = Math.floor(len * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = fn(i / SR, i / n); return o; };
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
// penapis
const lp = (x, fc) => { const a = 1 - Math.exp(-2 * Math.PI * fc / SR); let y = 0; return x.map((v) => (y += a * (v - y))); };
const hp = (x, fc) => { const l = lp(x, fc); return x.map((v, i) => v - l[i]); };
const svfBand = (x, fcFn, q = 0.3) => { let lo = 0, bp = 0; return x.map((v, i) => { const f = 2 * Math.sin(Math.PI * Math.min(0.45, fcFn(i / x.length) / SR)); lo += f * bp; const hi = v - lo - q * bp; bp += f * hi; return bp; }); };

// ---- bunyi asas ----
const kick = () => { let ph = 0; return gen(0.32, (t) => { ph += 2 * Math.PI * (45 + 110 * Math.exp(-t * 28)) / SR; return Math.sin(ph) * Math.exp(-t * 11) * 1.0; }); };
const clap = () => { const n = hp(gen(0.2, (t) => rnd() * Math.exp(-t * 28)), 900); return lp(n, 7000); };
const hat = (open = false) => hp(gen(open ? 0.18 : 0.045, (t) => rnd() * Math.exp(-t * (open ? 18 : 90))), 7000);
const bass = (m, len) => { let ph = 0; return gen(len, (t) => { ph += 2 * Math.PI * hz(m) / SR; const s = Math.sin(ph) + 0.35 * Math.sin(2 * ph) + 0.15 * Math.sin(3 * ph); return s * Math.min(1, t * 200) * Math.exp(-t * 2.2) * Math.min(1, (len - t) * 40); }); };
const pluck = (m, len = 0.35) => { let ph = 0, ph2 = 0; return gen(len, (t) => { ph += 2 * Math.PI * hz(m) / SR; ph2 += 2 * Math.PI * hz(m) * 1.004 / SR; return (Math.sin(ph) + 0.5 * Math.sin(2 * ph) + 0.25 * Math.sin(ph2 * 3)) * Math.exp(-t * 9) * Math.min(1, t * 400); }); };
const pad = (ms, len) => { const ph = ms.map(() => 0); return gen(len, (t) => { let s = 0; ms.forEach((m, i) => { ph[i] += 2 * Math.PI * hz(m) / SR; s += Math.sin(ph[i]) + 0.4 * Math.sin(ph[i] * 1.003 * 2); }); return (s / ms.length) * Math.min(1, t * 3) * Math.min(1, (len - t) * 6); }); };

// ---- SFX ----
const sfx = {
  impact: () => { let ph = 0; const sub = gen(0.9, (t) => { ph += 2 * Math.PI * (38 + 80 * Math.exp(-t * 14)) / SR; return Math.sin(ph) * Math.exp(-t * 4.5); });
    const nz = lp(gen(0.5, (t) => rnd() * Math.exp(-t * 9)), 3500); return sub.map((v, i) => v * 1.0 + (nz[i] || 0) * 0.5); },
  whoosh: () => { const n = gen(0.6, () => rnd()); const b = svfBand(n, (u) => 300 + 5500 * Math.sin(u * Math.PI / 1.0) ** 2 * (u < 0.62 ? 1 : 0.7), 0.5);
    return b.map((v, i) => { const u = i / b.length; return v * Math.sin(Math.PI * Math.pow(u, 0.75)) * 1.2; }); },
  pop: () => { let ph = 0; return gen(0.12, (t) => { ph += 2 * Math.PI * (900 - 4500 * t) / SR; return Math.sin(ph) * Math.exp(-t * 38) * 0.9; }); },
  click: () => { const a = gen(0.06, (t) => Math.sin(2 * Math.PI * 2400 * t) * Math.exp(-t * 90)); const b = hp(gen(0.03, (t) => rnd() * Math.exp(-t * 150)), 3000); return a.map((v, i) => v * 0.7 + (b[i] || 0) * 0.5); },
  pock: () => { let ph = 0; const th = gen(0.1, (t) => { ph += 2 * Math.PI * (520 - 600 * t) / SR; return Math.sin(ph) * Math.exp(-t * 40); });
    const tk = svfBand(gen(0.03, (t) => rnd() * Math.exp(-t * 160)), () => 2200, 0.4); return th.map((v, i) => v * 0.9 + (tk[i] || 0) * 1.4); },
  riser: () => { const n = gen(0.5, () => rnd()); const b = svfBand(n, (u) => 400 + 6000 * u * u, 0.6); return b.map((v, i) => v * Math.pow(i / b.length, 1.6) * 1.1); },
};
const sfxGain = {impact: 0.85, whoosh: 0.5, pop: 0.5, click: 0.4, pock: 0.55, riser: 0.35};
const cache = {};
for (const s of T.sfx) {
  const f = s.f ?? T.beats[s.b];
  cache[s.t] ??= sfx[s.t]();
  mix(f / T.fps, cache[s.t], sfxGain[s.t], s.t === 'pock' ? (T.beats[s.b] % 60 === 15 ? 0.3 : -0.3) : 0);
}
cache.whoosh ??= sfx.whoosh();
for (const w of T.wipes) mix((w - 14) / T.fps, cache.whoosh, sfxGain.whoosh);

// ---- muzik: 120 BPM, 30 bar (2s), Am - F - C - G ----
const beatS = 0.5, bar = 4 * beatS, chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
const roots = [33, 29, 36, 31];
for (let b = 0; b < 30; b++) {
  const t0 = b * bar, c = chords[b % 4], root = roots[b % 4];
  const sec = b < 3 ? 'A' : b < 6 ? 'B' : b < 13 ? 'C' : b < 17 ? 'D' : b < 21 ? 'E' : b < 26 ? 'H' : b < 28 ? 'F' : 'G';
  const eDrop = b === 20;              // selepas "Siapa akan menjulang" (bar 24 mula pada 48s)
  const full = ['C', 'D', 'E', 'H'].includes(sec) || sec === 'A' && b >= 1;
  mix(t0, pad(c.concat([c[0] + 12]), bar + 0.15), sec === 'B' ? 0.10 : 0.075, -0.15);
  // kick
  const kickOn = (sec === 'A') || (['C', 'D', 'E', 'H', 'G'].includes(sec) && !(b === 20)) || (sec === 'F' && b === 27);
  if (kickOn) for (let k = 0; k < 4; k++) { if (sec === 'G' && b === 29 && k > 0) break; mix(t0 + k * beatS, kick(), 0.55); }
  if (sec === 'B' && b === 5) mix(t0, kick(), 0.5);
  // clap / snare 2 & 4
  if (full || sec === 'G') for (const k of [1, 3]) mix(t0 + k * beatS, clap(), 0.2, 0.1);
  // hats 8ths
  if (full || sec === 'F') for (let k = 0; k < 8; k++) mix(t0 + k * beatS / 2, hat(k % 4 === 3), k % 2 ? 0.09 : 0.06, 0.25);
  // bass
  if ((sec === 'A' && b >= 1) || ['C', 'D', 'E', 'H', 'G'].includes(sec)) for (let k = 0; k < 8; k++) { if (sec === 'G' && b === 29 && k > 0) break; if (b === 20) break; mix(t0 + k * beatS / 2, bass(root + (k % 4 === 3 ? 12 : 0), beatS / 2 * 0.9), 0.3); }
  // arpeggio
  const arpPat = [0, 1, 2, 1, 0, 2, 1, 2];
  if (sec === 'B') for (let k = 0; k < 4; k++) mix(t0 + k * beatS, pluck(c[arpPat[k] % 3] + 12, 0.5), 0.1, k % 2 ? 0.4 : -0.4);
  if (['C', 'D', 'E', 'H', 'G'].includes(sec) || sec === 'A' && b === 2) for (let k = 0; k < 8; k++) { if (b === 20 && k > 0) break; mix(t0 + k * beatS / 2, pluck(c[arpPat[k] % 3] + (sec === 'E' || sec === 'H' || sec === 'G' ? 24 : 12)), sec === 'D' ? 0.085 : 0.11, k % 2 ? 0.35 : -0.35); }
  // lead tambahan babak E & G
  if ((sec === 'E' || sec === 'H') && !eDrop) mix(t0, pluck(c[2] + 24, 0.9), 0.08, 0.5), mix(t0 + 4 * beatS / 2 * 1.5, pluck(c[1] + 24, 0.5), 0.07, -0.5);
  // build snare roll bar sebelum babak F / G
  if ((sec === 'B' && b === 5) || (sec === 'F' && b === 27)) {
    const n = sec === 'B' ? 8 : 16, span = bar;
    for (let k = 0; k < n; k++) mix(t0 + k * span / n, clap(), 0.07 + 0.2 * k / n);
  }
}
// hentaman penutup pada 56s selepas riser; chord akhir berdering
mix(56, pad([57, 60, 64, 69], 3.6), 0.14);
// ---- master ----
let peak = 0;
for (let i = 0; i < N; i++) { L[i] = Math.tanh(L[i] * 1.1); R[i] = Math.tanh(R[i] * 1.1); peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
const norm = 0.8 / peak; // ~ -2 dBFS
const fadeIn = 0.01, fadeOut = 0.45;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  const t = i / SR, g = Math.min(1, t / fadeIn) * Math.min(1, (DUR - t) / fadeOut) * norm;
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), 46 + i * 4);
}
fs.writeFileSync('public/audio/soundtrack.wav', buf);
console.log('soundtrack.wav', DUR.toFixed(1) + 's', 'peak', (peak * norm).toFixed(2));
