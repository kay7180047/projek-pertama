import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bg, Card, H, P} from '../components';
import {C, useF, beat, pop, rise, slam} from '../theme';

const sp = [['tpx', '#010715'], ['kospek', '#FFFFFF'], ['yap', '#010715'], ['alliance', '#FFFFFF']] as const;

export const SceneF: React.FC = () => {
  const f = useF();
  const {fps} = useVideoConfig();
  const head = slam(f, beat('F.head'), 8);
  const coop = rise(f, beat('F.coop'), 36);
  return (
    <AbsoluteFill>
      <Bg scene="F" />
      <div style={{position: 'absolute', left: 70, top: 260, opacity: head.opacity, transform: `scale(${head.scale})`, transformOrigin: '0 50%'}}>
        <H size={120} color={C.ball}>PENAJA</H>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 470, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26}}>
        {sp.map(([id, bg], i) => {
          const p = pop(f, fps, beat('F.s0') + i * beat('F.step'));
          return (
            <div key={id} style={{height: 230, borderRadius: 30, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', opacity: p.opacity, transform: `scale(${p.scale})`, boxShadow: '0 14px 40px rgba(5,10,40,.45)'}}>
              <Img src={staticFile(`assets/sponsors-hd/${id}.jpg`)} style={{maxWidth: 380, maxHeight: 190, objectFit: 'contain'}} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 1000, opacity: coop.opacity, transform: `translateY(${coop.y}px)`}}>
        <P size={44} color={C.teal} weight={800} style={{letterSpacing: 5}}>DENGAN KERJASAMA</P>
        <H size={72} style={{marginTop: 16, lineHeight: 1.05}}>PAHANG PICKLEBALL ASSOCIATION</H>
      </div>
    </AbsoluteFill>
  );
};
