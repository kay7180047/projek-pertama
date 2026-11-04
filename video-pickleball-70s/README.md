# Rangkuman Kejohanan Pickleball Antara Jabatan — 70s, 9:16 (TikTok)

Preview: `out/preview.mp4` (tidak dimasukkan ke git kerana ~80 MB). Rakaman asal dalam `footage-asal/` (tidak diubah, tidak dimasukkan ke git).

## Struktur
- `src/edl.json` — **senarai potongan** (klip, mula, panjang, layout, pan). Edit di sini untuk tukar momen.
- `src/timeline.json` — cue bunyi (impact, whoosh, pop, riser) yang dikongsi audio dan visual.
- `src/Video.tsx` — grafik, teks, transisi (Remotion).
- `scripts/prep-clips.mjs` — format klip asal -> 1080x1920 30fps + audio asal.
- `scripts/make-audio.mjs` — soundtrack + SFX prosedural (kod). `scripts/mix-audio.mjs` — campuran + ducking.

## Render semula
```
npm install
npm run preview      # clips -> music -> mix -> render
```
Untuk tukar teks sahaja: edit `src/Video.tsx` lalu `npm run render:preview`.

## Tema sementara (tiada branding diberi)
Latar #0B1220, aksen neon #C6FF3D (warna bola), putih. Fon Barlow Condensed + Inter (@fontsource, setempat).
