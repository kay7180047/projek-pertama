import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import T from './timing.json';
import TEAMS from './teams.json';
import SPONSORS from './sponsors.json';
import CUTS from './cuts.json';

const FPS = T.fps;
const C = {bg: '#080c1f', text: '#ffffff', accent: '#d6ff3d', red: '#ff3b4e', blue: '#3da8ff'};
const FONT = 'Inter, "Inter Display", sans-serif';
const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const prog = (f: number, cue: number, dur = 13) => interpolate(f, [cue * FPS, cue * FPS + dur], [0, 1], {...clamp, easing: ease});
const bounce = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
};
const TTCtx = React.createContext(false);
const useTT = () => React.useContext(TTCtx);
const cuts = CUTS as Record<string, {w: number; h: number}>;

/* ---------- Latar bergerak (dijana kod) ---------- */
type BgV = 'burst' | 'bands' | 'halftone' | 'court';
const Bg: React.FC<{v: BgV; c?: string}> = ({v, c = C.accent}) => {
  const f = useCurrentFrame();
  if (v === 'burst') {
    return (
      <AbsoluteFill style={{background: C.bg}}>
        <AbsoluteFill style={{background: `repeating-conic-gradient(from ${f * 0.5}deg at 50% 44%, ${c}30 0deg 7deg, transparent 7deg 18deg)`}} />
        <AbsoluteFill style={{background: `radial-gradient(circle at 50% 44%, rgba(8,12,31,0) 8%, ${C.bg} 88%)`}} />
      </AbsoluteFill>
    );
  }
  if (v === 'bands') {
    const o = Math.sin(f / 40) * 40;
    return (
      <AbsoluteFill style={{background: 'linear-gradient(160deg,#0d1640,#080c1f)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: -300 + o, top: 380, width: 1800, height: 260, background: `${c}33`, transform: 'rotate(-14deg)'}} />
        <div style={{position: 'absolute', left: -300 - o, top: 760, width: 1800, height: 110, background: `${c}22`, transform: 'rotate(-14deg)'}} />
        <div style={{position: 'absolute', left: -300 + o, top: 1180, width: 1800, height: 330, background: `${C.blue}22`, transform: 'rotate(-14deg)'}} />
      </AbsoluteFill>
    );
  }
  if (v === 'halftone') {
    return (
      <AbsoluteFill style={{background: 'linear-gradient(170deg,#12205a,#080c1f 75%)'}}>
        <AbsoluteFill style={{backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.15) 3px, transparent 4px)', backgroundSize: '40px 40px', backgroundPosition: `${f * 0.9}px ${f * 0.5}px`}} />
        <AbsoluteFill style={{background: `radial-gradient(circle at 50% 100%, ${c}33 0%, transparent 60%)`}} />
      </AbsoluteFill>
    );
  }
  // court
  const lines: React.ReactNode[] = [];
  for (let i = 0; i < 9; i++) {
    const y = 1000 + Math.pow((i + (f * 0.03) % 1) / 9, 2) * 920;
    lines.push(<line key={`h${i}`} x1="0" x2="1080" y1={y} y2={y} stroke={c} strokeOpacity={0.28} strokeWidth="3" />);
  }
  for (let i = -4; i <= 4; i++) lines.push(<line key={`v${i}`} x1={540 + i * 40} y1="1000" x2={540 + i * 330} y2="1920" stroke={c} strokeOpacity={0.22} strokeWidth="3" />);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#080c1f 0%,#0f1a45 60%,#0a1130 100%)'}}>
      <svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>{lines}</svg>
    </AbsoluteFill>
  );
};

/* ---------- Teks ---------- */
const Line: React.FC<{text: string; cue: number; size: number; color?: string; weight?: number; track?: number; align?: 'center' | 'left'; maxW?: number; dur?: number; from?: 'up' | 'left' | 'right'}> =
  ({text, cue, size, color = C.text, weight = 900, track = -0.02, align = 'center', maxW = 920, dur = 13, from = 'up'}) => {
    const f = useCurrentFrame();
    const p = prog(f, cue, dur);
    const fit = Math.min(size, maxW / (text.length * (weight >= 800 ? 0.69 : 0.66) + 0.001));
    const tr = from === 'up' ? `translateY(${(1 - p) * 112}%)` : from === 'left' ? `translateX(${-(1 - p) * 110}%)` : `translateX(${(1 - p) * 110}%)`;
    return (
      <div style={{overflow: 'hidden', textAlign: align, lineHeight: 1.04, paddingBottom: fit * 0.06}}>
        <div style={{transform: `${tr} scale(${1 + (1 - p) * 0.05})`, opacity: p > 0 ? 1 : 0, fontFamily: FONT, fontWeight: weight, fontSize: fit,
          letterSpacing: `${track}em`, color, textTransform: 'uppercase', whiteSpace: 'nowrap', textShadow: '0 6px 28px rgba(0,0,0,.55)'}}>{text}</div>
      </div>
    );
  };

const Tag: React.FC<{text: string; cue: number; rot?: number; align?: 'center' | 'left'; color?: string}> = ({text, cue, rot = 0, align = 'center', color = C.accent}) => {
  const f = useCurrentFrame(); const p = bounce((f - cue * FPS) / 12);
  return (
    <div style={{display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start', opacity: f >= cue * FPS ? 1 : 0}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 40, letterSpacing: '0.18em', color: C.bg, background: color, padding: '10px 28px', borderRadius: 14, textTransform: 'uppercase',
        transform: `rotate(${rot}deg) scale(${0.6 + 0.4 * Math.max(0, p)})`, boxShadow: '0 10px 30px rgba(0,0,0,.4)'}}>{text}</div>
    </div>
  );
};

// Jalur teks senget yang menyelinap masuk
const Band: React.FC<{text: string; top: number; cue: number; rot?: number; color?: string; textColor?: string; size?: number; maxW?: number; from?: 1 | -1}> =
  ({text, top, cue, rot = -4, color = C.accent, textColor = C.bg, size = 120, maxW = 940, from = 1}) => {
    const f = useCurrentFrame(); const p = Math.max(0, bounce((f - cue * FPS) / 14));
    const fit = Math.min(size, maxW / (text.length * 0.69));
    return (
      <div style={{position: 'absolute', left: -40, right: -40, top, display: 'flex', justifyContent: 'center', transform: `rotate(${rot}deg) translateX(${(1 - p) * 1300 * from}px)`, opacity: f >= cue * FPS ? 1 : 0}}>
        <div style={{background: color, padding: '10px 54px', fontFamily: FONT, fontWeight: 900, fontSize: fit, color: textColor, textTransform: 'uppercase', letterSpacing: '-0.02em', whiteSpace: 'nowrap', boxShadow: '0 14px 40px rgba(0,0,0,.45)'}}>{text}</div>
      </div>
    );
  };

// Teks gergasi (garis luar) bergerak di belakang pemain
const Ghost: React.FC<{text: string; size: number; top: number; speed?: number; color?: string; opacity?: number; x0?: number}> = ({text, size, top, speed = 1.6, color = '#ffffff', opacity = 0.35, x0 = 0}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 0, top, whiteSpace: 'nowrap', fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1, textTransform: 'uppercase', color: 'transparent',
      WebkitTextStroke: `4px ${color}`, opacity, transform: `translateX(${x0 - f * speed}px)`}}>
      {`${text} · ${text} · ${text}`}
    </div>
  );
};

const Stack: React.FC<{top: number; gap?: number; left?: number; right?: number; rot?: number; children: React.ReactNode}> = ({top, gap = 6, left = 80, right = 80, rot = 0, children}) => (
  <div style={{position: 'absolute', left, right, top, display: 'flex', flexDirection: 'column', gap, transform: `rotate(${rot}deg)`}}>{children}</div>
);

/* ---------- Pemain (cutout) ---------- */
type Enter = 'up' | 'left' | 'right' | 'spin' | 'drop';
const Cut: React.FC<{k: string; dw: number; left: number; bottom: number; enter?: Enter; delay?: number; rot?: number; dur: number}> = ({k, dw, left, bottom, enter = 'up', delay = 0, rot = 0, dur}) => {
  const f = useCurrentFrame();
  const d = cuts[k]; const dh = (dw * d.h) / d.w;
  const q = bounce((f - delay * FPS) / 16);
  let tr = '';
  if (enter === 'up') tr = `translateY(${(1 - q) * dh * 0.95}px)`;
  if (enter === 'drop') tr = `translateY(${-(1 - q) * 1800}px)`;
  if (enter === 'left') tr = `translateX(${-(1 - q) * (dw + 300)}px)`;
  if (enter === 'right') tr = `translateX(${(1 - q) * (dw + 300)}px)`;
  if (enter === 'spin') tr = `scale(${0.3 + 0.7 * q}) rotate(${(1 - q) * -18}deg)`;
  const s = 1 + 0.05 * (f / (dur * FPS));
  const bob = Math.sin(f / 14) * 5;
  return (
    <Img src={staticFile(`assets/${k}.png`)} style={{position: 'absolute', left, bottom, width: dw, height: dh, opacity: f >= delay * FPS ? 1 : 0,
      transform: `${tr} translateY(${bob}px) rotate(${rot}deg) scale(${s})`, transformOrigin: '50% 100%', filter: 'drop-shadow(0 22px 34px rgba(0,0,0,.55))'}} />
  );
};

const Flash: React.FC<{color?: string}> = ({color = '#fff'}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{background: color, opacity: interpolate(f, [0, 7], [0.55, 0], clamp), pointerEvents: 'none'}} />;
};

// Bola pickleball vektor melantun merentas skrin
const Ball: React.FC<{x0: number; x1: number; y: number; arc: number; t0: number; t1: number; size?: number}> = ({x0, x1, y, arc, t0, t1, size = 110}) => {
  const f = useCurrentFrame(); const t = interpolate(f, [t0 * FPS, t1 * FPS], [0, 1], clamp);
  if (f < t0 * FPS) return null;
  const x = x0 + (x1 - x0) * t; const yy = y - Math.abs(Math.sin(t * Math.PI * 2)) * arc;
  const holes = [[0, -22], [20, -10], [20, 12], [0, 24], [-20, 12], [-20, -10], [0, 0]];
  return (
    <svg width={size} height={size} viewBox="-60 -60 120 120" style={{position: 'absolute', left: x, top: yy, transform: `rotate(${t * 540}deg)`}}>
      <defs><radialGradient id="bg1" cx="35%" cy="30%" r="75%"><stop offset="0%" stopColor="#f4ff8a" /><stop offset="100%" stopColor="#b9e600" /></radialGradient></defs>
      <circle r="52" fill="url(#bg1)" stroke="#0b0f1f" strokeWidth="3" />
      {holes.map(([a, b], i) => <circle key={i} cx={a} cy={b} r="6" fill="#0b0f1f" opacity=".75" />)}
    </svg>
  );
};

const Rings: React.FC<{x: number; y: number; color?: string}> = ({x, y, color = C.accent}) => {
  const f = useCurrentFrame();
  return (
    <>
      {[0, 10, 20].map((o) => {
        const t = interpolate(f - o, [0, 40], [0, 1], clamp);
        return <div key={o} style={{position: 'absolute', left: x - 500, top: y - 500, width: 1000, height: 1000, borderRadius: '50%', border: `5px solid ${color}`, opacity: (1 - t) * 0.7 * (f >= o ? 1 : 0), transform: `scale(${0.2 + t * 1.1})`}} />;
      })}
    </>
  );
};

type SceneProps = {dur: number; cues: number[]};

/* ---------- Babak ---------- */
const Hook: React.FC<SceneProps> = ({dur, cues}) => {
  const tt = useTT();
  return (
  <AbsoluteFill>
    <Bg v="burst" c={C.accent} />
    <Stack top={140} gap={0} left={70} right={40}>
      <Line text="Piala" cue={cues[0]} size={120} color={C.accent} align="left" from="left" />
      <Line text="Datuk" cue={cues[1]} size={280} align="left" from="left" maxW={900} />
      <Line text="Bandar" cue={cues[2]} size={240} align="left" from="left" maxW={900} />
    </Stack>
    <Cut k="cut1" dw={800} left={300} bottom={-250} enter="up" delay={0.05} dur={dur} />
    <Band text="Kuantan 2026" top={tt ? 1330 : 1460} cue={cues[2] + 0.35} rot={-5} size={150} />
    <Flash />
  </AbsoluteFill>
  );
};

const Kejoh: React.FC<SceneProps> = ({dur, cues}) => (
  <AbsoluteFill>
    <Bg v="bands" c={C.blue} />
    <Ghost text="Pickle" size={430} top={640} speed={2.2} color={C.blue} opacity={0.5} />
    <Cut k="cut7" dw={900} left={260} bottom={-30} enter="right" delay={0.1} rot={2} dur={dur} />
    <Ball x0={-120} x1={1150} y={330} arc={260} t0={0.2} t1={2.6} />
    <Stack top={200} gap={8} left={70} right={70}>
      <Tag text="Kejohanan" cue={cues[0]} rot={-3} align="left" />
      <div style={{height: 16}} />
      <Line text="Pickleball" cue={cues[1]} size={190} align="left" from="left" maxW={940} />
      <Line text="Berpasukan" cue={cues[2]} size={190} align="left" from="left" maxW={940} color={C.accent} />
    </Stack>
    <Flash />
  </AbsoluteFill>
);

const Rasmi: React.FC<SceneProps> = ({dur, cues}) => {
  const f = useCurrentFrame();
  const q = Math.max(0, bounce(f / 18));
  return (
    <AbsoluteFill>
      <Bg v="halftone" c={C.blue} />
      <Rings x={540} y={670} color={C.accent} />
      <div style={{position: 'absolute', left: 250, top: 300, width: 580, height: 740, borderRadius: 44, background: '#fff', padding: 26, boxSizing: 'border-box',
        transform: `scale(${0.3 + 0.7 * q}) rotate(${(1 - q) * 25 - 3}deg)`, boxShadow: '0 30px 80px rgba(0,0,0,.55)', border: `6px solid ${C.accent}`}}>
        <Img src={staticFile('assets/mbk.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      </div>
      <Stack top={1170} gap={8} rot={-2}>
        <Tag text="Dirasmikan oleh" cue={cues[0]} rot={2} />
        <div style={{height: 12}} />
        <Line text="YBHG. Datuk" cue={cues[1]} size={160} color={C.accent} from="right" />
        <Line text="Bandar Kuantan" cue={cues[2]} size={170} from="left" />
      </Stack>
      <Flash />
    </AbsoluteFill>
  );
};

const Vip: React.FC<SceneProps> = ({dur, cues}) => (
  <AbsoluteFill>
    <Bg v="court" c={C.accent} />
    <Stack top={260} gap={0} left={70} right={70}>
      <Tag text="Turut dihadiri" cue={cues[0]} rot={-2} align="left" />
      <div style={{height: 18}} />
      <Line text="Tetamu" cue={cues[1]} size={230} align="left" from="right" />
      <Line text="Jemputan" cue={cues[1] + 0.12} size={190} align="left" from="left" maxW={940} />
      <Line text="& VIP" cue={cues[2]} size={330} color={C.accent} align="left" from="up" />
    </Stack>
    <div style={{position: 'absolute', left: 90, right: 90, top: 1640, height: 60, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,.55), transparent 70%)'}} />
    <Cut k="cut6" dw={1180} left={-50} bottom={130} enter="up" delay={0.15} dur={dur} />
    <Flash />
  </AbsoluteFill>
);

const Pasukan: React.FC<SceneProps> = ({dur, cues}) => (
  <AbsoluteFill>
    <Bg v="burst" c={C.red} />
    <Stack top={130} gap={0} left={70} right={70}>
      <Tag text="Selamat bertanding" cue={cues[0]} rot={2} align="left" />
      <Line text="10" cue={cues[1]} size={440} color={C.accent} align="left" from="left" track={-0.04} />
      <Line text="Pasukan" cue={cues[1] + 0.12} size={190} align="left" from="right" maxW={940} />
      <Line text="Agensi & GLC" cue={cues[2]} size={110} align="left" from="left" />
    </Stack>
    <Cut k="cut5" dw={640} left={-40} bottom={-30} enter="left" delay={0.1} rot={-2} dur={dur} />
    <Cut k="cut2" dw={760} left={360} bottom={-30} enter="right" delay={0.25} rot={2} dur={dur} />
    <Flash />
  </AbsoluteFill>
);

const BG_ORDER: BgV[] = ['burst', 'halftone', 'bands', 'court'];
const ENTERS = ['left', 'right', 'up', 'spin', 'down', 'left', 'right', 'spin', 'up', 'down'] as const;

const Team: React.FC<SceneProps & {n: number}> = ({dur, cues, n}) => {
  const f = useCurrentFrame();
  const tt = useTT();
  const tm = TEAMS[n];
  const q = bounce(f / 14);
  const dir = ENTERS[n];
  const ring = interpolate(f, [0, 18], [0.6, 1.7], {...clamp, easing: ease});
  const ringO = interpolate(f, [0, 18], [0.9, 0], clamp);
  const flash = interpolate(f, [0, 9], [1, 0], clamp);
  let tr = '';
  if (dir === 'left') tr = `translateX(${-(1 - q) * 1100}px) rotate(${(1 - q) * -20}deg)`;
  if (dir === 'right') tr = `translateX(${(1 - q) * 1100}px) rotate(${(1 - q) * 20}deg)`;
  if (dir === 'up') tr = `translateY(${(1 - q) * 1200}px)`;
  if (dir === 'down') tr = `translateY(${-(1 - q) * 1200}px)`;
  if (dir === 'spin') tr = `scale(${0.2 + 0.8 * q}) rotate(${(1 - q) * -240}deg)`;
  const tilt = n % 2 === 0 ? -3 : 3;
  const align = n % 2 === 0 ? 'left' : 'center';
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Bg v={BG_ORDER[n % 4]} c={tm.accent} />
      <Ghost text={tm.l1} size={380} top={n % 2 ? 1150 : 120} speed={n % 2 ? -3 : 3} color={tm.accent} opacity={0.45} x0={n % 2 ? -900 : 0} />
      <div style={{position: 'absolute', left: 140, top: 260, width: 800, height: 800, borderRadius: '50%', border: `6px solid ${tm.accent}`, opacity: ringO, transform: `scale(${ring})`}} />
      <div style={{position: 'absolute', left: 140, top: 260, width: 800, height: 800, borderRadius: 44, overflow: 'hidden', background: tm.bg,
        border: `5px solid ${tm.accent}`, boxShadow: `0 0 100px ${tm.accent}88`, transform: `${tr} rotate(${tilt}deg)`, opacity: Math.min(1, f / 3)}}>
        <Img src={staticFile(`assets/teams/${tm.key}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${1 + 0.06 * (f / (dur * FPS))})`}} />
        <AbsoluteFill style={{background: '#fff', opacity: flash * 0.55}} />
      </div>
      <Stack top={tt ? 1090 : 1180} gap={4} rot={tilt * 0.6}>
        <Line text={tm.l1} cue={cues[1]} size={220} dur={9} align={align} from={n % 2 ? 'right' : 'left'} />
        <Line text={tm.l2} cue={cues[2]} size={140} color={tm.accent} dur={9} align={align} from={n % 2 ? 'left' : 'right'} />
      </Stack>
    </AbsoluteFill>
  );
};

const Grid: React.FC<SceneProps> = ({dur, cues}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Bg v="halftone" c={C.blue} />
      <Stack top={150} gap={0}>
        <Line text="10 Pasukan" cue={cues[0]} size={170} color={C.accent} from="left" />
        <Line text="Bertanding" cue={cues[0] + 0.15} size={150} from="right" />
      </Stack>
      <div style={{position: 'absolute', left: 60, right: 60, top: 520, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22}}>
        {TEAMS.map((tm, i) => {
          const p = bounce((f - (cues[1] * FPS + i * 2)) / 12);
          const side = i % 2 === 0 ? -1 : 1;
          return (
            <div key={tm.key} style={{display: 'flex', alignItems: 'center', gap: 18, padding: 14, borderRadius: 24, background: 'rgba(8,12,31,.7)', border: `2px solid ${tm.accent}`,
              opacity: Math.min(1, Math.max(0, p)), transform: `translateX(${(1 - Math.max(0, p)) * 260 * side}px) rotate(${(i % 3 - 1) * 1.5}deg) scale(${0.7 + 0.3 * Math.max(0, p)})`}}>
              <div style={{width: 170, height: 170, borderRadius: 18, overflow: 'hidden', background: tm.bg, flexShrink: 0}}>
                <Img src={staticFile(`assets/teams/${tm.key}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
              </div>
              <div style={{fontFamily: FONT, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.05, color: C.text}}>
                <div style={{fontSize: 40}}>{tm.l1}</div>
                <div style={{fontSize: 30, color: tm.accent}}>{tm.l2}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Tarikh: React.FC<SceneProps> = ({dur, cues}) => (
  <AbsoluteFill>
    <Bg v="bands" c={C.accent} />
    <Stack top={170} gap={0} left={70} right={40}>
      <Tag text="Tarikh" cue={cues[0]} rot={-3} align="left" />
      <Line text="4 Nov" cue={cues[1]} size={330} color={C.accent} align="left" from="left" track={-0.04} maxW={960} />
    </Stack>
    <Cut k="cut4" dw={720} left={380} bottom={-30} enter="right" delay={0.1} rot={2} dur={dur} />
    <Stack top={850} gap={0} left={70} right={500}>
      <Line text="2026" cue={cues[2]} size={230} align="left" from="left" maxW={480} />
      <Line text="Rabu" cue={cues[2] + 0.15} size={150} align="left" color={C.accent} from="left" maxW={480} />
    </Stack>
    <Flash />
  </AbsoluteFill>
);

const Masa: React.FC<SceneProps> = ({dur, cues}) => {
  const tt = useTT();
  return (
  <AbsoluteFill>
    <Bg v="burst" c={C.blue} />
    <Stack top={170} gap={0}>
      <Tag text="Masa" cue={cues[0]} rot={3} />
      <Line text="8.30" cue={cues[1]} size={400} color={C.accent} track={-0.04} from="up" />
    </Stack>
    <Cut k="cut3" dw={700} left={190} bottom={-30} enter="up" delay={0.1} dur={dur} />
    <Band text="Malam" top={tt ? 1320 : 1470} cue={cues[2]} rot={4} size={200} from={-1} />
    <Flash />
  </AbsoluteFill>
  );
};

const Lokasi: React.FC<SceneProps> = ({dur, cues}) => {
  const tt = useTT();
  return (
  <AbsoluteFill>
    <Bg v="court" c={C.red} />
    <Stack top={170} gap={0}>
      <Tag text="Lokasi" cue={cues[0]} rot={-3} />
      <Line text="TPX" cue={cues[1]} size={440} color={C.accent} track={-0.03} from="left" />
    </Stack>
    <Cut k="cut5" dw={860} left={110} bottom={-30} enter="drop" delay={0.1} dur={dur} />
    <Band text="The Pickle Exchange" top={tt ? 1210 : 1380} cue={cues[2]} rot={-4} size={100} />
    <Band text="Kuantan" top={tt ? 1370 : 1560} cue={cues[2] + 0.2} rot={3} size={130} color={C.text} from={-1} />
    <Flash />
  </AbsoluteFill>
  );
};

const Thanks: React.FC<SceneProps> = ({dur, cues}) => (
  <AbsoluteFill>
    <Bg v="halftone" c={C.accent} />
    <Rings x={540} y={620} color={C.accent} />
    <Stack top={150} gap={4}>
      <Tag text="Penghargaan" cue={cues[0]} rot={-2} />
      <div style={{height: 18}} />
      <Line text="Setinggi-tinggi" cue={cues[1]} size={110} weight={700} track={0} from="left" />
      <Line text="Terima" cue={cues[1] + 0.12} size={340} color={C.accent} track={-0.03} from="right" />
      <Line text="Kasih" cue={cues[1] + 0.24} size={340} color={C.accent} track={-0.03} from="left" />
      <Line text="kepada penaja-penaja kejohanan" cue={cues[2]} size={64} weight={600} track={0} />
    </Stack>
    <Cut k="cut6" dw={1300} left={-110} bottom={130} enter="up" delay={0.3} dur={dur} />
  </AbsoluteFill>
);

const SP_ENTER = ['left', 'up', 'right', 'spin'] as const;
const SP_BG: BgV[] = ['burst', 'bands', 'halftone', 'court'];
const Sponsor: React.FC<SceneProps & {n: number}> = ({dur, cues, n}) => {
  const f = useCurrentFrame();
  const tt = useTT();
  const sp = SPONSORS[n];
  const q = bounce(f / 14);
  const flash = interpolate(f, [0, 10], [1, 0], clamp);
  const light = sp.bg === '#ffffff';
  const wide = sp.w / sp.h > 1.5;
  const cw = 900, ch = wide ? 420 : 640;
  const top = wide ? 480 : 380;
  const e = SP_ENTER[n];
  let tr = '';
  if (e === 'left') tr = `translateX(${-(1 - q) * 1100}px) rotate(${(1 - q) * -15}deg)`;
  if (e === 'right') tr = `translateX(${(1 - q) * 1100}px) rotate(${(1 - q) * 15}deg)`;
  if (e === 'up') tr = `translateY(${(1 - q) * 1200}px)`;
  if (e === 'spin') tr = `scale(${0.2 + 0.8 * q}) rotate(${(1 - q) * 200}deg)`;
  return (
    <AbsoluteFill>
      <Bg v={SP_BG[n]} c={sp.accent} />
      <div style={{position: 'absolute', left: 90, right: 90, top: 270, display: 'flex', justifyContent: 'center', opacity: prog(f, 0, 8)}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 38, letterSpacing: '0.18em', color: C.bg, background: sp.accent, padding: '10px 28px', borderRadius: 14, textTransform: 'uppercase', transform: `rotate(${n % 2 ? 2 : -2}deg)`}}>
          Terima kasih · Penaja
        </div>
      </div>
      <div style={{position: 'absolute', left: (1080 - cw) / 2, top, width: cw, height: ch, borderRadius: 40, overflow: 'hidden', background: sp.bg, padding: light ? 30 : 0, boxSizing: 'border-box',
        border: `5px solid ${sp.accent}`, boxShadow: `0 0 100px ${sp.accent}88`, transform: `${tr} rotate(${n % 2 ? 2 : -2}deg)`, opacity: Math.min(1, f / 3)}}>
        <Img src={staticFile(`assets/sp_${sp.key}.png`)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
        <AbsoluteFill style={{background: '#fff', opacity: flash * 0.5}} />
      </div>
      <Stack top={top + ch + (tt ? 50 : 100)} gap={4} rot={n % 2 ? 2 : -2}>
        <Line text={sp.l1} cue={cues[1]} size={190} dur={9} from={n % 2 ? 'right' : 'left'} />
        <Line text={sp.l2} cue={cues[2]} size={sp.l2.length > 16 ? 56 : 100} color={sp.accent} dur={9} weight={sp.l2.length > 16 ? 700 : 900} track={sp.l2.length > 16 ? 0 : -0.02} from={n % 2 ? 'left' : 'right'} />
      </Stack>
    </AbsoluteFill>
  );
};

const Penutup: React.FC<SceneProps> = ({dur, cues}) => {
  const f = useCurrentFrame();
  const tt = useTT();
  const R = tt ? 150 : 80;
  const rise = (c: number) => { const p = prog(f, c, 14); return {opacity: p, transform: `translateY(${(1 - p) * 40}px)`}; };
  const lab = (t: string) => <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 32, letterSpacing: '0.2em', color: C.accent, marginBottom: 14}}>{t}</div>;
  const wcard = (src: string, w: number, h: number) => (
    <div style={{width: w, height: h, borderRadius: 20, overflow: 'hidden', background: '#fff', padding: 14, boxSizing: 'border-box'}}>
      <Img src={staticFile(`assets/${src}.png`)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
    </div>);
  const logo = (src: string, w: number, h: number, bg: string) => (
    <div style={{width: w, height: h, borderRadius: 18, overflow: 'hidden', background: bg, border: '2px solid rgba(255,255,255,.25)', padding: bg === '#fff' ? 8 : 0, boxSizing: 'border-box'}}>
      <Img src={staticFile(`assets/sp_${src}.png`)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
    </div>);
  return (
    <AbsoluteFill>
      <Bg v="court" c={C.accent} />
      <Stack top={tt ? 160 : 170} gap={6} right={R}>
        <Line text="Sampai jumpa" cue={cues[0]} size={140} from="left" />
        <Line text="di TPX Kuantan" cue={cues[0] + 0.3} size={150} color={C.accent} from="right" />
        <Line text="4 Nov 2026 · 8.30 malam" cue={cues[0] + 0.8} size={72} weight={700} track={0} />
      </Stack>
      <div style={{position: 'absolute', left: 80, right: R, top: tt ? 470 : 600, ...rise(cues[1])}}>
        {lab('ANJURAN')}
        <div style={{display: 'flex', gap: 24}}>{wcard('mbk', tt ? 320 : 340, tt ? 320 : 340)}{wcard('kesumba', tt ? 320 : 340, tt ? 320 : 340)}</div>
      </div>
      <div style={{position: 'absolute', left: 80, right: R, top: tt ? 840 : 1020, ...rise(cues[1] + 0.5)}}>
        {lab('URUSETIA')}
        <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
          {wcard('biro', tt ? 240 : 300, tt ? 240 : 300)}
          <div style={{flex: 1, fontFamily: FONT, color: C.text}}>
            <div style={{fontSize: tt ? 32 : 38, fontWeight: 800, lineHeight: 1.15, textTransform: 'uppercase'}}>Biro Sukan & Rekreasi KESUMBA</div>
            <div style={{fontSize: tt ? 34 : 40, fontWeight: 600, marginTop: 14}}><span style={{fontWeight: 900, color: C.accent}}>Anas Rahimi</span></div>
            <div style={{fontSize: tt ? 34 : 40, fontWeight: 600}}>013-906 9116</div>
          </div>
          <div style={{width: tt ? 190 : 230, height: tt ? 190 : 230, borderRadius: 18, overflow: 'hidden', background: '#fff', padding: 10, boxSizing: 'border-box'}}>
            <Img src={staticFile('assets/qr.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 80, right: R, top: tt ? 1190 : 1440, ...rise(cues[2] + 0.3)}}>
        {lab('PENAJA BERSAMA')}
        <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
          {logo('tpx', 200, 110, '#000111')}{logo('kospek', 340, 110, '#fff')}{logo('yap', 260, 110, '#000511')}{logo('alliance', 150, 110, '#fff')}
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: tt ? 1420 : 1810, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 28, color: 'rgba(255,255,255,.7)', letterSpacing: '0.06em', opacity: prog(f, cues[2] + 0.6, 14)}}>
        Foto pemain: MZ Photography
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Peralihan: wipe berlainan arah ---------- */
const WIPES = ['up', 'right', 'diag', 'down', 'left'] as const;
const WIPE_COLORS = [C.accent, C.blue, C.red];
const Wipe: React.FC<{v: (typeof WIPES)[number]; color: string}> = ({v, color}) => {
  const f = useCurrentFrame();
  if (f < 1 || f > 13) return null;
  const p = interpolate(f, [1, 6, 13], [100, 0, -100], {...clamp, easing: Easing.inOut(Easing.cubic)});
  let tr = '';
  let st: React.CSSProperties = {};
  if (v === 'up') tr = `translateY(${p}%)`;
  if (v === 'down') tr = `translateY(${-p}%)`;
  if (v === 'right') tr = `translateX(${-p}%)`;
  if (v === 'left') tr = `translateX(${p}%)`;
  if (v === 'diag') { tr = `translateX(${-p * 1.3}%) skewX(-18deg)`; st = {left: '-20%', right: '-20%'}; }
  return <AbsoluteFill style={{background: color, transform: tr, ...st}} />;
};

const Chrome: React.FC = () => {
  const f = useCurrentFrame();
  const tt = useTT();
  const t = f / FPS;
  const end = T.scenes.find((x) => x.id === 'thanks')!.start;
  const hide = T.scenes.some((x) => (x.type === 'team' || x.id === 'grid' || ['hook'].includes(x.id)) && t >= x.start && t < x.end);
  if (t >= end || hide || tt) return null;
  return <div style={{position: 'absolute', top: tt ? 150 : 64, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 28, letterSpacing: '0.22em', color: 'rgba(255,255,255,.8)'}}>PIALA DATUK BANDAR KUANTAN 2026</div>;
};

export const Video: React.FC<{tiktok?: boolean}> = ({tiktok = false}) => {
  const S = T.scenes;
  const render = (sc: (typeof S)[number]) => {
    const props = {dur: sc.end - sc.start, cues: sc.cues};
    switch (sc.id) {
      case 'hook': return <Hook {...props} />;
      case 'kejoh': return <Kejoh {...props} />;
      case 'rasmi': return <Rasmi {...props} />;
      case 'vip': return <Vip {...props} />;
      case 'pasukan': return <Pasukan {...props} />;
      case 'grid': return <Grid {...props} />;
      case 'tarikh': return <Tarikh {...props} />;
      case 'masa': return <Masa {...props} />;
      case 'lokasi': return <Lokasi {...props} />;
      case 'thanks': return <Thanks {...props} />;
      case 'penutup': return <Penutup {...props} />;
      default: return sc.type === 'sponsor' ? <Sponsor {...props} n={Number(sc.id.replace('sp', ''))} /> : <Team {...props} n={Number(sc.id.replace('team', ''))} />;
    }
  };
  const wipes = S.slice(1).filter((s) => s.type !== 'team' && s.type !== 'sponsor');
  return (
    <TTCtx.Provider value={tiktok}>
    <AbsoluteFill style={{background: C.bg}}>
      {S.map((sc) => (
        <Sequence key={sc.id} from={Math.round(sc.start * FPS)} durationInFrames={Math.round((sc.end - sc.start) * FPS)}>
          {render(sc)}
        </Sequence>
      ))}
      <Chrome />
      {wipes.map((s, i) => (
        <Sequence key={`w-${s.id}`} from={Math.round(s.start * FPS) - 6} durationInFrames={14} layout="none">
          <Wipe v={WIPES[i % WIPES.length]} color={WIPE_COLORS[i % WIPE_COLORS.length]} />
        </Sequence>
      ))}
      <Audio src={staticFile('soundtrack.wav')} />
    </AbsoluteFill>
    </TTCtx.Provider>
  );
};
