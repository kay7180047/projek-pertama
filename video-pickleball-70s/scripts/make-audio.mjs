// Soundtrack instrumental + SFX dijana sepenuhnya melalui kod (tiada sampel / muzik luar / tiruan lagu).
// Cue (impact, whoosh, pop, riser) dibaca daripada src/timeline.json - sama seperti cue visual.
import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(new URL('..', import.meta.url).pathname);
const T = JSON.parse(fs.readFileSync(path.join(root, 'src/timeline.json')));
const SR = 48000, DUR = T.total, N = SR * DUR, beat = 60 / T.bpm;
const mk = () => [new Float32Array(N), new Float32Array(N)];
const [mL, mR] = mk(), [sL, sR] = mk();
let seed = 11; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const add = (L, R, t0, dur, fn, g = 1, pan = 0) => {
  const s0 = Math.floor(t0 * SR), n = Math.floor(dur * SR);
  for (let i = 0; i < n && s0 + i < N; i++) { const v = fn(i / SR, i / n) * g; L[s0 + i] += v * (1 - Math.max(0, pan)); R[s0 + i] += v * (1 + Math.min(0, pan)); }
};
const music = (t0, d, fn, g, p) => add(mL, mR, t0, d, fn, g, p), sfx = (t0, d, fn, g, p) => add(sL, sR, t0, d, fn, g, p);
const env = (t, a, d) => Math.min(1, t / a) * Math.exp(-t / d);
const TAU = Math.PI * 2;

// ---------- instrumen ----------
const kick = (t0, g = 1) => { let ph = 0; music(t0, 0.3, (t) => { const f = 45 + 95 * Math.exp(-t * 28); ph += TAU * f / SR; return Math.sin(ph) * Math.exp(-t * 11) * (1 - Math.exp(-t * 900)); }, 0.9 * g); };
const hat = (t0, g = 1, open = false) => { let p = 0; music(t0, open ? 0.25 : 0.06, (t) => { const n = rnd(), v = n - p; p = n; return v * Math.exp(-t / (open ? 0.07 : 0.014)); }, 0.16 * g, 0.2); };
const clap = (t0, g = 1) => { let lp = 0; for (const d of [0, 0.011, 0.023]) music(t0 + d, 0.18, (t) => { lp += 0.35 * (rnd() - lp); return (lp * 2.2) * Math.exp(-t / (d === 0.023 ? 0.09 : 0.012)); }, 0.30 * g, -0.1); };
const bass = (t0, d, m, g = 1) => { const f = hz(m); music(t0, d, (t) => { const e = Math.min(1, t / 0.008) * Math.min(1, (d - t) / 0.03); return e * (Math.sin(TAU * f * t) + 0.35 * Math.sin(TAU * 2 * f * t) + 0.12 * Math.sin(TAU * 3 * f * t)) * 0.55; }, 0.42 * g); };
const pad = (t0, d, notes, g = 1) => { for (const m of notes) for (const det of [-0.1, 0.1]) { const f = hz(m + 12) * Math.pow(2, det / 12); music(t0, d + 0.3, (t) => Math.min(1, t / 0.45) * Math.min(1, (d + 0.3 - t) / 0.3) * (Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * 2 * f * t)) * 0.03, g, det * 3); } };
const pluck = (t0, m, g = 1, pan = 0) => music(t0, 0.5, (t) => env(t, 0.003, 0.12) * (Math.sin(TAU * hz(m) * t) + 0.3 * Math.sin(TAU * 2 * hz(m) * t)), 0.075 * g, pan);
const lead = (t0, d, m, g = 1) => music(t0, d + 0.1, (t) => { const f = hz(m) * (1 + 0.004 * Math.sin(TAU * 5.5 * t)); return Math.min(1, t / 0.01) * Math.exp(-t / (d * 0.9)) * (Math.sin(TAU * f * t) + 0.4 * Math.sin(TAU * 2 * f * t) + 0.2 * Math.sin(TAU * 3 * f * t)) * 0.5; }, 0.06 * g, 0.15);

// ---------- struktur ----------
const chords = [[57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62]], roots = [45, 41, 36, 43];
const penta = [69, 72, 74, 76, 79, 76, 74, 72]; // A minor pentatonic
const phase = (t) => t < 6 ? 'hook' : t < 11 ? 'breath' : t < 31 ? 'groove' : t < 56 ? 'full' : t < 64 ? 'calm' : 'end';
const bars = Math.ceil(DUR / (4 * beat));
for (let b = 0; b < bars; b++) {
  const tb = b * 4 * beat, ch = chords[b % 4], root = roots[b % 4];
  for (let step = 0; step < 32; step++) { // grid 1/8 beat... 1 bar = 16 x 16th
    if (step >= 16) break;
    const t = tb + step * beat / 4, ph = phase(t); if (t >= DUR) break;
    const beatNo = Math.floor(step / 4), onBeat = step % 4 === 0, off8 = step % 4 === 2;
    if (ph === 'hook') {
      if (onBeat) kick(t, 1);
      if (off8) hat(t, 0.9);
      if (onBeat && (beatNo === 1 || beatNo === 3) && t > 2) clap(t, 0.8);
      if (t > 4 && step % 2 === 0) hat(t, 0.6);
      if (off8 || onBeat) pluck(t, ch[(step / 2 | 0) % 3] + 24, 0.7, step % 8 ? 0.3 : -0.3);
      if (onBeat && beatNo % 2 === 0) bass(t, beat * 1.8, root, 0.9);
    } else if (ph === 'breath') {
      if (onBeat && beatNo % 2 === 0) pluck(t, ch[(beatNo / 2) % 3 | 0] + 24, 0.8, 0.25);
      if (step === 0) bass(t, beat * 3.8, root + 12, 0.45);
    } else if (ph === 'groove' || ph === 'full') {
      const full = ph === 'full';
      if (onBeat) kick(t, 1);
      if (full && step === 10) kick(t, 0.7);
      if (onBeat && (beatNo === 1 || beatNo === 3)) clap(t, 1);
      if (step % 2 === 0) hat(t, full ? 1 : 0.8, off8 && full);
      if (full && step % 2 === 1) hat(t, 0.45);
      if (off8 || onBeat) bass(t, beat * 0.45, root + (step % 8 === 6 ? 12 : 0), 1);
      if (step % (full ? 2 : 4) === 0) pluck(t, ch[(step / (full ? 2 : 4) | 0) % 3] + 24 + (step % 8 === 6 ? 12 : 0), full ? 1 : 0.75, step % 4 ? 0.35 : -0.35);
      if (full && (step === 0 || step === 6 || step === 12)) lead(t, beat * (step === 12 ? 1.5 : 0.8), penta[((b * 3 + step / 2) | 0) % penta.length] , 1);
    } else if (ph === 'calm') {
      if (onBeat && (beatNo === 0 || beatNo === 2)) kick(t, 0.6);
      if (step % 4 === 2) hat(t, 0.5);
      if (onBeat) pluck(t, ch[beatNo % 3] + 24, 0.75, beatNo % 2 ? 0.3 : -0.3);
      if (step === 0) bass(t, beat * 3.8, root, 0.8);
    } else if (step === 0) { bass(t, beat * 3.8, root, 0.7); }
  }
  const t0 = tb; if (t0 < DUR) { const ph = phase(t0 + 0.1); pad(t0, 4 * beat, ch, ph === 'hook' ? 0.8 : ph === 'breath' || ph === 'end' ? 1.6 : ph === 'calm' ? 1.3 : 1); }
}
// chord penutup memanjang
pad(64, 6, chords[0], 1.4);

// ---------- SFX (cue sama dengan visual) ----------
const impact = (t0) => { let ph = 0; sfx(t0, 1.2, (t) => { const f = 32 + 70 * Math.exp(-t * 9); ph += TAU * f / SR; return Math.sin(ph) * Math.exp(-t * 3.2) * (1 - Math.exp(-t * 600)); }, 0.95);
  let lp = 0; sfx(t0, 0.9, (t) => { lp += (0.25 + 0.5 * Math.exp(-t * 8)) * (rnd() - lp); return lp * Math.exp(-t * 5); }, 0.8); };
const whoosh = (t0, dir) => { let lp = 0, bp = 0; const D = 0.5; sfx(t0, D, (t, u) => { const c = 0.03 + 0.5 * Math.pow(dir > 0 ? u : 1 - u, 2); lp += c * (rnd() - lp); bp += 0.2 * (lp - bp); return (lp - bp) * 9 * Math.sin(Math.PI * u) ** 1.5; }, 0.55, dir * (0.0)); };
const pop = (t0) => { let ph = 0; sfx(t0, 0.12, (t) => { ph += TAU * (900 - 5500 * t) / SR; return Math.sin(ph) * Math.exp(-t * 38); }, 0.45); };
const click = (t0) => sfx(t0, 0.05, (t) => Math.sin(TAU * 2600 * t) * Math.exp(-t * 140), 0.35);
const riser = (t0, d) => { let lp = 0, ph = 0; sfx(t0, d, (t, u) => { lp += (0.05 + 0.45 * u * u) * (rnd() - lp); ph += TAU * (180 + 1500 * u * u) / SR; return (lp * 3 + Math.sin(ph) * 0.12) * u * u; }, 0.35); };
T.impacts.forEach(impact); T.wipes.forEach((w) => whoosh(w - 0.25, 1)); T.risers.forEach((r) => riser(r.t, r.dur));
T.pops.forEach(pop); T.clicks.forEach(click);

// ---------- master & tulis WAV ----------
const peak = (a, b) => { let p = 1e-9; for (let i = 0; i < N; i++) p = Math.max(p, Math.abs(a[i]), Math.abs(b[i])); return p; };
const scale = (a, b, target) => { const k = target / peak(a, b); for (let i = 0; i < N; i++) { a[i] *= k; b[i] *= k; } return k; };
// fade keluar muzik 68.5-70s
for (let i = Math.floor(68.3 * SR); i < N; i++) { const f = 1 - (i - 68.3 * SR) / (1.7 * SR); mL[i] *= f; mR[i] *= f; }
scale(mL, mR, 0.6); scale(sL, sR, 0.8);
const wav = (L, R, file) => { const buf = Buffer.alloc(44 + N * 4); buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, Math.tanh(L[i] * 1.1) )) * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, Math.tanh(R[i] * 1.1))) * 32767), 46 + i * 4); }
  fs.writeFileSync(file, buf); };
fs.mkdirSync(path.join(root, 'public/audio'), {recursive: true});
wav(mL, mR, path.join(root, 'public/audio/music.wav')); wav(sL, sR, path.join(root, 'public/audio/sfx.wav'));
console.log('music.wav + sfx.wav siap', DUR + 's');
