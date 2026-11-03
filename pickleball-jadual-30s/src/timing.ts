import tm from '../public/timing.json';
export const FPS = 30;
export const s2f = (s: number) => Math.round(s * FPS);
// Sempadan babak (saat) — dijana scripts/analyze_song.py, snap ke kick lagu; sama dengan audio
const b = tm.bounds;
export const T = {hook: 0, info: b[0], week: [b[1], b[2], b[3], b[4], b[5]], bracket: b[6], cta: b[7], end: tm.end};
export const TOTAL = s2f(T.end);
