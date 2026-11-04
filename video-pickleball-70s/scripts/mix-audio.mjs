// Campur: ambien asal rakaman (bunyi bola/penonton, dikekalkan) + muzik (di-duck bila ada bunyi asal) + SFX -> mix.wav
import {spawnSync} from 'node:child_process'; import path from 'node:path';
const root = path.resolve(new URL('..', import.meta.url).pathname), A = (f) => path.join(root, 'public/audio', f);
const fc = [
  '[0:a]aresample=48000,volume=1.0,asplit=2[amb][key]',
  '[1:a]aresample=48000,volume=0.55[mus]',
  '[mus][key]sidechaincompress=threshold=0.03:ratio=5:attack=15:release=350:makeup=1[musd]',
  '[2:a]aresample=48000,volume=0.9[sfx]',
  '[amb][musd][sfx]amix=inputs=3:normalize=0:duration=longest,volume=1.55,alimiter=limit=0.8:attack=2:release=50:level=0,atrim=0:92[out]'
].join(';');
const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', A('ambience.wav'), '-i', A('music.wav'), '-i', A('sfx.wav'), '-filter_complex', fc, '-map', '[out]', '-ar', '48000', '-c:a', 'pcm_s16le', A('mix.wav')], {stdio: 'inherit'});
if (r.status) throw new Error('mix gagal'); console.log('mix.wav siap');
