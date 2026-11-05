import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile} from 'remotion';
import {Bg, H, P} from '../components';
import {C, beat, clamp, easeOut, rise, useF} from '../theme';

// Urutan: Majlis -> KESUMBA (anjuran) -> Biro (urusetia, paling akhir)
const logos = [
  {src: 'assets/logo-mbk.jpg', bg: '#FFFFFF', top: 235, h: 300, img: 250, at: 'I.l1'},
  {src: 'assets/logo-kesumba.jpg', bg: '#F7F7F7', top: 560, h: 300, img: 240, at: 'I.l2'},
  {src: 'assets/logo-biro.jpg', bg: '#FFFFFF', top: 1010, h: 400, img: 350, at: 'I.l3'},
];

const Chip: React.FC<{text: string; top: number; at: number; f: number}> = ({text, top, at, f}) => {
  const r = rise(f, at, 24, 10);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', opacity: r.opacity, transform: `translateY(${r.y}px)`}}>
      <div style={{display: 'inline-block', background: C.teal, color: C.navyDeep, fontFamily: 'Inter', fontWeight: 900, fontSize: 46, padding: '10px 44px', borderRadius: 16, letterSpacing: 8}}>{text}</div>
    </div>
  );
};

export const SceneI: React.FC = () => {
  const f = useF();
  const name = rise(f, beat('I.l3') + 26, 30, 14);
  return (
    <AbsoluteFill>
      <Bg scene="I" />
      <Chip text="ANJURAN" top={130} at={beat('I.head')} f={f} />
      <Chip text="URUSETIA" top={900} at={beat('I.u')} f={f} />
      <div style={{position: 'absolute', inset: 0, perspective: 1400}}>
        {logos.map((l) => {
          const at = beat(l.at);
          const e = interpolate(f - at, [0, 28], [0, 1], {...clamp, easing: easeOut});
          return (
            <div key={l.src} style={{position: 'absolute', left: 160, right: 160, top: l.top, height: l.h, display: 'flex', alignItems: 'center', justifyContent: 'center', background: l.bg, borderRadius: 36, boxShadow: '0 18px 50px rgba(5,10,40,.5)', opacity: interpolate(f - at, [0, 4], [0, 1], clamp), transform: `rotateY(${720 * (1 - e)}deg) scale(${0.25 + 0.75 * e})`}}>
              <Img src={staticFile(l.src)} style={{height: l.img, maxWidth: 700, objectFit: 'contain'}} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 1440, textAlign: 'center', opacity: name.opacity, transform: `translateY(${name.y}px)`}}>
        <P size={42} color="#fff" weight={800}>Biro Sukan dan Rekreasi KESUMBA</P>
      </div>
    </AbsoluteFill>
  );
};
