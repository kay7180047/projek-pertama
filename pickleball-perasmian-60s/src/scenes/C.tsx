import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bg, Card, H, P} from '../components';
import {C, useF, beat, clamp, pop, rise, slam} from '../theme';

const Pin = () => (
  <svg width={64} height={80} viewBox="0 0 64 80">
    <path d="M32 2C16 2 4 14 4 30c0 22 28 48 28 48s28-26 28-48C60 14 48 2 32 2z" fill={C.red} />
    <circle cx="32" cy="30" r="11" fill="#fff" />
  </svg>
);

export const SceneC: React.FC = () => {
  const f = useF();
  const {fps} = useVideoConfig();
  const dim = (at: number) => interpolate(f, [at, at + 12], [1, 0.55], clamp);
  const date = slam(f, beat('C.date'), 10);
  const label = rise(f, beat('C.label'), 30);
  const by = rise(f, beat('C.by'), 30);
  const name = slam(f, beat('C.name'), 9);
  const venue = pop(f, fps, beat('C.venue'));
  const org = rise(f, beat('C.org'), 30);
  const l1 = pop(f, fps, beat('C.logo1'));
  const l2 = pop(f, fps, beat('C.logo2'));
  const cam = 1 + interpolate(f, [360, 780], [0, 0.05], clamp);
  return (
    <AbsoluteFill>
      <Bg scene="C" />
      <AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: '50% 40%'}}>
        <div style={{position: 'absolute', left: 70, top: 215, opacity: label.opacity * dim(beat('C.org')), transform: `translateY(${label.y}px)`}}>
          <div style={{display: 'inline-block', background: C.teal, color: C.navyDeep, fontFamily: 'Inter', fontWeight: 900, fontSize: 44, padding: '12px 30px', borderRadius: 14, letterSpacing: 3}}>MAJLIS PERASMIAN</div>
        </div>
        <div style={{position: 'absolute', left: 70, top: 310, opacity: date.opacity * dim(beat('C.org')), transform: `scale(${date.scale})`, transformOrigin: '0 50%'}}>
          <H size={150} style={{textShadow: '0 8px 0 rgba(0,0,0,.25)', whiteSpace: 'nowrap'}}>4 NOV <span style={{color: C.ball}}>2026</span></H>
        </div>
        <div style={{position: 'absolute', left: 70, top: 540, opacity: by.opacity * dim(beat('C.org')), transform: `translateY(${by.y}px)`}}>
          <P size={48} color={C.teal} weight={700}>Disempurnakan oleh</P>
        </div>
        <div style={{position: 'absolute', left: 70, top: 615, opacity: name.opacity * dim(beat('C.org')), transform: `scale(${name.scale})`, transformOrigin: '0 50%'}}>
          <H size={100}>YH DATUK</H>
          <H size={100} style={{marginTop: 6}}>BANDAR <span style={{color: C.ball}}>KUANTAN</span></H>
        </div>
        <div style={{position: 'absolute', left: 70, top: 900, opacity: venue.opacity * dim(beat('C.org')), transform: `scale(${venue.scale})`, transformOrigin: '0 50%'}}>
          <Card style={{display: 'flex', alignItems: 'center', gap: 24, padding: '22px 40px 22px 30px', borderRadius: 100}}>
            <Pin />
            <div>
              <P size={32} color="#5A6690" weight={700}>LOKASI</P>
              <H size={56} color={C.blue} style={{fontStyle: 'normal', marginTop: 4}}>THE PICKLE EXCHANGE</H>
            </div>
          </Card>
        </div>
        <div style={{position: 'absolute', left: 70, top: 1120, opacity: org.opacity, transform: `translateY(${org.y}px)`}}>
          <P size={42} color={C.teal} weight={800} style={{letterSpacing: 6}}>ANJURAN</P>
        </div>
        <div style={{position: 'absolute', left: 70, right: 70, top: 1190, height: 330, display: 'flex', gap: 30}}>
          <Card style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: l1.opacity, transform: `scale(${l1.scale})`}}>
            <Img src={staticFile('assets/logo-mbk.jpg')} style={{height: 290, mixBlendMode: 'multiply'}} />
          </Card>
          <Card style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: l2.opacity, transform: `scale(${l2.scale})`}}>
            <Img src={staticFile('assets/logo-kesumba.jpg')} style={{height: 290, mixBlendMode: 'multiply'}} />
          </Card>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
