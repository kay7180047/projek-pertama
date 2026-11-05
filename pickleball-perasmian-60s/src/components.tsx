import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT, clamp, easeInOut} from './theme';
import {footage} from './footage';
import T from './timeline.json';

// ---------- Latar jenama: navy + slab teal serong (ikut poster) ----------
export const Bg: React.FC<{scene: string; tint?: number}> = ({scene, tint = 0}) => {
  const f = useCurrentFrame();
  const drift = Math.sin(f / 70) * 30;
  const slot = footage[scene];
  return (
    <AbsoluteFill style={{background: `linear-gradient(165deg, ${C.navyDeep} 0%, ${C.navy} 55%, #19296E 100%)`, overflow: 'hidden'}}>
      {slot && (
        <AbsoluteFill style={{opacity: 0.55}}>
          {slot.type === 'video' ? (
            <OffthreadVideo src={staticFile(slot.src)} startFrom={slot.startFrom ?? 0} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          ) : (
            <Img src={staticFile(slot.src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          )}
        </AbsoluteFill>
      )}
      {/* slab teal & biru serong */}
      <div style={{position: 'absolute', left: -300 + drift, top: 1180, width: 1900, height: 520, background: C.teal, opacity: 0.16, transform: 'rotate(-18deg)'}} />
      <div style={{position: 'absolute', left: -200 - drift, top: 1330, width: 1900, height: 360, background: C.blue, opacity: 0.55, transform: 'rotate(-18deg)'}} />
      <div style={{position: 'absolute', left: 560 + drift, top: -260, width: 260, height: 1500, background: C.teal, opacity: 0.1, transform: 'rotate(18deg)'}} />
      {/* garisan gelanggang halus */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.07}}>
        <g stroke="#fff" strokeWidth={4} fill="none">
          <rect x={60} y={150} width={960} height={1500} />
          <line x1={60} y1={900} x2={1020} y2={900} />
          <line x1={60} y1={560} x2={1020} y2={560} />
          <line x1={60} y1={1240} x2={1020} y2={1240} />
          <line x1={540} y1={150} x2={540} y2={560} />
          <line x1={540} y1={1240} x2={540} y2={1650} />
        </g>
      </svg>
      <AbsoluteFill style={{background: `rgba(10,18,60,${tint})`}} />
    </AbsoluteFill>
  );
};

// ---------- Bola pickleball ----------
export const Ball: React.FC<{size: number; spin?: number}> = ({size, spin = 0}) => {
  const holes = [[.3,.3],[.55,.22],[.75,.4],[.25,.58],[.5,.5],[.72,.68],[.4,.78],[.6,.85],[.15,.42],[.85,.55]];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{transform: `rotate(${spin}deg)`}}>
      <defs>
        <radialGradient id="bg" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFE08A" />
          <stop offset="55%" stopColor={C.ball} />
          <stop offset="100%" stopColor={C.ballDark} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#bg)" />
      {holes.map(([x, y], i) => (
        <ellipse key={i} cx={x * 100} cy={y * 100} rx={6.5} ry={6} fill={C.ballDark} opacity={0.75} />
      ))}
    </svg>
  );
};

export const Paddle: React.FC<{color: string; angle: number; flip?: boolean}> = ({color, angle, flip}) => (
  <div style={{transform: `rotate(${angle}deg) scaleX(${flip ? -1 : 1})`, transformOrigin: '50% 90%'}}>
    <div style={{width: 170, height: 210, borderRadius: 70, background: color, border: '10px solid #fff', boxShadow: '0 10px 30px rgba(0,0,0,.35)'}} />
    <div style={{width: 34, height: 90, margin: '-4px auto 0', background: '#fff', borderRadius: 12}} />
  </div>
);

// ---------- Wipe serong (peralihan terkawal) ----------
export const Wipes: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      {T.wipes.map((b) => {
        if (f < b - 13 || f > b + 13) return null;
        const p = interpolate(f, [b - 12, b + 12], [0, 1], {...clamp, easing: easeInOut});
        const x = -3500 + p * 4880;
        return (
          <div key={b} style={{position: 'absolute', left: x, top: -300, width: 3200, height: 2500, transform: 'skewX(-14deg)'}}>
            <div style={{position: 'absolute', left: 0, width: 2600, height: '100%', background: C.navyDeep}} />
            <div style={{position: 'absolute', left: 2600, width: 70, height: '100%', background: C.red}} />
            <div style={{position: 'absolute', left: 2670, width: 450, height: '100%', background: C.teal}} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- Kad putih / teks ----------
export const Card: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
  <div style={{background: '#F7F8FA', borderRadius: 36, boxShadow: '0 18px 50px rgba(5,10,40,.45)', ...style}}>{children}</div>
);

export const H: React.FC<{size: number; color?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({size, color = '#fff', style, children}) => (
  <div style={{fontFamily: FONT, fontWeight: 900, fontStyle: 'italic', fontSize: size, lineHeight: 1.0, color, letterSpacing: -1, textTransform: 'uppercase', ...style}}>{children}</div>
);
export const P: React.FC<{size: number; color?: string; weight?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({size, color = C.ice, weight = 600, style, children}) => (
  <div style={{fontFamily: FONT, fontWeight: weight, fontSize: size, lineHeight: 1.15, color, ...style}}>{children}</div>
);
