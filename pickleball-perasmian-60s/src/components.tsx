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

// ---------- Gambar sebenar: latar kabur + kad tajam, Ken Burns perlahan ----------
export const Photo: React.FC<{src: string; mode: 'cover' | 'card'; local: number; w?: number; y?: number; ratio?: number; zoomFrom?: number; zoomTo?: number; dur?: number; pos?: string}> = ({src, mode, local, w = 940, y = 370, ratio = 4 / 3, zoomFrom = 1.0, zoomTo = 1.07, dur = 100, pos = '50% 50%'}) => {
  const z = zoomFrom + (zoomTo - zoomFrom) * Math.min(1, Math.max(0, local / dur));
  const url = staticFile(src);
  if (mode === 'cover') {
    return (<AbsoluteFill style={{overflow: 'hidden'}}><Img src={url} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${z})`}} /></AbsoluteFill>);
  }
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Img src={url} style={{position: 'absolute', inset: -60, width: 1200, height: 2040, objectFit: 'cover', filter: 'blur(38px) brightness(.45) saturate(1.2)'}} />
      <div style={{position: 'absolute', left: (1080 - w) / 2, top: y, width: w, height: w * ratio, borderRadius: 28, overflow: 'hidden', boxShadow: '0 22px 60px rgba(0,0,0,.55)', border: '8px solid #fff', boxSizing: 'content-box'}}>
        <Img src={url} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`, transformOrigin: '50% 40%'}} />
      </div>
    </AbsoluteFill>
  );
};
export const Scrim: React.FC<{top?: number; bottom?: number}> = ({top = 0, bottom = 0}) => (
  <AbsoluteFill>
    {top > 0 && <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 620, background: `linear-gradient(180deg, rgba(10,18,60,${top}) 0%, rgba(10,18,60,${top * 0.7}) 55%, rgba(10,18,60,0) 100%)`}} />}
    {bottom > 0 && <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 560, background: `linear-gradient(0deg, rgba(10,18,60,${bottom}) 0%, rgba(10,18,60,0) 100%)`}} />}
  </AbsoluteFill>
);

// ---------- Rakaman sebenar ----------
import {Sequence, useVideoConfig as _uvc} from 'remotion';
import {SceneStart} from './theme';

// Cut: potongan yang bermula pada frame mutlak `from`; media dalamnya mula dari 0.
export const Cut: React.FC<{from: number; dur: number; children: React.ReactNode}> = ({from, dur, children}) => {
  const base = React.useContext(SceneStart);
  return (
    <Sequence from={from - base} durationInFrames={dur} layout="none">
      <SceneStart.Provider value={from}>{children}</SceneStart.Provider>
    </Sequence>
  );
};

// Clip: video penuh (cover) atau kad (landscape) dengan latar kabur dari klip yang sama.
export const Clip: React.FC<{src: string; startFrom?: number; volume?: number; mode?: 'cover' | 'card'; zoom?: [number, number]; dur?: number; pos?: string; w?: number; y?: number}> = ({src, startFrom = 0, volume = 0, mode = 'cover', zoom = [1.0, 1.06], dur = 60, pos = '50% 50%', w = 1080, y = 560}) => {
  const f = useCurrentFrame();
  const z = zoom[0] + (zoom[1] - zoom[0]) * Math.min(1, f / dur);
  const url = staticFile(src);
  if (mode === 'cover') {
    return (
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <OffthreadVideo src={url} startFrom={startFrom} volume={volume} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${z})`}} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <OffthreadVideo src={url} startFrom={startFrom} volume={0} muted style={{position: 'absolute', inset: -80, width: 1240, height: 2080, objectFit: 'cover', filter: 'blur(40px) brightness(.45) saturate(1.2)'}} />
      <div style={{position: 'absolute', left: (1080 - w) / 2, top: y, width: w, height: w * 604 / 1080, overflow: 'hidden', boxShadow: '0 22px 60px rgba(0,0,0,.55)'}}>
        <OffthreadVideo src={url} startFrom={startFrom} volume={volume} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`}} />
      </div>
    </AbsoluteFill>
  );
};
