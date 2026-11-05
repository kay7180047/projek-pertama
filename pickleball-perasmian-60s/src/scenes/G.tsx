import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Ball, Bg, Card, H, P} from '../components';
import {C, useF, beat, clamp, pop, rise, slam} from '../theme';

export const SceneG: React.FC = () => {
  const f = useF();
  const {fps} = useVideoConfig();
  const w1 = slam(f, beat('G.w1'), 8), w2 = slam(f, beat('G.w2'), 8), w3 = slam(f, beat('G.w3'), 8);
  const info = rise(f, beat('G.info'), 30);
  const logos = pop(f, fps, beat('G.logos'));
  const out = interpolate(f, [1785, 1800], [1, 0], clamp);
  const flash = interpolate(f, [1680, 1688], [0.5, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <Bg scene="G" />
      <div style={{position: 'absolute', left: 70, top: 220}}>
        <div style={{opacity: w1.opacity, transform: `scale(${w1.scale})`, transformOrigin: '0 50%'}}><H size={170} color={C.ball} style={{textShadow: '0 8px 0 rgba(0,0,0,.25)'}}>JOM</H></div>
        <div style={{opacity: w2.opacity, transform: `scale(${w2.scale})`, transformOrigin: '0 50%', marginTop: 4}}><H size={150}>SOKONG</H></div>
        <div style={{opacity: w3.opacity, transform: `scale(${w3.scale})`, transformOrigin: '0 50%', marginTop: 4}}><H size={92}>PASUKAN PILIHAN ANDA!</H></div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 770, height: 400, overflow: 'hidden', opacity: logos.opacity, transform: `scale(${logos.scale})`, borderTop: `10px solid ${C.teal}`, borderBottom: `10px solid ${C.red}`}}>
        <Img src={staticFile('photos/p7.jpg')} style={{width: 1080, height: 1440, objectFit: 'cover', marginTop: -470, transform: `scale(${1 + 0.05 * Math.min(1, (f - 1758) / 40)})`, transformOrigin: '50% 40%'}} />
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 1230, opacity: info.opacity, transform: `translateY(${info.y}px)`}}>
        <Card style={{padding: '30px 40px', borderLeft: `16px solid ${C.red}`, borderRadius: 30}}>
          <H size={54} color={C.blue} style={{fontStyle: 'normal'}}>RABU &amp; KHAMIS</H>
          <P size={42} color="#33406F" weight={800} style={{marginTop: 10}}>The Pickle Exchange</P>
          <P size={42} color="#33406F" weight={700} style={{marginTop: 6}}>4 Nov – 16 Dis 2026</P>
        </Card>
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};
