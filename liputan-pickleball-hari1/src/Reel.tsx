import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import selection from './selection.json';

// 100 BPM -> 1 bar = 2.4s = 72 frame @30fps. Satu gambar = satu bar (potongan jatuh atas downbeat).
export const FPS = 30;
export const BAR = 72;
export const N = 75; // 75 x 2.4s = 180s
const LIME = '#D7F23A';
const NAVY = '#07143A';
const ASPECT = 1.5011; // semua gambar 3:2 (Nikon Z8)
const FONT = "'Inter', 'Inter Display', sans-serif";

type Item = {src: string; layout: 'cover' | 'contain'; fx: number; chapter: string};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const Slide: React.FC<{it: Item; k: number}> = ({it, k}) => {
  const f = useCurrentFrame();
  const p = f / BAR;
  const punch = interpolate(f, [0, 9], [1.08, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const dir = k % 2 === 0 ? 1 : -1;
  const url = staticFile(`photos/${it.src}`);
  if (it.layout === 'contain') {
    const kb = 1 + 0.055 * p;
    return (
      <AbsoluteFill style={{background: NAVY}}>
        <Img src={url} style={{position: 'absolute', inset: -120, width: 1320, height: 2160, objectFit: 'cover', filter: 'blur(34px) brightness(0.7) saturate(1.3)'}} />
        <div style={{position: 'absolute', left: -108, top: 500, width: 1296, height: 1296 / ASPECT, transform: `scale(${kb * punch}) translateX(${dir * p * -14}px)`, boxShadow: '0 30px 80px rgba(0,0,0,0.55)'}}>
          <Img src={url} style={{width: '100%', height: '100%'}} />
        </div>
      </AbsoluteFill>
    );
  }
  const W = 1920 * ASPECT;
  const base = clamp(540 - it.fx * W, 1080 - W, 0);
  const left = clamp(base + dir * (p - 0.5) * 70, 1080 - W, 0);
  return (
    <AbsoluteFill style={{background: NAVY, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${(1 + 0.065 * p) * punch})`, transformOrigin: '50% 42%'}}>
        <Img src={url} style={{position: 'absolute', top: 0, left, height: 1920, width: W}} />
      </div>
    </AbsoluteFill>
  );
};

const Hud: React.FC<{items: Item[]; part: number}> = ({items, part}) => {
  const frame = useCurrentFrame();
  const total = BAR * N;
  const k = Math.min(N - 1, Math.floor(frame / BAR));
  const chapter = items[k].chapter;
  let run = k;
  while (run > 0 && items[run - 1].chapter === chapter) run--;
  const since = frame - run * BAR;
  const pillIn = interpolate(since, [0, 10], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const flash = run > 0 || true ? interpolate(since, [0, 6], [run > 0 ? 0.4 : 0, 0], {extrapolateRight: 'clamp'}) : 0;

  // kad pembuka (bar pertama) & kad penutup (bar terakhir)
  const tIn = interpolate(frame, [4, 20], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.4))});
  const tOut = interpolate(frame, [54, 68], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const title = frame < BAR ? tIn * tOut : 0;
  const ef = frame - (total - BAR);
  const endIn = interpolate(ef, [4, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});

  return (
    <AbsoluteFill style={{fontFamily: FONT, color: 'white'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 300, background: 'linear-gradient(rgba(4,10,35,0.85), rgba(4,10,35,0))'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 620, background: 'linear-gradient(rgba(4,10,35,0), rgba(4,10,35,0.82))'}} />
      <div style={{position: 'absolute', left: 56, top: 84, display: 'flex', alignItems: 'center', gap: 20}}>
        <div style={{width: 34, height: 34, borderRadius: 17, background: LIME, boxShadow: `0 0 0 6px rgba(215,242,58,0.25)`}} />
        <div>
          <div style={{fontSize: 33, fontWeight: 800, letterSpacing: 2.5, lineHeight: 1.1}}>KEJOHANAN PICKLEBALL BERPASUKAN</div>
          <div style={{fontSize: 25, fontWeight: 600, letterSpacing: 2, opacity: 0.82, marginTop: 6}}>PIALA DATUK BANDAR KUANTAN 2026</div>
        </div>
      </div>

      {/* kad pembuka */}
      <div style={{position: 'absolute', left: 56, top: 1262, opacity: title, transform: `translateY(${(1 - title) * 50}px)`}}>
        <div style={{fontSize: 34, fontWeight: 800, letterSpacing: 8, color: LIME}}>LIPUTAN</div>
        <div style={{fontSize: 190, fontWeight: 900, lineHeight: 0.92, letterSpacing: -6, marginLeft: -6}}>HARI 1</div>
        <div style={{fontSize: 36, fontWeight: 700, letterSpacing: 3, marginTop: 10}}>4 NOV 2026 · BAHAGIAN {part}/3</div>
      </div>

      {/* kad penutup */}
      {ef > 0 && (
        <div style={{position: 'absolute', left: 56, top: 1262, opacity: endIn, transform: `translateY(${(1 - endIn) * 50}px)`}}>
          <div style={{fontSize: 34, fontWeight: 800, letterSpacing: 8, color: LIME}}>{part < 3 ? `BAHAGIAN ${part}/3 TAMAT` : 'LIPUTAN HARI 1'}</div>
          <div style={{fontSize: 104, fontWeight: 900, lineHeight: 1, letterSpacing: -2}}>{part < 3 ? <>BERSAMBUNG <span style={{color: LIME}}>→</span></> : 'TAMAT'}</div>
          <div style={{fontSize: 36, fontWeight: 700, letterSpacing: 3, marginTop: 14}}>{part < 3 ? `BAHAGIAN ${part + 1}/3` : '4 NOV 2026'}</div>
        </div>
      )}

      {/* label bab + kaunter */}
      <div style={{position: 'absolute', left: 56, right: 56, top: 1578, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{opacity: pillIn, transform: `translateY(${(1 - pillIn) * 24}px)`, background: LIME, color: NAVY, fontWeight: 900, fontSize: 34, letterSpacing: 3, padding: '12px 26px', borderRadius: 40}}>
          {chapter}
        </div>
        <div style={{fontSize: 40, fontWeight: 800, letterSpacing: 2, fontVariantNumeric: 'tabular-nums'}}>
          {String(k + 1).padStart(2, '0')}<span style={{opacity: 0.55}}> / {N}</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 56, right: 56, top: 1664, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.22)'}}>
        <div style={{width: `${(frame / total) * 100}%`, height: '100%', borderRadius: 3, background: LIME}} />
      </div>
      <AbsoluteFill style={{background: 'white', opacity: flash}} />
    </AbsoluteFill>
  );
};

export const Reel: React.FC<{part: number}> = ({part}) => {
  const items = (selection as Item[][])[part - 1];
  return (
    <AbsoluteFill style={{background: NAVY}}>
      {items.map((it, k) => (
        <Sequence key={it.src} from={k * BAR} durationInFrames={BAR} name={`${k + 1} ${it.src}`}>
          <Slide it={it} k={k} />
        </Sequence>
      ))}
      <Hud items={items} part={part} />
      <Audio src={staticFile(`audio/bahagian${part}.mp3`)} />
    </AbsoluteFill>
  );
};
