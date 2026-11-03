import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import T from './timing.json';

const FPS = T.fps;
const C = {bg: '#080c1f', text: '#ffffff', accent: '#d6ff3d', red: '#ff3b4e', blue: '#3da8ff'};
const FONT = 'Inter, "Inter Display", sans-serif';
const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
const prog = (f: number, cue: number, dur = 13) => interpolate(f, [cue * FPS, cue * FPS + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

// Satu baris teks dengan mask (naik dari bawah). Saiz dikira supaya muat dalam 920px.
const Line: React.FC<{text: string; cue: number; size: number; color?: string; weight?: number; track?: number; align?: 'center' | 'left'; maxW?: number}> =
  ({text, cue, size, color = C.text, weight = 900, track = -0.02, align = 'center', maxW = 920}) => {
    const f = useCurrentFrame();
    const p = prog(f, cue);
    const fit = Math.min(size, maxW / (text.length * (weight >= 800 ? 0.69 : 0.58) + 0.001));
    return (
      <div style={{overflow: 'hidden', textAlign: align, lineHeight: 1.04, paddingBottom: fit * 0.06}}>
        <div style={{transform: `translateY(${(1 - p) * 112}%) scale(${1 + (1 - p) * 0.06})`, opacity: p > 0 ? 1 : 0, fontFamily: FONT, fontWeight: weight, fontSize: fit,
          letterSpacing: `${track}em`, color, textTransform: 'uppercase', whiteSpace: 'nowrap', textShadow: color === C.accent ? '0 0 40px rgba(214,255,61,.35)' : 'none'}}>{text}</div>
      </div>
    );
  };

// Kad gambar (crop poster) dengan push perlahan + backdrop kabur
const Card: React.FC<{src: string; x: number; y: number; w: number; h: number; zoom?: [number, number]; pos?: string; fit?: 'cover' | 'contain'; bg?: string; dur: number}> =
  ({src, x, y, w, h, zoom = [1.02, 1.12], pos = '50% 50%', fit = 'cover', bg = '#0a0f2a', dur}) => {
    const f = useCurrentFrame();
    const p = prog(f, 0, 16);
    const z = interpolate(f, [0, dur * FPS], zoom);
    return (
      <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 36, overflow: 'hidden', background: bg,
        border: `3px solid ${C.accent}`, boxShadow: '0 0 60px rgba(61,168,255,.35)', transform: `translateY(${(1 - p) * 70}px) scale(${0.94 + 0.06 * p})`, opacity: p}}>
        <Img src={staticFile(`assets/${src}.png`)} style={{width: '100%', height: '100%', objectFit: fit, objectPosition: pos, transform: `scale(${z})`, transformOrigin: pos}} />
      </div>
    );
  };

const Backdrop: React.FC<{src: string; dur: number}> = ({src, dur}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, dur * FPS], [1.25, 1.4]);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Img src={staticFile(`assets/${src}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(36px) brightness(.38) saturate(1.3)', transform: `scale(${z})`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,12,31,.2) 0%, rgba(8,12,31,.55) 55%, rgba(8,12,31,.9) 100%)'}} />
    </AbsoluteFill>
  );
};

const Tag: React.FC<{text: string; cue: number}> = ({text, cue}) => {
  const f = useCurrentFrame(); const p = prog(f, cue);
  return (
    <div style={{display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * 24}px)`}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 40, letterSpacing: '0.18em', color: C.bg, background: C.accent, padding: '10px 28px', borderRadius: 14, textTransform: 'uppercase'}}>{text}</div>
    </div>
  );
};

const Stack: React.FC<{top: number; gap?: number; children: React.ReactNode}> = ({top, gap = 6, children}) => (
  <div style={{position: 'absolute', left: 80, right: 80, top, display: 'flex', flexDirection: 'column', gap}}>{children}</div>
);

type SceneProps = {dur: number; cues: number[]};

const Hook: React.FC<SceneProps> = ({dur, cues}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, dur * FPS], [1.0, 1.18]);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop src="woman" dur={dur} />
      <Card src="woman" x={120} y={110} w={840} h={920} zoom={[1.0, 1.1]} pos="60% 35%" dur={dur} />
      <Stack top={1090}>
        <Line text="Piala" cue={cues[0]} size={120} color={C.accent} />
        <Line text="Datuk Bandar" cue={cues[1]} size={190} />
        <Line text="Kuantan 2026" cue={cues[2]} size={190} />
      </Stack>
    </AbsoluteFill>
  );
};

const Kejoh: React.FC<SceneProps> = ({dur, cues}) => (
  <AbsoluteFill>
    <Backdrop src="ball" dur={dur} />
    <Card src="ball" x={90} y={230} w={900} h={420} zoom={[1.0, 1.15]} pos="55% 45%" dur={dur} />
    <Stack top={760} gap={10}>
      <Tag text="Kejohanan" cue={cues[0]} />
      <div style={{height: 10}} />
      <Line text="Pickleball" cue={cues[1]} size={200} />
      <Line text="Berpasukan" cue={cues[2]} size={200} color={C.accent} />
    </Stack>
  </AbsoluteFill>
);

const Rasmi: React.FC<SceneProps> = ({dur, cues}) => (
  <AbsoluteFill>
    <Backdrop src="ball" dur={dur} />
    <Card src="mbk" x={270} y={170} w={540} h={680} fit="contain" bg="#ffffff" zoom={[1.0, 1.06]} dur={dur} />
    <Stack top={920} gap={10}>
      <Tag text="Dirasmikan oleh" cue={cues[0]} />
      <div style={{height: 10}} />
      <Line text="YBHG. Datuk" cue={cues[1]} size={150} color={C.accent} />
      <Line text="Bandar Kuantan" cue={cues[2]} size={170} />
    </Stack>
  </AbsoluteFill>
);

const Vip: React.FC<SceneProps> = ({dur, cues}) => (
  <AbsoluteFill>
    <Backdrop src="man" dur={dur} />
    <Card src="man" x={190} y={190} w={700} h={780} zoom={[1.0, 1.12]} pos="40% 30%" dur={dur} />
    <Stack top={1050} gap={10}>
      <Tag text="Turut dihadiri" cue={cues[0]} />
      <div style={{height: 10}} />
      <Line text="Tetamu" cue={cues[1]} size={190} />
      <Line text="Jemputan & VIP" cue={cues[2]} size={150} color={C.accent} />
    </Stack>
  </AbsoluteFill>
);

const Pasukan: React.FC<SceneProps> = ({dur, cues}) => (
  <AbsoluteFill>
    <Backdrop src="man" dur={dur} />
    <Card src="man" x={60} y={210} w={470} h={700} zoom={[1.0, 1.12]} pos="40% 30%" dur={dur} />
    <Card src="woman" x={550} y={210} w={470} h={700} zoom={[1.12, 1.0]} pos="60% 30%" dur={dur} />
    <Stack top={1010} gap={10}>
      <Tag text="Pasukan bertanding" cue={cues[0]} />
      <div style={{height: 10}} />
      <Line text="Bakal" cue={cues[1]} size={150} color={C.accent} />
      <Line text="Diperkenalkan" cue={cues[2]} size={170} />
    </Stack>
  </AbsoluteFill>
);

const Info: React.FC<SceneProps & {bg: string; label: string; big: string; sub: string; sub2?: string; pos: string}> = ({dur, cues, bg, label, big, sub, sub2, pos}) => (
  <AbsoluteFill>
    <Backdrop src={bg} dur={dur} />
    <Card src={bg} x={110} y={150} w={860} h={520} zoom={[1.0, 1.1]} pos={pos} dur={dur} />
    <Stack top={760} gap={0}>
      <Tag text={label} cue={cues[0]} />
      <div style={{height: 36}} />
      <Line text={big} cue={cues[1]} size={330} color={C.accent} track={-0.03} />
      <Line text={sub} cue={cues[2]} size={sub2 ? 130 : 160} />
      {sub2 ? <Line text={sub2} cue={cues[2] + 0.2} size={110} weight={600} track={0} /> : null}
    </Stack>
  </AbsoluteFill>
);

const Penutup: React.FC<SceneProps> = ({dur, cues}) => {
  const f = useCurrentFrame();
  const rise = (c: number) => { const p = prog(f, c, 14); return {opacity: p, transform: `translateY(${(1 - p) * 40}px)`}; };
  const lab = (t: string) => <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 32, letterSpacing: '0.2em', color: C.accent, marginBottom: 14}}>{t}</div>;
  const wcard = (src: string, w: number, h: number) => (
    <div style={{width: w, height: h, borderRadius: 20, overflow: 'hidden', background: '#fff', padding: 14, boxSizing: 'border-box'}}>
      <Img src={staticFile(`assets/${src}.png`)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
    </div>);
  const logo = (src: string, w: number, h: number) => (
    <div style={{width: w, height: h, borderRadius: 18, overflow: 'hidden', background: '#0a0f2a', border: '2px solid rgba(255,255,255,.25)'}}>
      <Img src={staticFile(`assets/${src}.png`)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
    </div>);
  return (
    <AbsoluteFill>
      <Backdrop src="ball" dur={dur} />
      <Stack top={170} gap={6}>
        <Line text="Sampai jumpa" cue={cues[0]} size={140} />
        <Line text="di TPX Kuantan" cue={cues[0] + 0.3} size={150} color={C.accent} />
        <Line text="4 Nov 2026 · 8.30 malam" cue={cues[0] + 0.8} size={72} weight={700} track={0} />
      </Stack>
      <div style={{position: 'absolute', left: 80, right: 80, top: 600, ...rise(cues[1])}}>
        {lab('ANJURAN')}
        <div style={{display: 'flex', gap: 24}}>{wcard('mbk', 340, 340)}{wcard('kesumba', 340, 340)}</div>
      </div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 1020, ...rise(cues[1] + 0.5)}}>
        {lab('URUSETIA')}
        <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
          {wcard('biro', 300, 300)}
          <div style={{flex: 1, fontFamily: FONT, color: C.text}}>
            <div style={{fontSize: 38, fontWeight: 800, lineHeight: 1.15, textTransform: 'uppercase'}}>Biro Sukan & Rekreasi KESUMBA</div>
            <div style={{fontSize: 40, fontWeight: 600, marginTop: 14}}><span style={{fontWeight: 900, color: C.accent}}>Anas Rahimi</span></div>
            <div style={{fontSize: 40, fontWeight: 600}}>013-906 9116</div>
          </div>
          <div style={{width: 230, height: 230, borderRadius: 18, overflow: 'hidden', background: '#fff', padding: 10, boxSizing: 'border-box'}}>
            <Img src={staticFile('assets/qr.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 1440, ...rise(cues[2] + 0.3)}}>
        {lab('PENAJA BERSAMA')}
        <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
          {logo('tpx', 200, 110)}{logo('kospek', 340, 110)}{logo('yap', 300, 110)}{logo('alliance', 560, 110)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Wipe aksen merentas sempadan babak (potongan dikawal, bukan fade)
const Wipe: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const b = at * FPS;
  const y = interpolate(f, [b - 5, b, b + 6], [100, 0, -100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  if (f < b - 5 || f > b + 6) return null;
  return <AbsoluteFill style={{background: C.accent, transform: `translateY(${y}%)`}} />;
};

// Penunjuk atas (tajuk kecil) + progres
const Chrome: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t < 3.6 || t > 22) return null;
  return (
    <>
      <div style={{position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 30, letterSpacing: '0.22em', color: 'rgba(255,255,255,.75)'}}>PIALA DATUK BANDAR KUANTAN 2026</div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 1740, height: 6, background: 'rgba(255,255,255,.15)', borderRadius: 3}}>
        <div style={{width: `${(t / T.total) * 100}%`, height: '100%', background: C.accent, borderRadius: 3}} />
      </div>
    </>
  );
};

export const Video: React.FC = () => {
  const S = T.scenes;
  const dur = (i: number) => S[i].end - S[i].start;
  const seq = (i: number, el: React.ReactNode) => (
    <Sequence key={S[i].id} from={Math.round(S[i].start * FPS)} durationInFrames={Math.round(dur(i) * FPS)}><AbsoluteFill style={{transform: `translateY(${i < 8 ? 150 : 0}px)`}}>{el}</AbsoluteFill></Sequence>
  );
  const p = (i: number) => ({dur: dur(i), cues: S[i].cues});
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {seq(0, <Hook {...p(0)} />)}
      {seq(1, <Kejoh {...p(1)} />)}
      {seq(2, <Rasmi {...p(2)} />)}
      {seq(3, <Vip {...p(3)} />)}
      {seq(4, <Pasukan {...p(4)} />)}
      {seq(5, <Info {...p(5)} bg="man" pos="30% 30%" label="Tarikh" big="4 Nov" sub="2026" sub2="Rabu" />)}
      {seq(6, <Info {...p(6)} bg="woman" pos="60% 30%" label="Masa" big="8.30" sub="Malam" />)}
      {seq(7, <Info {...p(7)} bg="ball" pos="55% 45%" label="Lokasi" big="TPX" sub="The Pickle Exchange" sub2="Kuantan" />)}
      {seq(8, <Penutup {...p(8)} />)}
      <Chrome />
      {S.slice(1).map((s) => (
        <Sequence key={`w-${s.id}`} from={Math.round(s.start * FPS) - 6} durationInFrames={14} layout="none">
          <WipeShift at={6 / FPS} />
        </Sequence>
      ))}
      <Audio src={staticFile('soundtrack.wav')} />
    </AbsoluteFill>
  );
};

const WipeShift: React.FC<{at: number}> = ({at}) => <Wipe at={at} />;
