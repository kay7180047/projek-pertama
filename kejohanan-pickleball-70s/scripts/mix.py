"""Campur music.wav (lagu pengguna) + sfx.wav (SFX prosedural) -> public/soundtrack.wav.
Tiada VO dalam preview ini, jadi tiada ducking dialog. Muzik diduck sedikit ketika hentaman besar supaya SFX jelas."""
import wave, os
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100; N = 70 * SR
def load(p):
    w = wave.open(os.path.join(ROOT, p)); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, 2).astype(np.float64) / 32768
    o = np.zeros((N, 2)); o[:min(N, len(a))] = a[:N]; return o
music, sfx = load('public/music.wav'), load('public/sfx.wav')
MUSIC_G, SFX_G = 10 ** (-6.5 / 20), 0.62
duck = np.ones(N)
t = np.arange(N) / SR
for b in [4.0, 20.0, 60.0, 64.0]:           # hentaman besar: duck muzik -3dB, pulih 0.5s
    m = (t >= b - 0.05) & (t < b + 0.6); duck[m] = np.minimum(duck[m], 1 - 0.3 * np.exp(-np.maximum(t[m] - b, 0) / 0.2))
mix = music * MUSIC_G * duck[:, None] + sfx * SFX_G
fo = np.clip((70 - t) / 0.45, 0, 1); mix *= fo[:, None]
pk = np.abs(mix).max()
if pk > 0.89: mix *= 0.89 / pk
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open(os.path.join(ROOT, 'public/soundtrack.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f'soundtrack.wav peak(pre)={pk:.3f}')
