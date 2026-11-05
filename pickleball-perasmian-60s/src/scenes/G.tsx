import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Ball, Bg, Card, H, P} from '../components';
import {C, useF, beat, clamp, pop, rise, slam} from '../theme';

const teamIds = ['supa', 'mbk', 'elephant', 'im', 'picklenp', 'pasfa', 'pnpp', 'picklepp', 'iium', 'waterblast'];

export const SceneG: React.FC = () => {
  const f = useF();
  const {fps} = useVideoConfig();
  const w1 = slam(f, beat('G.w1'), 8), w2 = slam(f, beat('G.w2'), 8), w3 = slam(f, beat('G.w3'), 8);
  const info = rise(f, beat('G.info'), 30);
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
      <div style={{position: 'absolute', left: 51, top: 780, width: 978, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14}}>
        {teamIds.map((id, i) => {
          const p = pop(f, fps, beat('G.logos') + i * 3);
          return (
            <div key={id} style={{height: 190, borderRadius: 24, background: '#F7F8FA', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: p.opacity, transform: `scale(${p.scale})`, boxShadow: '0 8px 24px rgba(5,10,40,.4)'}}>
              <Img src={staticFile(`assets/teams/${id}.png`)} style={{maxWidth: 160, maxHeight: 150, objectFit: 'contain'}} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 1230, opacity: info.opacity, transform: `translateY(${info.y}px)`}}>
        <Card style={{padding: '30px 40px', borderLeft: `16px solid ${C.red}`, borderRadius: 30}}>
          <H size={54} color={C.blue} style={{fontStyle: 'normal'}}>RABU &amp; KHAMIS</H>
          <P size={42} color="#33406F" weight={800} style={{marginTop: 10}}>The Pickle Exchange</P>
          <P size={42} color="#33406F" weight={700} style={{marginTop: 6}}>4 Nov – 9 Dis 2026</P>
        </Card>
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};
