// Soundtrack + SFX prosedur (tiada sampel luar, tiada muzik komersial).
// Cue masa dibaca daripada src/timing.json — sama seperti visual.
import fs from 'node:fs';
const T = JSON.parse(fs.readFileSync(new URL('../src/timing.json', import.meta.url)));
const SR = 44100, N = Math.floor(T.total * SR);
const L = new Float32Array(N), R = new Float32Array(N);
const beat = 60 / T.bpm;
const add = (t, i, v, pan = 0) => { // pan -1..1
  const k = Math.floor(t * SR) + i; if (k < 0 || k >= N) return;
  L[k] += v * (1 - Math.max(0, pan)); R[k] += v * (1 + Math.min(0, pan));
};
let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296 * 2 - 1;
const env = (x, a, d) => x < a ? x / a : Math.exp(-(x - a) / d);
const fMidi = m => 440 * 2 ** ((m - 69) / 12);

function kick(t, g = 1) { const len = 0.35 * SR; let ph = 0;
  for (let i = 0; i < len; i++) { const x = i / SR; const f = 45 + 110 * Math.exp(-x * 28); ph += 2 * Math.PI * f / SR;
    add(t, i, Math.sin(ph) * Math.exp(-x * 9) * 0.9 * g); } }
function hat(t, g = 1, open = false) { const len = (open ? 0.18 : 0.06) * SR; let p = 0;
  for (let i = 0; i < len; i++) { const x = i / SR; const n = rnd(); const hp = n - p; p = n;
    add(t, i, hp * Math.exp(-x * (open ? 22 : 70)) * 0.22 * g, 0.3); } }
function clap(t, g = 1) { const len = 0.2 * SR; let lp = 0;
  for (let i = 0; i < len; i++) { const x = i / SR; lp += (rnd() - lp) * 0.5;
    add(t, i, lp * (Math.exp(-x * 25) + 0.6 * Math.exp(-Math.max(0, x - 0.012) * 30)) * 0.3 * g); } }
function bass(t, m, dur, g = 1) { const len = dur * SR; let ph = 0;
  for (let i = 0; i < len; i++) { const x = i / SR; ph += 2 * Math.PI * fMidi(m) / SR;
    const s = Math.tanh(Math.sin(ph) * 2.2) * 0.5; add(t, i, s * Math.min(1, x / 0.01) * Math.exp(-x * 2.2) * 0.55 * g); } }
function pad(t, notes, dur, g = 1) { const len = dur * SR;
  for (const m of notes) { let ph = 0; const f = fMidi(m);
    for (let i = 0; i < len; i++) { const x = i / SR; ph += 2 * Math.PI * f * (1 + 0.003 * Math.sin(x * 3)) / SR;
      const s = (Math.sin(ph) + 0.35 * Math.sin(2 * ph) + 0.15 * Math.sin(3 * ph)) / 3;
      const e = Math.min(1, x / 0.4) * Math.min(1, (dur - x) / 0.4);
      add(t, i, s * e * 0.12 * g, (m % 2) ? 0.4 : -0.4); } } }
function pluck(t, m, g = 1) { const len = 0.4 * SR; let ph = 0;
  for (let i = 0; i < len; i++) { const x = i / SR; ph += 2 * Math.PI * fMidi(m) / SR;
    add(t, i, (Math.sin(ph) + 0.5 * Math.sin(2 * ph)) * env(x, 0.003, 0.09) * 0.16 * g, 0.2); } }
function click(t, g = 1) { const len = 0.05 * SR; let ph = 0;
  for (let i = 0; i < len; i++) { const x = i / SR; ph += 2 * Math.PI * 1900 / SR;
    add(t, i, Math.sin(ph) * Math.exp(-x * 120) * 0.18 * g + rnd() * Math.exp(-x * 300) * 0.06 * g); } }
function pop(t, g = 1) { const len = 0.12 * SR; let ph = 0;
  for (let i = 0; i < len; i++) { const x = i / SR; ph += 2 * Math.PI * (300 + 700 * Math.exp(-x * 40)) / SR;
    add(t, i, Math.sin(ph) * Math.exp(-x * 30) * 0.25 * g); } }
function whoosh(t, dur, g = 1) { const len = dur * SR; let lp = 0;
  for (let i = 0; i < len; i++) { const x = i / len; const c = 0.02 + 0.5 * x * x; lp += (rnd() - lp) * c;
    add(t, i, lp * Math.sin(Math.PI * x) ** 1.5 * 0.5 * g, Math.sin(x * 6) * 0.5); } }
function riser(t, dur, g = 1) { const len = dur * SR; let ph = 0, lp = 0;
  for (let i = 0; i < len; i++) { const x = i / len; ph += 2 * Math.PI * (200 + 1800 * x * x) / SR; lp += (rnd() - lp) * (0.05 + 0.5 * x);
    add(t, i, (Math.sin(ph) * 0.12 + lp * 0.25) * x * g); } }
function impact(t, g = 1) { kick(t, 1.2 * g); const len = 1.2 * SR; let lp = 0;
  for (let i = 0; i < len; i++) { const x = i / SR; lp += (rnd() - lp) * 0.08; add(t, i, lp * Math.exp(-x * 4) * 0.5 * g); } }

// Progresi Am - F - C - G (1 bar = 4 beat)
const chords = [[57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62]];
const roots = [33, 29, 36, 31];
const byId = id => T.scenes.find(x => x.id === id);
const END = byId('penutup').start, INFO = byId('tarikh').start, TEAMS = byId('team0').start;
const intensity = t => t < 3.5 ? 0.3 : t < 12 ? 0.65 : t < END ? 0.9 : 0.55;

// Lapisan berterusan ikut bar
for (let bar = 0; bar * 4 * beat < T.total; bar++) {
  const t0 = bar * 4 * beat, ch = bar % 4, I = intensity(t0);
  if (t0 >= 3.5 - 1e-6 || t0 < 3.5) pad(t0, chords[ch], 4 * beat, I * 0.9);
  for (let b = 0; b < 4; b++) {
    const t = t0 + b * beat;
    if (t >= T.total - 0.01) break;
    const ending = t >= END;
    if (t >= 3.5 && !ending) kick(t, 0.9 * I);
    if (t < 3.5) { if (b % 2 === 0 && t >= 1) kick(t, 0.5); }
    if (t >= 6.5 && !ending) { hat(t + beat / 2, I); if (b % 2 === 1) clap(t, I * 0.8); }
    if (t >= 9.5 && !ending) { hat(t + beat * 0.25, 0.5 * I); hat(t + beat * 0.75, 0.5 * I, true); }
    if (t >= 6.5 && !ending) { bass(t, roots[ch] + 12, beat * 0.9, I); bass(t + beat / 2, roots[ch] + 12, beat * 0.4, I * 0.7); }
    if (t >= 12.0 && !ending) { const arp = chords[ch]; pluck(t, arp[b % 3] + 24, I * 0.7); pluck(t + beat / 2, arp[(b + 1) % 3] + 24, I * 0.5); }
  }
}
// Cue sync dengan visual
T.scenes.forEach((s, i) => {
  if (s.type === 'team') { whoosh(s.start - 0.12, 0.16, 0.45); pop(s.start + 0.02, 0.9); click(s.start + s.cues[1], 0.8); click(s.start + s.cues[2], 0.6); return; }
  if (i > 0) { whoosh(s.start - 0.25, 0.3, 0.8); impact(s.start, 0.8); }
  else { impact(0.02, 0.9); }
  s.cues.forEach((c, j) => { if (j > 0 || i === 0) click(s.start + c, 0.9); if (j === 0 && i > 0) pop(s.start + c + 0.05, 0.7); });
});
riser(TEAMS - 1.5, 1.5, 0.6);   // naik ke roll-call pasukan
riser(INFO - 2, 2, 0.6);  // naik ke info penting
riser(END - 1.0, 1.0, 0.5);
// Grid pasukan: pop berturut
for (let k = 0; k < 10; k++) pop(byId('grid').start + 0.4 + k * 0.07, 0.5);
// Penutup: chord panjang + kilauan
pad(END, [57, 60, 64, 69], 4, 1.1);
[72, 76, 79, 84].forEach((m, i) => pluck(END + 0.15 * i, m, 1.1));
// Fade, normalisasi lembut dan limiter
for (let i = 0; i < N; i++) { const x = i / SR; const f = Math.min(1, (T.total - x) / 1.2); L[i] *= f; R[i] *= f; }
let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.8 / pk;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.tanh(L[i] * g) * 32000), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.tanh(R[i] * g) * 32000), 46 + i * 4);
}
fs.writeFileSync(new URL('../public/soundtrack.wav', import.meta.url), buf);
console.log('soundtrack.wav ditulis, pre-limiter peak', pk.toFixed(2));
