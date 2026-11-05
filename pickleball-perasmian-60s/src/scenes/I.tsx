import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile} from 'remotion';
import {Bg, H, P} from '../components';
import {C, beat, clamp, easeOut, rise, useF} from '../theme';

const logos = [
  {src: 'assets/logo-mbk.jpg', bg: '#FFFFFF', h: 290, at: 'I.l1'},
  {src: 'assets/logo-kesumba.jpg', bg: '#F7F7F7', h: 275, at: 'I.l2'},
  {src: 'assets/logo-biro.jpg', bg: '#FFFFFF', h: 290, at: 'I.l3'},
];

export const SceneI: React.FC = () => {
  const f = useF();
  const head = rise(f, beat('I.head'), 30, 12);
  return (
    <AbsoluteFill>
      <Bg scene="I" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: head.opacity, transform: `translateY(${head.y}px)`}}>
        <div style={{display: 'inline-block', background: C.teal, color: C.navyDeep, fontFamily: 'Inter', fontWeight: 900, fontSize: 52, padding: '14px 44px', borderRadius: 16, letterSpacing: 8}}>URUSETIA</div>
      </div>
      <div style={{position: 'absolute', left: 150, right: 150, top: 290, display: 'flex', flexDirection: 'column', gap: 30, perspective: 1200}}>
        {logos.map((l) => {
          const at = beat(l.at);
          const e = interpolate(f - at, [0, 28], [0, 1], {...clamp, easing: easeOut});
          return (
            <div key={l.src} style={{height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', background: l.bg, borderRadius: 36, boxShadow: '0 18px 50px rgba(5,10,40,.5)', opacity: interpolate(f - at, [0, 4], [0, 1], clamp), transform: `rotateY(${720 * (1 - e)}deg) scale(${0.25 + 0.75 * e})`}}>
              <Img src={staticFile(l.src)} style={{height: l.h, maxWidth: 700, objectFit: 'contain'}} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 1500, textAlign: 'center', opacity: interpolate(f - beat('I.l3'), [18, 30], [0, 1], clamp)}}>
        <P size={38} color="#fff" weight={800} style={{letterSpacing: 1}}>Biro Sukan dan Rekreasi KESUMBA</P>
      </div>
    </AbsoluteFill>
  );
};
