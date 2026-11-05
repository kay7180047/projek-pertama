import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {Bg, Clip, Cut, H, P, Scrim} from '../components';
import {C, beat, clamp, rise, slam, useF} from '../theme';

export const SceneH: React.FC = () => {
  const f = useF();
  const a = slam(f, beat('H.head'), 9);
  const b = rise(f, beat('H.head') + 10, 30);
  const flash = (at: number) => interpolate(f, [at, at + 6], [0.4, 0], clamp);
  const at = [1380, 1425, 1470, 1515].filter((x) => f >= x).pop() ?? 1380;
  return (
    <AbsoluteFill>
      <Bg scene="H" />
      <Cut from={1380} dur={45}><Clip src="footage/f3.mp4" startFrom={165} volume={0.35} zoom={[1.0, 1.08]} dur={45} pos="50% 60%" /></Cut>
      <Cut from={1425} dur={45}><Clip src="footage/f6.mp4" mode="card" volume={0} zoom={[1.0, 1.1]} dur={45} w={1080} y={640} /></Cut>
      <Cut from={1470} dur={45}><Clip src="footage/f8.mp4" volume={0.45} zoom={[1.0, 1.06]} dur={45} pos="50% 50%" /></Cut>
      <Cut from={1515} dur={45}><Clip src="footage/f5.mp4" volume={0.5} zoom={[1.0, 1.08]} dur={45} pos="50% 50%" /></Cut>
      <Scrim top={0.88} bottom={0.45} />
      <div style={{position: 'absolute', left: 70, top: 190, opacity: a.opacity, transform: `scale(${a.scale})`, transformOrigin: '0 50%'}}>
        <H size={110} style={{textShadow: '0 6px 0 rgba(0,0,0,.3)'}}>PERLAWANAN</H>
        <H size={110} color={C.ball} style={{marginTop: 6, textShadow: '0 6px 0 rgba(0,0,0,.3)'}}>HARI PERTAMA</H>
      </div>
      <div style={{position: 'absolute', left: 70, bottom: 360, opacity: b.opacity, transform: `translateY(${b.y}px)`}}>
        <div style={{display: 'inline-block', background: C.teal, color: C.navyDeep, fontFamily: 'Inter', fontWeight: 900, fontSize: 44, padding: '12px 30px', borderRadius: 14, letterSpacing: 3}}>4 NOV 2026</div>
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: flash(at), pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
