export const FPS = 30;
export const s2f = (s: number) => Math.round(s * FPS);
// Sempadan babak (saat) — SAMA dengan scripts/make_audio.py
export const T = {hook: 0, info: 3, week: [5.5, 9, 12.5, 16, 19.5], bracket: 23, cta: 28, end: 30};
export const TOTAL = s2f(T.end);
