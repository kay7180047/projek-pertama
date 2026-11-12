#!/bin/bash
# Muat turun versi resolusi tinggi (lebar 3200px) satu gambar dari Drive. Guna: fetch-hd.sh <id Drive> <nama.jpg>
id=$1; name=$2; out=public/photos-hd/$name
[ -s "$out" ] && exit 0
tmp=$(mktemp -p "${TMPDIR:-/tmp}" XXXXXX.jpg)
for i in 1 2 3; do
  curl -sS -m 180 -L -o "$tmp" "https://drive.usercontent.google.com/download?id=$id&export=download&confirm=t" && file "$tmp" | grep -q JPEG && break; sleep 2
done
ffmpeg -loglevel error -y -i "$tmp" -vf "scale=3200:-2:flags=lanczos" -q:v 2 "$out"; rm -f "$tmp"
