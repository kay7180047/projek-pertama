import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {Bg, Clip, Cut, H} from '../components';
import {C, beat, clamp, rise, useF} from '../theme';

const words1 = ['Bila', 'agensi', 'bertemu', 'di', 'gelanggang…'];

export const SceneB: React.FC = () => {
  const f = useF();
  const l2 = rise(f, beat('B.l2'), 50, 12);
  const l1dim = interpolate(f, [beat('B.l2'), beat('B.l2') + 10], [1, 0.55], clamp);
  return (
    <AbsoluteFill>
      <Bg scene="B" />
      <Cut from={300} dur={180}><Clip src="footage/f4.mp4" startFrom={0} volume={0} zoom={[1.0, 1.1]} dur={180} pos="50% 55%" /></Cut>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(14,24,76,.9) 0%, rgba(14,24,76,.7) 45%, rgba(14,24,76,.15) 70%, rgba(14,24,76,.0) 100%)'}} />
      <div style={{position: 'absolute', left: 70, right: 70, top: 260, opacity: l1dim}}>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '0 26px'}}>
          {words1.map((w, i) => {
            const r = rise(f, beat('B.l1') + i * 9, 36, 10);
            return <H key={w} size={104} style={{opacity: r.opacity, transform: `translateY(${r.y}px)`, textTransform: 'none'}}>{w}</H>;
          })}
        </div>
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 650, opacity: l2.opacity, transform: `translateY(${l2.y}px)`}}>
        <H size={96} color={C.teal} style={{textTransform: 'none', textShadow: '0 4px 12px rgba(0,0,0,.5)'}}>Siapa bakal angkat</H>
        <H size={112} color={C.ball} style={{textTransform: 'none', marginTop: 10, textShadow: '0 4px 12px rgba(0,0,0,.5)'}}>Piala Datuk Bandar?</H>
      </div>
    </AbsoluteFill>
  );
};
