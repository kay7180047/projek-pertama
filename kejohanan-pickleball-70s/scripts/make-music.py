"""Susun lagu pengguna (assets/lagu-memories-alfons.m4a) kepada 70s untuk video + 'lembutkan' perkataan kasar.
Susunan (masa dalam lagu asal):
  video 0-20s   <- lagu 10.0-30.0   (verse/build, kemudian drop tepat pada 20s = babak pasukan)
  video 20-44.4 <- lagu 30.0-54.375 (drop pertama)
  video 44.4-70 <- lagu 84.375-110.06 (drop kedua; sama grid beat 128 BPM, jadi beat kekal sejajar)
Perkataan kasar (dikesan melalui transkripsi, dengan masa per-perkataan) diredam: jalur 200Hz-14kHz diturunkan ~42dB
dalam tetingkap kecil, bass/kick dikekalkan supaya beat tak terputus.
"""
import subprocess, wave, sys, os
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, 'assets/lagu-memories-alfons.m4a'); OUT = os.path.join(ROOT, 'public/music.wav')
SR = 44100
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', SRC, '-ar', str(SR), '-ac', '2', '-f', 's16le', '-'], capture_output=True, check=True).stdout
song = np.frombuffer(raw, dtype=np.int16).reshape(-1, 2).astype(np.float64) / 32768

# --- redam perkataan kasar dalam lagu asal (saat) ---
PROFANITY = [('shit', 15.76, 16.10), ('shit', 28.95, 29.42), ('shit', 56.90, 57.50), ('shit', 70.36, 70.74), ('shit', 2.48, 2.86)]
def soften(x, t0, t1, pad=0.08, ramp=0.05, atten_db=-42, lo=200, hi=14000):
    a, b = int((t0 - pad) * SR), int((t1 + pad) * SR)
    chunk = x[a:b].copy(); n = len(chunk)
    F = np.fft.rfftfreq(n, 1 / SR)
    band = (F >= lo) & (F <= hi)
    mid = np.stack([np.fft.irfft(np.fft.rfft(chunk[:, c]) * band, n) for c in range(2)], 1)
    w = np.ones(n); r = int(ramp * SR)
    w[:r] = np.linspace(0, 1, r); w[-r:] = np.linspace(1, 0, r)
    g = 10 ** (atten_db / 20)
    x[a:b] = chunk - mid * (1 - g) * w[:, None]
for word, t0, t1 in PROFANITY: soften(song, t0, t1)

def seg(t0, t1): return song[int(t0 * SR):int(t1 * SR)]
A, Bp, Cp = seg(10.0, 30.0), seg(30.0, 54.375), seg(84.375, 110.06)
# sambung B->C dengan crossfade pendek 60ms (kedua-duanya sejajar beat)
xf = int(0.06 * SR); fade = np.linspace(0, 1, xf)[:, None]
BC = np.concatenate([Bp[:-xf], Bp[-xf:] * (1 - fade) + Cp[:xf] * fade, Cp[xf:]])
out = np.concatenate([A, BC])
out = out[:int(70 * SR)]
out[:int(0.15 * SR)] *= np.linspace(0, 1, int(0.15 * SR))[:, None]
pcm = (np.clip(out, -1, 1) * 32767).astype(np.int16)
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f'music.wav {len(out)/SR:.2f}s')
