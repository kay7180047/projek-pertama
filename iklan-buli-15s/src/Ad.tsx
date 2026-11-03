import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import T from './timing.json';

const F = T.f;
const FONT = 'Inter, "Helvetica Neue", Arial, sans-serif';
// Tema sementara (tiada aset branding diberi)
const C = {
  cream: '#FFF5E4', ink: '#1B2A49', coral: '#FF6B57', teal: '#2BB5A0',
  tealPale: '#E3F4F0', yellow: '#FFC857', muted: '#9AA6C0',
};
const outCubic = Easing.out(Easing.cubic);

const useSpring = (f: number, at: number, damping = 13, stiffness = 170) =>
  spring({frame: Math.max(0, f - at), fps: T.fps, config: {damping, stiffness, mass: 0.6}});

const Pop: React.FC<{f: number; at: number; children: React.ReactNode; style?: React.CSSProperties; from?: number}> = ({f, at, children, style, from = 0.8}) => {
  if (f < at) return null;
  const s = useSpring(f, at);
  return (
    <div style={{opacity: Math.min(1, (f - at) / 3), transform: `translateY(${(1 - s) * 36}px) scale(${from + (1 - from) * s})`, transformOrigin: '50% 80%', ...style}}>
      {children}
    </div>
  );
};

// Punch-in: masuk besar lalu "mendarat" + goncangan kecil
const Slam: React.FC<{f: number; at: number; children: React.ReactNode; style?: React.CSSProperties; big?: number}> = ({f, at, children, style, big = 1.5}) => {
  if (f < at) return null;
  const s = useSpring(f, at, 10, 260);
  const k = f - at;
  const shake = k < 9 ? Math.sin(k * 2.4) * (9 - k) * 1.1 : 0;
  return (
    <div style={{opacity: Math.min(1, k / 2), transform: `translate(${shake}px, ${-shake * 0.6}px) scale(${big + (1 - big) * s})`, transformOrigin: '0% 60%', ...style}}>
      {children}
    </div>
  );
};

const Blobs: React.FC<{f: number; colors: string[]}> = ({f, colors}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    {colors.map((c, i) => (
      <div key={i} style={{
        position: 'absolute', width: 520 + i * 90, height: 520 + i * 90, borderRadius: '50%', background: c, opacity: 0.55,
        left: [-180, 1560, 1100][i], top: [640, -200, 800][i],
        transform: `translate(${Math.sin(f / 40 + i) * 26}px, ${Math.cos(f / 50 + i * 2) * 22}px)`,
      }} />
    ))}
  </AbsoluteFill>
);

// ---------- Watak kanak-kanak (bentuk ringkas, potongan kertas) ----------
const Child: React.FC<{f: number; mood: number; scale?: number; tone?: string}> = ({f, mood, scale = 1, tone = C.teal}) => {
  const droop = mood * 14;
  const mouth = `M 158 ${208 + droop * 0.2} Q 200 ${216 - mood * 34} 242 ${208 + droop * 0.2}`;
  return (
    <svg width={400 * scale} height={470 * scale} viewBox="0 0 400 470" style={{overflow: 'visible'}}>
      <g transform={`translate(0 ${droop})`}>
        <path d="M 40 470 Q 40 300 200 300 Q 360 300 360 470 Z" fill={C.ink} />
        <rect x="150" y="262" width="100" height="60" rx="30" fill={tone} />
        <g transform={`rotate(${mood * 7} 200 200)`}>
          <circle cx="200" cy="170" r="105" fill={tone} />
          <path d="M 98 150 Q 110 60 200 62 Q 295 62 304 150 Q 250 112 200 118 Q 150 112 98 150 Z" fill={C.ink} />
          <circle cx="160" cy="176" r="9" fill={C.ink} />
          <circle cx="240" cy="176" r="9" fill={C.ink} />
          <path d={mouth} stroke={C.ink} strokeWidth="9" strokeLinecap="round" fill="none" />
        </g>
      </g>
    </svg>
  );
};

// ---------- Ikon ----------
const IconBag = () => (
  <svg width="190" height="190" viewBox="0 0 200 200"><rect x="40" y="50" width="120" height="130" rx="30" fill={C.coral}/><rect x="62" y="110" width="76" height="50" rx="14" fill={C.cream}/><path d="M 75 52 Q 75 14 100 14 Q 125 14 125 52" stroke={C.ink} strokeWidth="12" fill="none" strokeLinecap="round"/><line x1="140" y1="30" x2="176" y2="6" stroke={C.ink} strokeWidth="10" strokeLinecap="round" strokeDasharray="2 18"/></svg>
);
const IconBandage = () => (
  <svg width="190" height="190" viewBox="0 0 200 200"><g transform="rotate(-35 100 100)"><rect x="10" y="62" width="180" height="76" rx="38" fill={C.yellow}/><rect x="68" y="62" width="64" height="76" fill={C.cream}/>{[84,100,116].map(y=>[84,116].map(x=><circle key={x+'-'+y} cx={x} cy={y} r="4.5" fill={C.ink} opacity=".5"/>))}</g></svg>
);
const IconSchool = () => (
  <svg width="190" height="190" viewBox="0 0 200 200"><path d="M 20 80 L 100 22 L 180 80 Z" fill={C.ink}/><rect x="36" y="80" width="128" height="100" fill={C.teal}/><rect x="82" y="116" width="36" height="64" rx="8" fill={C.cream}/><circle cx="100" cy="62" r="9" fill={C.cream}/><path d="M 16 186 L 184 186" stroke={C.ink} strokeWidth="8" strokeLinecap="round"/></svg>
);

// ---------- Babak ----------
const Hook: React.FC<{f: number}> = ({f}) => {
  const hit = f >= F.senyap;
  const mood = hit ? interpolate(f, [F.senyap, F.senyap + 14], [0, 1], {extrapolateRight: 'clamp', easing: outCubic}) : 0;
  const tone = hit ? C.muted : C.teal;
  const figX = interpolate(f, [0, 14], [260, 0], {extrapolateRight: 'clamp', easing: outCubic});
  return (
    <AbsoluteFill style={{background: C.cream}}>
      <Blobs f={f} colors={[C.tealPale, C.yellow, C.coral]} />
      <div style={{position: 'absolute', left: 150, top: 230, fontFamily: FONT, color: C.ink}}>
        <div style={{display: 'flex', gap: 28, fontSize: 118, fontWeight: 800, letterSpacing: -2}}>
          <Pop f={f} at={F.anak}>Anak</Pop><Pop f={f} at={F.balik}>balik</Pop><Pop f={f} at={F.sekolah}>sekolah</Pop>
        </div>
        <div style={{display: 'flex', gap: 36, fontSize: 190, fontWeight: 900, letterSpacing: -5, marginTop: 10, alignItems: 'baseline'}}>
          <Pop f={f} at={F.jadi}>jadi</Pop>
          <Slam f={f} at={F.senyap} style={{color: C.coral}}>senyap.</Slam>
        </div>
      </div>
      <div style={{position: 'absolute', right: 150 - figX, top: 500}}>
        <Child f={f} mood={mood} tone={tone} scale={1.1} />
      </div>
    </AbsoluteFill>
  );
};

const Soalan: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{background: C.ink, fontFamily: FONT}}>
    <Blobs f={f} colors={['#24365C', '#24365C', '#2C1F3A']} />
    <div style={{position: 'absolute', left: 170, top: 130, color: C.cream}}>
      <Pop f={f} at={F.penat} style={{fontSize: 108, fontWeight: 800, letterSpacing: -2}}>Penat sekolah…</Pop>
      <Pop f={f} at={F.atau} style={{fontSize: 84, fontWeight: 500, color: C.muted, marginTop: 6}}>atau</Pop>
      <Slam f={f} at={F.dibuli} big={1.6} style={{fontSize: 330, fontWeight: 900, letterSpacing: -10, color: C.coral, marginTop: -10, lineHeight: 1.05}}>dibuli?</Slam>
    </div>
  </AbsoluteFill>
);

const Tanda: React.FC<{f: number}> = ({f}) => {
  const cards = [
    {at: F.card1, label: 'Barang kerap hilang', icon: <IconBag />, bg: '#FFFFFF'},
    {at: F.card2, label: 'Luka tanpa sebab', icon: <IconBandage />, bg: '#FFFFFF'},
    {at: F.card3, label: 'Enggan ke sekolah', icon: <IconSchool />, bg: '#FFFFFF'},
  ];
  return (
    <AbsoluteFill style={{background: C.cream, fontFamily: FONT, color: C.ink}}>
      <Blobs f={f} colors={[C.tealPale, C.yellow, C.coral]} />
      <Pop f={f} at={F.tandaHead} style={{position: 'absolute', top: 110, width: '100%', textAlign: 'center', fontSize: 74, fontWeight: 800, letterSpacing: -1}}>
        Tanda yang sering <span style={{color: C.coral}}>terlepas pandang</span>
      </Pop>
      <div style={{position: 'absolute', top: 330, left: 160, display: 'flex', gap: 50}}>
        {cards.map((c, i) => (
          <Pop key={i} f={f} at={c.at} from={0.7} style={{width: 500, height: 520, borderRadius: 44, background: c.bg, boxShadow: '0 24px 0 rgba(27,42,73,0.10)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, border: `6px solid ${C.ink}`}}>
            {c.icon}
            <div style={{fontSize: 54, fontWeight: 800, textAlign: 'center', padding: '0 30px', lineHeight: 1.1}}>{c.label}</div>
          </Pop>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Contoh: React.FC<{f: number}> = ({f}) => {
  const text = 'Hari ini, ada apa-apa yang buat kamu tak selesa?';
  const n = Math.round(interpolate(f, [F.typeStart, F.typeEnd], [0, text.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const dots = f >= F.dots && f < F.bubbleC;
  return (
    <AbsoluteFill style={{background: C.tealPale, fontFamily: FONT, color: C.ink}}>
      <Blobs f={f} colors={['#CDEBE5', C.yellow, '#CDEBE5']} />
      <Pop f={f} at={F.cobaHead} style={{position: 'absolute', left: 160, top: 90, fontSize: 60, fontWeight: 800}}>
        Cuba tanya dengan <span style={{color: C.teal}}>tenang</span>:
      </Pop>
      <Pop f={f} at={F.bubbleP} style={{position: 'absolute', left: 160, top: 250, width: 1020, padding: '44px 56px', background: C.ink, color: C.cream, borderRadius: '44px 44px 44px 8px', fontSize: 62, fontWeight: 700, lineHeight: 1.2}}>
        <div style={{minHeight: 150}}>{text.slice(0, n)}</div>
      </Pop>
      {dots && (
        <Pop f={f} at={F.dots} style={{position: 'absolute', left: 1100, top: 700, padding: '30px 50px', background: '#fff', border: `6px solid ${C.coral}`, borderRadius: '44px 44px 8px 44px', display: 'flex', gap: 16}}>
          {[0, 1, 2].map((i) => <div key={i} style={{width: 24, height: 24, borderRadius: 12, background: C.coral, opacity: 0.35 + 0.65 * Math.abs(Math.sin((f - F.dots) / 5 - i * 0.9))}} />)}
        </Pop>
      )}
      {f >= F.bubbleC && (
        <Pop f={f} at={F.bubbleC} style={{position: 'absolute', left: 900, top: 690, padding: '34px 56px', background: C.coral, color: '#fff', borderRadius: '44px 44px 8px 44px', fontSize: 78, fontWeight: 800}}>
          Mak… sebenarnya…
        </Pop>
      )}
    </AbsoluteFill>
  );
};

const Tutup: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{background: C.cream, fontFamily: FONT, color: C.ink, alignItems: 'center', justifyContent: 'center'}}>
    <Blobs f={f} colors={[C.tealPale, C.yellow, C.coral]} />
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, marginTop: -30}}>
      <Slam f={f} at={F.dengar} big={1.35} style={{fontSize: 230, fontWeight: 900, letterSpacing: -7}}>Dengar <span style={{color: C.teal}}>dulu.</span></Slam>
      <Pop f={f} at={F.jangan} style={{fontSize: 104, fontWeight: 800, letterSpacing: -2}}>Jangan terus <span style={{color: C.coral}}>marah.</span></Pop>
      <Pop f={f} at={F.cta} from={0.6} style={{marginTop: 30, background: C.coral, color: '#fff', fontSize: 70, fontWeight: 800, padding: '26px 70px', borderRadius: 100, boxShadow: '0 14px 0 rgba(27,42,73,0.18)'}}>
        Borak dengan anak malam ni.
      </Pop>
    </div>
    <Pop f={f} at={F.cta + 10} style={{position: 'absolute', bottom: 60, fontSize: 34, fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase', color: C.ink, opacity: 0.6}}>
      Kesedaran buli di sekolah
    </Pop>
  </AbsoluteFill>
);

// Panel wipe terkawal pada sempadan babak (babak bertukar ketika panel menutup penuh)
const Wipe: React.FC<{f: number}> = ({f}) => {
  for (const b of T.boundaries) {
    if (f > b - 9 && f < b + 9) {
      const x = f <= b
        ? interpolate(f, [b - 8, b], [-1920, 0], {easing: outCubic})
        : interpolate(f, [b, b + 8], [0, 1920], {easing: Easing.in(Easing.cubic)});
      return <AbsoluteFill style={{transform: `translateX(${x}px)`, background: C.coral}}><div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, background: C.ink}} /></AbsoluteFill>;
    }
  }
  return null;
};

export const Ad: React.FC = () => {
  const f = useCurrentFrame();
  const [b1, b2, b3, b4] = T.boundaries;
  return (
    <AbsoluteFill>
      {f < b1 && <Hook f={f} />}
      {f >= b1 && f < b2 && <Soalan f={f} />}
      {f >= b2 && f < b3 && <Tanda f={f} />}
      {f >= b3 && f < b4 && <Contoh f={f} />}
      {f >= b4 && <Tutup f={f} />}
      <Wipe f={f} />
      <Audio src={staticFile('soundtrack.wav')} />
    </AbsoluteFill>
  );
};
