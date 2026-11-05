import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bg, H, P} from '../components';
import {C, useF, beat, clamp, pop, rise, slam} from '../theme';
import T from '../timeline.json';

const teams = [
  ['supa', 'SUPA WARRIORS'], ['mbk', 'MBK PICKLE FLUX'], ['elephant', 'ELEPHANT WARRIOR'], ['im', 'IM THUNDERBOLTS'],
  ['picklenp', 'PICKLENP PKNP'], ['pasfa', 'PASFA'], ['pnpp', 'PNPP PICKLEBALL'], ['picklepp', 'PICKLEPP'],
  ['iium', 'IIUM KUANTAN'], ['waterblast', 'WATERBLAST'],
];

export const SceneE: React.FC = () => {
  const f = useF();
  const {fps} = useVideoConfig();
  const head = slam(f, beat('E.head'), 9);
  const c0 = beat('E.c0'), step = beat('E.step');
  const end = beat('E.end');
  const scrim = interpolate(f, [end, end + 8], [0, 0.86], clamp);
  const q = slam(f, end + 2, 10);
  return (
    <AbsoluteFill>
      <Bg scene="E" />
      <div style={{position: 'absolute', left: 60, top: 170, opacity: head.opacity, transform: `scale(${head.scale})`, transformOrigin: '0 50%', display: 'flex', alignItems: 'center', gap: 26}}>
        <H size={190} color={C.ball} style={{textShadow: '0 8px 0 rgba(0,0,0,.25)'}}>10</H>
        <div>
          <H size={80}>PASUKAN</H>
          <P size={44} color={C.teal} weight={800} style={{letterSpacing: 5, marginTop: 6}}>BERTANDING</P>
        </div>
      </div>
      {teams.map(([id, name], i) => {
        const at = c0 + i * step;
        const p = pop(f, fps, at);
        const ring = interpolate(f, [at, at + 20], [1, 0], clamp);
        const col = i % 2, row = Math.floor(i / 2);
        return (
          <div key={id} style={{position: 'absolute', left: 60 + col * 510, top: 395 + row * 235, width: 450, height: 210, opacity: p.opacity, transform: `scale(${p.scale})`}}>
            <div style={{height: '100%', borderRadius: 30, background: '#F7F8FA', display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', boxShadow: '0 10px 30px rgba(5,10,40,.4)', border: `${3 + ring * 6}px solid rgba(51,193,206,${0.2 + ring * 0.8})`}}>
              <div style={{width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                <Img src={staticFile(`assets/teams/${id}.png`)} style={{maxWidth: 150, maxHeight: 150, objectFit: 'contain'}} />
              </div>
              <H size={28} color={C.blue} style={{fontStyle: 'normal', lineHeight: 1.1, letterSpacing: 0}}>{name}</H>
            </div>
          </div>
        );
      })}
      <AbsoluteFill style={{background: `rgba(14,22,70,${scrim})`, justifyContent: 'center', padding: '0 70px'}}>
        {f >= end && (
          <div style={{opacity: q.opacity, transform: `scale(${q.scale})`}}>
            <H size={120}>SIAPA AKAN</H>
            <H size={120} color={C.ball} style={{marginTop: 6}}>MENJULANG</H>
            <H size={120} style={{marginTop: 6}}>PIALA?</H>
            <P size={44} color={C.teal} weight={800} style={{marginTop: 34, letterSpacing: 3}}>PIALA DATUK BANDAR KUANTAN 2026</P>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
