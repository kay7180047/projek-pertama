#!/bin/bash
# Tambah intro logo berpusing + kad penutup pada video bersih sedia ada (cantum, tanpa render semula bahagian tengah).
# Guna: scripts/add-logos.sh <id komposisi> <bilangan gambar> <video sedia ada> <output>
set -e
ID=$1; N=$2; SRC=$3; OUT=$4
INTRO=54; DUR=90; ENDF=10; HOLD=75
TOTAL=$((INTRO + N*DUR + HOLD)); OSTART=$((INTRO + N*DUR - ENDF))
R="npx remotion render src/index.ts $ID --muted --scale=0.5 --crf=18 --concurrency=4 --browser-executable=/opt/pw-browsers/chromium"
$R out/seg-intro-$ID.mp4 --frames=0-65 >/dev/null 2>&1
$R out/seg-outro-$ID.mp4 --frames=$OSTART-$((TOTAL-1)) >/dev/null 2>&1
ffmpeg -loglevel error -y -i out/seg-intro-$ID.mp4 -i "$SRC" -i out/seg-outro-$ID.mp4 \
 -filter_complex "[1:v]trim=start_frame=12:end_frame=$((N*DUR-ENDF)),setpts=PTS-STARTPTS[m];[0:v][m][2:v]concat=n=3:v=1:a=0[v]" \
 -map "[v]" -c:v libx264 -crf 22 -pix_fmt yuv420p -r 30 "$OUT"
rm -f out/seg-intro-$ID.mp4 out/seg-outro-$ID.mp4
echo "$OUT $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")s (jangkaan $(( TOTAL ))f)"
