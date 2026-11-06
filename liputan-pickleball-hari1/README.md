# Liputan Kejohanan Pickleball Berpasukan — Hari 1 (preview)

3 video menegak 9:16, setiap satu 180s (75 gambar x 2.4s, 1 gambar = 1 bar @100 BPM).
Sumber: 920 gambar Drive -> 281 kluster unik -> 225 dipilih (`scripts/select.py`).

- `out/preview-bahagian{1,2,3}.mp4` — preview 540x960, 30fps
- `src/selection.json` — senarai gambar, susunan, layout (cover/contain), titik fokus. Edit untuk tukar/buang gambar.
- `src/Reel.tsx` — visual (HUD, kad pembuka/penutup, Ken Burns)
- `scripts/make-audio.mjs` — soundtrack + SFX prosedural (`npm run audio`)
- `npm run studio` untuk edit; `npm run preview` untuk render semula (~25 min/bahagian)

Gambar dalam `public/photos` ialah salinan 1600px (bukan fail asal). Final export 1080x1920 perlu muat turun semula resolusi lebih tinggi.
