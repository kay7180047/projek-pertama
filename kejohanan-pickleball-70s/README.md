# Preview 70s — Perasmian Kejohanan Pickleball (Piala Datuk Bandar Kuantan 2026)

Remotion 9:16 (1080x1920, 30fps). Text + logo-led (tiada rakaman/VO). `out/preview.mp4` = preview untuk semakan.

- `npm install` → `npm run studio` (edit) → `npm run preview` (jana audio + render).
- `src/timing.json` = masa semua babak/cue (dikongsi visual + audio). `src/Preview.tsx` = semua babak.
- Audio: `scripts/make-music.py` (susun lagu pengguna `assets/lagu-memories-alfons.m4a` kepada 70s + redam perkataan kasar),
  `scripts/make-audio.mjs` (SFX prosedural), `scripts/mix.py` (campur → `public/soundtrack.wav`).
- Logo: `public/logos/` (pasukan 01–10 = susunan sementara, penganjur 00a/00b, penaja s1–s4).
- Lagu: pastikan lesen penggunaan sebelum siar awam.
