import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';

// 100 BPM -> 1 bar = 2.4s = 72 frame @30fps. Satu gambar = satu bar (potongan jatuh atas downbeat).
export const FPS = 30;
export const BAR = 72;
export const LIME = '#D7F23A';
export const NAVY = '#07143A';
const ASPECT = 1.5011; // semua gambar 3:2 (Nikon Z8)
export const FONT = "'Inter', 'Inter Display', sans-serif";

export type Item = {src: string; layout: 'cover' | 'contain'; fx: number; chapter: string};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const Slide: React.FC<{it: Item; k: number; dur?: number; photoDir?: string}> = ({it, k, dur = BAR, photoDir = 'photos'}) => {
  const f = useCurrentFrame();
  const p = f / dur;
  const punch = interpolate(f, [0, 9], [1.08, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const dir = k % 2 === 0 ? 1 : -1;
  const url = staticFile(`${photoDir}/${it.src}`);
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
