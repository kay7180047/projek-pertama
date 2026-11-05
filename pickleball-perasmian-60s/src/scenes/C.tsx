import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useVideoConfig} from 'remotion';
import {Bg, Card, Clip, Cut, H, P, Photo, Scrim} from '../components';
import {C, beat, clamp, easeOut, pop, rise, slam, useF} from '../theme';

const Pin = () => (
  <svg width={56} height={70} viewBox="0 0 64 80">
    <path d="M32 2C16 2 4 14 4 30c0 22 28 48 28 48s28-26 28-48C60 14 48 2 32 2z" fill={C.red} />
    <circle cx="32" cy="30" r="11" fill="#fff" />
  </svg>
);

// Susunan tema (liputan hari pertama): suasana -> pegawai & peserta -> sesi bergambar -> penganjur
const cuts = {c1: [360, 435], c2: [435, 584], c3: [584, 650], c4: [650, 780]};
const inCut = (f: number, k: keyof typeof cuts) => f >= cuts[k][0] && f < cuts[k][1];
const flash = (f: number, at: number) => interpolate(f, [at, at + 7], [0.45, 0], clamp);

export const SceneC: React.FC = () => {
  const f = useF();
  const {fps} = useVideoConfig();
  const label = rise(f, beat('C.label'), 30);
  const date = slam(f, beat('C.date'), 10);
  const by = rise(f, beat('C.by'), 30);
  const name = slam(f, beat('C.name'), 9);
  const venue = pop(f, fps, beat('C.venue'));
  const org = rise(f, beat('C.org'), 30);
  const l1 = pop(f, fps, beat('C.logo1'));
  const l2 = pop(f, fps, beat('C.logo2'));
  const cutStart = [360, 435, 584, 650].find((_, i, a) => f >= a[i] && (i === a.length - 1 || f < a[i + 1])) ?? 360;
  return (
    <AbsoluteFill>
      <Bg scene="C" />
      <Cut from={360} dur={75}><Clip src="footage/f2.mp4" volume={0.4} zoom={[1.0, 1.08]} dur={75} pos="50% 70%" /></Cut>
      <Cut from={435} dur={149}><Clip src="footage/f1.mp4" volume={1.5} zoom={[1.0, 1.05]} dur={149} pos="30% 50%" /></Cut>
      {inCut(f, 'c3') && <Photo src="photos/p6.jpg" mode="card" local={f - 584} w={940} y={370} ratio={4 / 3} dur={66} />}
      <Cut from={650} dur={130}><Clip src="footage/f7.mp4" volume={0.5} zoom={[1.0, 1.06]} dur={130} pos="50% 50%" /></Cut>
      <Scrim top={inCut(f, 'c1') || inCut(f, 'c2') || inCut(f, 'c4') ? 0.9 : 0.55} bottom={inCut(f, 'c1') ? 0.4 : 0} />

      {/* C1: suasana + tarikh */}
      {inCut(f, 'c1') && (<>
        <div style={{position: 'absolute', left: 70, top: 190, opacity: label.opacity, transform: `translateY(${label.y}px)`}}>
          <div style={{display: 'inline-block', background: C.teal, color: C.navyDeep, fontFamily: 'Inter', fontWeight: 900, fontSize: 44, padding: '12px 30px', borderRadius: 14, letterSpacing: 3}}>MAJLIS PERASMIAN</div>
        </div>
        <div style={{position: 'absolute', left: 70, top: 290, opacity: date.opacity, transform: `scale(${date.scale})`, transformOrigin: '0 50%'}}>
          <H size={150} style={{textShadow: '0 8px 0 rgba(0,0,0,.3)', whiteSpace: 'nowrap'}}>4 NOV <span style={{color: C.ball}}>2026</span></H>
        </div>
      </>)}
      {/* C2: Datuk Bandar */}
      {inCut(f, 'c2') && (<>
        <div style={{position: 'absolute', left: 70, top: 105, opacity: by.opacity, transform: `translateY(${by.y}px)`}}><P size={44} color={C.teal} weight={800} style={{textShadow: '0 3px 10px rgba(0,0,0,.6)'}}>Disempurnakan oleh</P></div>
        <div style={{position: 'absolute', left: 70, top: 170, opacity: name.opacity, transform: `scale(${name.scale})`, transformOrigin: '0 50%'}}>
          <H size={86}>YH DATUK BANDAR</H>
          <H size={86} color={C.ball} style={{marginTop: 4}}>KUANTAN</H>
        </div>
      </>)}
      {/* C3: lokasi */}
      {inCut(f, 'c3') && (
        <div style={{position: 'absolute', left: 70, top: 130, opacity: venue.opacity, transform: `scale(${venue.scale})`, transformOrigin: '0 50%'}}>
          <Card style={{display: 'flex', alignItems: 'center', gap: 24, padding: '20px 40px 20px 30px', borderRadius: 100}}>
            <Pin />
            <div>
              <P size={30} color="#5A6690" weight={700}>LOKASI</P>
              <H size={54} color={C.blue} style={{fontStyle: 'normal', marginTop: 4}}>THE PICKLE EXCHANGE</H>
            </div>
          </Card>
        </div>
      )}
      {/* C4: anjuran di atas barisan peserta */}
      {f >= cuts.c4[0] && (<>
        <div style={{position: 'absolute', left: 70, top: 95, opacity: org.opacity, transform: `translateY(${org.y}px)`}}>
          <P size={40} color={C.teal} weight={800} style={{letterSpacing: 6, textShadow: '0 3px 10px rgba(0,0,0,.6)'}}>ANJURAN</P>
        </div>
        <div style={{position: 'absolute', left: 70, right: 70, top: 150, height: 270, display: 'flex', gap: 22, perspective: 1000}}>
          {[
            {src: 'assets/logo-mbk.jpg', bg: '#FFFFFF', h: 230, at: beat('C.logo1')},
            {src: 'assets/logo-kesumba.jpg', bg: '#F7F7F7', h: 215, at: beat('C.logo2')},
            {src: 'assets/logo-biro.jpg', bg: '#FFFFFF', h: 235, at: beat('C.logo3')},
          ].map((l) => {
            const e = interpolate(f - l.at, [0, 26], [0, 1], {...clamp, easing: easeOut});
            const rot = 720 * (1 - e);
            return (
              <div key={l.src} style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: l.bg, borderRadius: 28, boxShadow: '0 14px 40px rgba(5,10,40,.5)', opacity: interpolate(f - l.at, [0, 4], [0, 1], clamp), transform: `rotateY(${rot}deg) scale(${0.25 + 0.75 * e})`}}>
                <Img src={staticFile(l.src)} style={{height: l.h, maxWidth: 270, objectFit: 'contain'}} />
              </div>
            );
          })}
        </div>
        <div style={{position: 'absolute', left: 70, right: 70, top: 440, opacity: interpolate(f - beat('C.logo3'), [10, 22], [0, 1], clamp)}}>
          <P size={34} color="#fff" weight={800} style={{textAlign: 'right', letterSpacing: 1, textShadow: '0 3px 10px rgba(0,0,0,.7)'}}>Biro Sukan dan Rekreasi KESUMBA</P>
        </div>
      </>)}
      <AbsoluteFill style={{background: '#fff', opacity: flash(f, cutStart), pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
