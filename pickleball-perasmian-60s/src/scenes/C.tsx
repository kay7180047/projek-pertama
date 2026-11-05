import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useVideoConfig} from 'remotion';
import {Bg, Card, Clip, Cut, H, P, Photo, Scrim} from '../components';
import {C, beat, clamp, pop, rise, slam, useF} from '../theme';

const Pin = () => (
  <svg width={56} height={70} viewBox="0 0 64 80">
    <path d="M32 2C16 2 4 14 4 30c0 22 28 48 28 48s28-26 28-48C60 14 48 2 32 2z" fill={C.red} />
    <circle cx="32" cy="30" r="11" fill="#fff" />
  </svg>
);

// Susunan tema (liputan hari pertama): suasana -> pegawai & peserta -> sesi bergambar -> penganjur
const cuts = {c1: [360, 450], c2: [450, 599], c3: [599, 693], c4: [693, 735], c5: [735, 780], c6: [780, 780]};
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
  const cutStart = [360, 450, 599, 693, 735].find((_, i, a) => f >= a[i] && (i === a.length - 1 || f < a[i + 1])) ?? 360;
  return (
    <AbsoluteFill>
      <Bg scene="C" />
      <Cut from={360} dur={90}><Clip src="footage/f2.mp4" volume={0.4} zoom={[1.0, 1.08]} dur={90} pos="50% 70%" /></Cut>
      <Cut from={450} dur={149}><Clip src="footage/f1.mp4" volume={1.5} zoom={[1.0, 1.05]} dur={149} pos="30% 50%" /></Cut>
      {inCut(f, 'c3') && <Photo src="photos/p6.jpg" mode="card" local={f - 599} w={940} y={370} ratio={4 / 3} dur={94} />}
      {inCut(f, 'c4') && <Photo src="photos/p2.jpg" mode="card" local={f - 693} w={1000} y={640} ratio={924 / 2000} dur={42} zoomTo={1.1} />}
      {inCut(f, 'c5') && <Photo src="photos/p3.jpg" mode="card" local={f - 735} w={1000} y={640} ratio={924 / 2000} dur={45} zoomTo={1.1} />}
      <Scrim top={inCut(f, 'c1') || inCut(f, 'c2') ? 0.9 : 0.55} bottom={inCut(f, 'c1') ? 0.4 : 0} />

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
      {/* C4-6: sesi bergambar + anjuran */}
      {f >= cuts.c4[0] && (<>
        <div style={{position: 'absolute', left: 70, top: 300, opacity: org.opacity, transform: `translateY(${org.y}px)`}}>
          <H size={90} color="#fff">SESI <span style={{color: C.ball}}>BERGAMBAR</span></H>
          <P size={42} color={C.teal} weight={800} style={{letterSpacing: 6, marginTop: 130}}>ANJURAN</P>
        </div>
        <div style={{position: 'absolute', left: 70, right: 70, top: 1230, height: 330, display: 'flex', gap: 30}}>
          <Card style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: l1.opacity, transform: `scale(${l1.scale})`}}>
            <Img src={staticFile('assets/logo-mbk.jpg')} style={{height: 290, mixBlendMode: 'multiply'}} />
          </Card>
          <Card style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: l2.opacity, transform: `scale(${l2.scale})`}}>
            <Img src={staticFile('assets/logo-kesumba.jpg')} style={{height: 290, mixBlendMode: 'multiply'}} />
          </Card>
        </div>
      </>)}
      <AbsoluteFill style={{background: '#fff', opacity: flash(f, cutStart), pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
