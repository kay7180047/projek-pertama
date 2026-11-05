import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Ball, Bg, H, Paddle} from '../components';
import {C, useF, beat, clamp, rise} from '../theme';

const hits = ['B.h1', 'B.h2', 'B.h3', 'B.h4', 'B.h5', 'B.h6'].map((k, i) => ({f: beat(k), x: i % 2 === 0 ? 170 : 910}));
const words1 = ['Bila', 'agensi', 'bertemu', 'di', 'gelanggang…'];

export const SceneB: React.FC = () => {
  const f = useF();
  // laluan bola: lengkung antara setiap pukulan
  const pts = [{f: hits[0].f - 30, x: -200}, ...hits, {f: hits[5].f + 30, x: 1300}];
  let bx = -200, by = 1500;
  for (let i = 0; i < pts.length - 1; i++) {
    if (f >= pts[i].f && f <= pts[i + 1].f) {
      const u = (f - pts[i].f) / (pts[i + 1].f - pts[i].f);
      bx = pts[i].x + (pts[i + 1].x - pts[i].x) * u;
      by = 1500 - 360 * 4 * u * (1 - u);
    }
  }
  const swing = (k: number) => {
    const d = f - hits[k].f;
    return d >= 0 && d < 10 ? Math.sin((d / 10) * Math.PI) * 28 : 0;
  };
  const l2 = rise(f, beat('B.l2'), 50, 12);
  const l1dim = interpolate(f, [beat('B.l2'), beat('B.l2') + 10], [1, 0.5], clamp);
  return (
    <AbsoluteFill>
      <Bg scene="B" tint={0.12} />
      <div style={{position: 'absolute', left: 70, right: 70, top: 300, opacity: l1dim}}>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '0 26px'}}>
          {words1.map((w, i) => {
            const r = rise(f, beat('B.l1') + i * 9, 36, 10);
            return <H key={w} size={104} style={{opacity: r.opacity, transform: `translateY(${r.y}px)`, textTransform: 'none', fontStyle: 'italic'}}>{w}</H>;
          })}
        </div>
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 690, opacity: l2.opacity, transform: `translateY(${l2.y}px)`}}>
        <H size={96} color={C.teal} style={{textTransform: 'none'}}>Siapa bakal angkat</H>
        <H size={112} color={C.ball} style={{textTransform: 'none', marginTop: 10}}>Piala Datuk Bandar?</H>
      </div>
      {/* dua dayung */}
      <div style={{position: 'absolute', left: 20, top: 1380, opacity: 0.95}}><Paddle color={C.teal} angle={20 - swing(0) - swing(2) - swing(4)} /></div>
      <div style={{position: 'absolute', left: 890, top: 1380}}><Paddle color={C.red} flip angle={-20 + swing(1) + swing(3) + swing(5)} /></div>
      {/* bayang & bola */}
      <div style={{position: 'absolute', left: bx - 60, top: 1650, width: 120, height: 24, borderRadius: 60, background: 'rgba(0,0,0,.3)', transform: `scale(${1 - (1500 - by) / 1200})`}} />
      <div style={{position: 'absolute', left: bx, top: by, transform: 'translate(-50%,-50%)'}}>
        <Ball size={120} spin={f * 10} />
      </div>
    </AbsoluteFill>
  );
};
