#!/usr/bin/env bash
# Campur lagu (source/audio/self-aware.m4a) + SFX prosedur -> public/soundtrack.wav
# Offset 0.56s: "drop" lagu (~25.06s) jatuh tepat pada babak roll-call pasukan (24.5s).
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/make-audio.mjs --sfx-only
ffmpeg -y -v error -ss 0.56 -t 46.5 -i source/audio/self-aware.m4a -i source/audio/sfx.wav \
  -filter_complex "[0:a]aformat=sample_fmts=fltp:channel_layouts=stereo,afade=t=in:d=0.05,afade=t=out:st=44.3:d=2.2,volume=0.7[m];[1:a]volume=0.5[s];[m][s]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11" \
  -ar 44100 -ac 2 public/soundtrack.wav
