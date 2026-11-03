# Iklan Motion 15s — Kesedaran Buli di Sekolah (preview)
Remotion + ffmpeg, 1920x1080, 30fps, 15s. Tiada aset luar; soundtrack/SFX dijana kod.

- `npm install` → `npm run studio` (edit) → `npm run preview` (jana audio + render `out/preview.mp4`)
- `src/timing.json` = satu sumber cue (frame) untuk visual DAN audio. Ubah di sini, kedua-duanya ikut.
- `src/Ad.tsx` = babak & teks. `scripts/make-audio.mjs` = muzik + SFX.
- Render guna Chromium sedia ada: `--browser-executable=/opt/pw-browsers/chromium` (buang flag jika Chrome Remotion boleh dimuat turun).

## Skrip (teks sahaja, tiada VO)
0-3s Anak balik sekolah jadi senyap. | 3-6s Penat sekolah… atau dibuli? |
6-9.5s Tanda yang sering terlepas pandang: Barang kerap hilang / Luka tanpa sebab / Enggan ke sekolah |
9.5-12.5s Cuba tanya dengan tenang: "Hari ini, ada apa-apa yang buat kamu tak selesa?" → "Mak… sebenarnya…" |
12.5-15s Dengar dulu. Jangan terus marah. [Mulakan bual malam ini.]
