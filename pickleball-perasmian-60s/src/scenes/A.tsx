import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Ball, Bg, Clip, Cut, H, P, Scrim} from '../components';
import {C, useF, beat, clamp, easeInOut, easeOut, pop, slam} from '../theme';

const rows = [
  {k: 'A.n1', n: '10', a: 'PASUKAN', b: 'BERTANDING', nc: '#fff'},
  {k: 'A.n2', n: '5', a: 'ACARA', b: 'SETIAP PASUKAN', nc: '#fff'},
  {k: 'A.n3', n: '1', a: 'PIALA', b: 'DATUK BANDAR', nc: C.ball},
];

export const SceneA: React.FC = () => {
  const f = useF();
  const {fps} = useVideoConfig();
  const t = beat('A.title');
  const shrink = interpolate(f, [t, t + 16], [0, 1], {...clamp, easing: easeInOut});
  const scale = 1 - 0.46 * shrink;
  const ty = -230 * shrink;
  const title = pop(f, fps, t + 6);
  // bola melintas masa title muncul
  const bx = interpolate(f, [t - 4, t + 18], [-250, 1330], {...clamp, easing: easeInOut});
  const by = interpolate(f, [t - 4, t + 18], [1250, 520], {...clamp, easing: easeOut});
  return (
    <AbsoluteFill>
      <Bg scene="A" />
      <Cut from={0} dur={180}><Clip src="footage/f3.mp4" startFrom={0} volume={0.35} zoom={[1.12, 1.0]} dur={180} pos="50% 60%" /></Cut>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(14,24,76,.82) 0%, rgba(14,24,76,.55) 45%, rgba(14,24,76,.25) 100%)'}} />
      <div style={{position: 'absolute', left: 80, top: 250, transformOrigin: '0 0', transform: `translateY(${ty}px) scale(${scale})`}}>
        {rows.map((r) => {
          const s = slam(f, beat(r.k));
          return (
            <div key={r.k} style={{display: 'flex', alignItems: 'center', gap: 36, height: 340, opacity: s.opacity, transform: `scale(${s.scale})`, transformOrigin: '0 50%'}}>
              <H size={r.n.length > 1 ? 330 : 360} color={r.nc} style={{minWidth: 440, textShadow: '0 10px 0 rgba(0,0,0,.25)'}}>{r.n}</H>
              <div>
                <H size={92} color="#fff">{r.a}</H>
                <P size={40} color={C.teal} weight={800} style={{letterSpacing: 4, marginTop: 8}}>{r.b}</P>
              </div>
            </div>
          );
        })}
      </div>
      {f >= t - 4 && (
        <div style={{position: 'absolute', left: bx, top: by, transform: 'translate(-50%,-50%)'}}>
          <div style={{position: 'absolute', right: 60, top: 70, width: 520, height: 50, background: `linear-gradient(90deg, transparent, rgba(247,179,43,.65))`, borderRadius: 40, transform: 'rotate(-23deg)', transformOrigin: '100% 50%'}} />
          <Ball size={190} spin={f * 12} />
        </div>
      )}
      <div style={{position: 'absolute', left: 60, right: 60, top: 820, opacity: title.opacity, transform: `scale(${title.scale})`, transformOrigin: '50% 0'}}>
        <div style={{background: '#F7F8FA', borderRadius: 40, padding: '44px 36px 40px', boxShadow: '0 18px 50px rgba(5,10,40,.5)', borderBottom: `14px solid ${C.red}`}}>
          <H size={70} color={C.blue} style={{textAlign: 'center'}}>KEJOHANAN PICKLEBALL</H>
          <H size={118} color={C.red} style={{textAlign: 'center', marginTop: 4}}>BERPASUKAN</H>
          <div style={{height: 6, background: C.teal, margin: '22px 40px'}} />
          <P size={44} color={C.blue} weight={900} style={{textAlign: 'center', letterSpacing: 2}}>PIALA DATUK BANDAR KUANTAN 2026</P>
        </div>
      </div>
    </AbsoluteFill>
  );
};
