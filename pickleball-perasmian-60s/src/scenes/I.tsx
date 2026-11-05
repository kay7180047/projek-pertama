import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile} from 'remotion';
import {Bg, H, P} from '../components';
import {C, beat, clamp, easeOut, rise, useF} from '../theme';

export const SceneI: React.FC = () => {
  const f = useF();
  const head = rise(f, beat('I.head'), 30, 12);
  const at = beat('I.l1');
  const e = interpolate(f - at, [0, 30], [0, 1], {...clamp, easing: easeOut});
  const name = rise(f, at + 30, 30, 14);
  const breathe = 1 + 0.025 * Math.sin(Math.max(0, f - at - 30) / 9);
  return (
    <AbsoluteFill>
      <Bg scene="I" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', opacity: head.opacity, transform: `translateY(${head.y}px)`}}>
        <div style={{display: 'inline-block', background: C.teal, color: C.navyDeep, fontFamily: 'Inter', fontWeight: 900, fontSize: 60, padding: '16px 56px', borderRadius: 18, letterSpacing: 10}}>URUSETIA</div>
      </div>
      <div style={{position: 'absolute', left: 130, right: 130, top: 500, height: 760, perspective: 1400}}>
        <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 44, boxShadow: '0 24px 70px rgba(5,10,40,.55)', opacity: interpolate(f - at, [0, 4], [0, 1], clamp), transform: `rotateY(${720 * (1 - e)}deg) scale(${(0.25 + 0.75 * e) * breathe})`}}>
          <Img src={staticFile('assets/logo-biro.jpg')} style={{height: 680, maxWidth: 780, objectFit: 'contain'}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 1330, textAlign: 'center', opacity: name.opacity, transform: `translateY(${name.y}px)`}}>
        <H size={64} style={{textAlign: 'center', lineHeight: 1.05}}>BIRO SUKAN DAN</H>
        <H size={64} color={C.ball} style={{textAlign: 'center', marginTop: 4}}>REKREASI KESUMBA</H>
      </div>
    </AbsoluteFill>
  );
};
