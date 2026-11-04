import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender} from 'remotion';
import EDL from './edl.json';
import TIMING from './timing.json';

// ---------- tema sementara (tiada branding diberi): hitam-biru malam + hijau-kuning neon (warna bola) ----------
const C = {bg: '#0B1220', neon: '#C6FF3D', white: '#FFFFFF', dim: 'rgba(255,255,255,0.78)'};
const F = {cond: '"Barlow Condensed", sans-serif', body: 'Inter, sans-serif'};
const FPS = 30;
const S = (sec: number) => Math.round(sec * FPS);

const fontCss = `
@font-face{font-family:"Barlow Condensed";font-weight:700;src:url(${staticFile('fonts/barlow-condensed-latin-700-normal.woff2')}) format("woff2")}
@font-face{font-family:"Barlow Condensed";font-weight:800;src:url(${staticFile('fonts/barlow-condensed-latin-800-normal.woff2')}) format("woff2")}
@font-face{font-family:"Barlow Condensed";font-weight:900;src:url(${staticFile('fonts/barlow-condensed-latin-900-normal.woff2')}) format("woff2")}
@font-face{font-family:Inter;font-weight:500;src:url(${staticFile('fonts/inter-latin-500-normal.woff2')}) format("woff2")}
@font-face{font-family:Inter;font-weight:700;src:url(${staticFile('fonts/inter-latin-700-normal.woff2')}) format("woff2")}`;
const useFonts = () => {
  const [h] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    Promise.all(['900 100px "Barlow Condensed"', '800 40px "Barlow Condensed"', '700 40px "Barlow Condensed"', '500 40px Inter', '700 40px Inter'].map((f) => document.fonts.load(f, 'AZ az 0123'))).then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};

// ---------- util animasi ----------
const useIn = (t0: number, cfg = {damping: 14, stiffness: 190, mass: 0.7}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  return spring({frame: f - S(t0), fps, config: cfg});
};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const outAt = (f: number, tEnd: number, d = 0.18) => interpolate(f, [S(tEnd - d), S(tEnd)], [1, 0], clamp);

// ---------- teks ----------
const Slam: React.FC<{t0: number; t1: number; text: string; size: number; color?: string; y: number; rot?: number; align?: 'left' | 'center'; x?: number}> = ({t0, t1, text, size, color = C.white, y, rot = 0, align = 'center', x = 0}) => {
  const f = useCurrentFrame(); const p = useIn(t0, {damping: 11, stiffness: 260, mass: 0.6});
  if (f < S(t0) || f > S(t1)) return null;
  const o = outAt(f, t1, 0.1);
  return (
    <div style={{position: 'absolute', left: x, right: align === 'center' ? 0 : undefined, top: y, textAlign: align, fontFamily: F.cond, fontWeight: 900, fontSize: size, lineHeight: 0.92, letterSpacing: 1, color, textTransform: 'uppercase',
      transform: `scale(${interpolate(p, [0, 1], [1.5, 1])}) rotate(${rot}deg)`, opacity: Math.min(1, p * 3) * o, textShadow: '0 6px 0 rgba(0,0,0,.35), 0 0 40px rgba(0,0,0,.45)', whiteSpace: 'pre'}}>{text}</div>
  );
};
const Line: React.FC<{t0: number; t1: number; children: React.ReactNode; style: React.CSSProperties}> = ({t0, t1, children, style}) => {
  const f = useCurrentFrame(); const p = useIn(t0, {damping: 16, stiffness: 200, mass: 0.6});
  if (f < S(t0) || f > S(t1)) return null;
  return <div style={{position: 'absolute', opacity: Math.min(1, p * 2.5) * outAt(f, t1, 0.12), transform: `translateY(${interpolate(p, [0, 1], [36, 0])}px)`, ...style}}>{children}</div>;
};
const Scrim: React.FC<{from: number; to: number; strength?: number; top?: boolean}> = ({from, to, strength = 0.82, top = false}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [S(from), S(from + 0.2), S(to - 0.15), S(to)], [0, 1, 1, 0], clamp);
  return <div style={{position: 'absolute', left: 0, right: 0, ...(top ? {top: 0} : {bottom: 0}), height: top ? 900 : 1000, opacity: o, background: `linear-gradient(${top ? 'to bottom' : 'to top'}, rgba(11,18,32,${strength}) 0%, rgba(11,18,32,${strength * 0.55}) 45%, rgba(11,18,32,0) 100%)`}} />;
};

// ---------- HUD ----------
const Hud: React.FC = () => {
  const f = useCurrentFrame(); const tot = 70 * FPS;
  const show = f < S(64) ? 1 : interpolate(f, [S(64), S(64.3)], [1, 0], clamp);
  return (
    <div style={{opacity: show}}>
      <div style={{position: 'absolute', left: 54, top: 142, display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(11,18,32,.72)', border: `2px solid ${C.neon}`, padding: '10px 22px 8px 18px', borderRadius: 6}}>
        <div style={{width: 14, height: 14, borderRadius: 7, background: C.neon, boxShadow: `0 0 14px ${C.neon}`}} />
        <div style={{fontFamily: F.cond, fontWeight: 800, fontSize: 32, letterSpacing: 2.5, color: C.white}}>KEJOHANAN PICKLEBALL ANTARA JABATAN</div>
      </div>
      <div style={{position: 'absolute', left: 54, right: 54, top: 214, height: 6, background: 'rgba(255,255,255,.18)'}}>
        <div style={{width: `${(f / tot) * 100}%`, height: '100%', background: C.neon}} />
      </div>
      <div style={{position: 'absolute', right: 54, top: 232, fontFamily: F.cond, fontWeight: 700, fontSize: 28, letterSpacing: 3, color: C.dim}}>02 NOV 2026</div>
    </div>
  );
};

// bracket sudut untuk bingkai landscape (bar: y 555..1365)
const Brackets: React.FC = () => {
  const L = 54, w = 5, c = C.neon, y0 = 555, y1 = 1365;
  const b = (st: React.CSSProperties) => <div style={{position: 'absolute', width: L, height: L, borderColor: c, borderStyle: 'solid', borderWidth: 0, ...st}} />;
  return (<>
    {b({left: 14, top: y0 + 14, borderTopWidth: w, borderLeftWidth: w})}{b({right: 14, top: y0 + 14, borderTopWidth: w, borderRightWidth: w})}
    {b({left: 14, top: y1 - 14 - L, borderBottomWidth: w, borderLeftWidth: w})}{b({right: 14, top: y1 - 14 - L, borderBottomWidth: w, borderRightWidth: w})}
  </>);
};

// ---------- carta / grafik ----------
const Court: React.FC<{p: number}> = ({p}) => { // pandangan atas gelanggang 20x44 kaki; zon kitchen = 7 kaki dari jaring
  const W = 330, H = 150, kw = W * (7 / 44);
  return (
    <svg width={W + 8} height={H + 8} viewBox={`-4 -4 ${W + 8} ${H + 8}`}>
      <rect x={0} y={0} width={W} height={H} fill="rgba(11,18,32,.85)" stroke={C.white} strokeWidth={3} />
      <rect x={W / 2 - kw} y={0} width={kw * 2} height={H} fill={C.neon} opacity={0.28 * p} />
      <line x1={W / 2 - kw} y1={0} x2={W / 2 - kw} y2={H} stroke={C.white} strokeWidth={2} /><line x1={W / 2 + kw} y1={0} x2={W / 2 + kw} y2={H} stroke={C.white} strokeWidth={2} />
      <line x1={0} y1={H / 2} x2={W / 2 - kw} y2={H / 2} stroke={C.white} strokeWidth={2} /><line x1={W / 2 + kw} y1={H / 2} x2={W} y2={H / 2} stroke={C.white} strokeWidth={2} />
      <line x1={W / 2} y1={-2} x2={W / 2} y2={H + 2} stroke={C.neon} strokeWidth={5} />
      <text x={W / 2} y={H / 2 + 9} textAnchor="middle" fontFamily={F.cond} fontWeight={800} fontSize={26} fill={C.white} opacity={p} letterSpacing={2}>KITCHEN</text>
    </svg>
  );
};
const Paddle: React.FC = () => (
  <svg width={220} height={150} viewBox="0 0 220 150"><g transform="rotate(-30 80 80)"><rect x={20} y={32} width={110} height={92} rx={34} fill="none" stroke={C.neon} strokeWidth={7} /><rect x={125} y={66} width={50} height={22} rx={7} fill={C.neon} /></g>
    <circle cx={170} cy={44} r={30} fill="none" stroke={C.white} strokeWidth={5} />{[[160, 36], [176, 34], [168, 50], [182, 48], [156, 52]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} fill={C.white} />)}</svg>
);
const Underarm: React.FC<{p: number}> = ({p}) => (
  <svg width={220} height={150} viewBox="0 0 220 150"><path d="M20 40 C 40 130, 150 140, 200 60" fill="none" stroke={C.neon} strokeWidth={8} strokeLinecap="round" strokeDasharray="320" strokeDashoffset={320 * (1 - p)} /><polygon points="205,50 180,58 208,78" fill={C.neon} opacity={p} />
    <line x1={10} y1={96} x2={120} y2={96} stroke="rgba(255,255,255,.65)" strokeWidth={3} strokeDasharray="8 8" /><text x={10} y={84} fontFamily={F.cond} fontWeight={700} fontSize={24} fill={C.white}>PINGGANG</text></svg>
);
const Score: React.FC<{p: number}> = ({p}) => (
  <div style={{display: 'flex', alignItems: 'stretch', fontFamily: F.cond, fontWeight: 900, transform: `scale(${0.9 + 0.1 * p})`}}>
    <div style={{background: C.neon, color: C.bg, fontSize: 118, lineHeight: 1, padding: '2px 22px 0'}}>11</div>
    <div style={{background: 'rgba(11,18,32,.9)', border: `3px solid ${C.neon}`, borderLeft: 0, color: C.white, fontSize: 40, padding: '14px 18px', lineHeight: 0.95, letterSpacing: 2}}>BEZA<br />2 MATA</div>
  </div>
);

// ---------- seksyen penerangan ----------
const FACTS = [
  {t0: 11, n: '01', title: 'PADDLE &\nBOLA BERLUBANG', sub: 'Pemukul keras, bola plastik ringan.', g: 'paddle'},
  {t0: 16, n: '02', title: 'SERVIS\nBAWAH TANGAN', sub: 'Bola dipukul bawah paras pinggang.', g: 'under'},
  {t0: 21, n: '03', title: 'ZON\n"KITCHEN"', sub: 'Dalam zon ini, tak boleh volley.', g: 'court'},
  {t0: 26, n: '04', title: '11 MATA,\nBEZA 2', sub: 'Biasanya sampai 11 mata, menang beza 2.', g: 'score'}
];
const Fact: React.FC<(typeof FACTS)[number]> = ({t0, n, title, sub, g}) => {
  const f = useCurrentFrame(); const pn = useIn(t0, {damping: 12, stiffness: 240, mass: 0.6}), pt = useIn(t0 + 0.15), ps = useIn(t0 + 0.55), pg = useIn(t0 + 0.9);
  const o = outAt(f, t0 + 5, 0.12);
  if (f < S(t0) || f >= S(t0 + 5)) return null;
  const gp = interpolate(pg, [0, 1], [0, 1], clamp);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 54, top: 262, display: 'flex', alignItems: 'center', gap: 14, opacity: Math.min(1, pn * 2)}}>
        <div style={{background: C.neon, color: C.bg, fontFamily: F.cond, fontWeight: 900, fontSize: 40, padding: '2px 14px 0', letterSpacing: 2, transform: `scale(${interpolate(pn, [0, 1], [1.6, 1])})`}}>{n}</div>
        <div style={{fontFamily: F.cond, fontWeight: 800, fontSize: 32, letterSpacing: 4, color: C.neon}}>PERATURAN RINGKAS · {n}/04</div>
      </div>
      <div style={{position: 'absolute', left: 54, top: 322, fontFamily: F.cond, fontWeight: 900, fontSize: 118, lineHeight: 0.92, color: C.white, whiteSpace: 'pre', textShadow: '0 6px 0 rgba(0,0,0,.35)',
        opacity: Math.min(1, pt * 2.5), transform: `translateX(${interpolate(pt, [0, 1], [-90, 0])}px)`}}>{title}</div>
      <div style={{position: 'absolute', left: 54, top: 1405, width: 620, fontFamily: F.body, fontWeight: 700, fontSize: 44, lineHeight: 1.25, color: C.white, opacity: Math.min(1, ps * 2.5), transform: `translateY(${interpolate(ps, [0, 1], [26, 0])}px)`, textShadow: '0 3px 10px rgba(0,0,0,.6)'}}>{sub}</div>
      <div style={{position: 'absolute', right: 54, top: 1395, opacity: Math.min(1, pg * 2.5)}}>
        {g === 'paddle' && <Paddle />}{g === 'under' && <Underarm p={gp} />}{g === 'court' && <Court p={gp} />}{g === 'score' && <Score p={gp} />}
      </div>
    </AbsoluteFill>
  );
};

// ---------- contoh (tag aksi) ----------
const TAGS = [
  {t0: 31, label: 'AKSI 01', kw: 'RALLY', cover: false}, {t0: 35, label: 'AKSI 02', kw: 'PUKULAN', cover: false}, {t0: 39, label: 'SORAKAN', kw: 'PENYOKONG', cover: false},
  {t0: 43, label: 'AKSI 03', kw: 'LARIAN', cover: true}, {t0: 47, label: 'REPLAY', kw: 'AKSI 04 · SLOW-MO', cover: false}, {t0: 51, label: 'SEMANGAT', kw: 'BERSAMA', cover: true}
];
const Tag: React.FC<(typeof TAGS)[number] & {t1: number}> = ({t0, t1, label, kw, cover}) => {
  const f = useCurrentFrame(); const p = useIn(t0 + 0.2, {damping: 12, stiffness: 230, mass: 0.6}), p2 = useIn(t0 + 0.45);
  if (f < S(t0) || f >= S(t1)) return null;
  const top = 330, o = outAt(f, t1, 0.12);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 54, top, overflow: 'hidden'}}>
        <div style={{fontFamily: F.cond, fontWeight: 900, fontSize: 170, lineHeight: 0.9, color: C.white, transform: `translateY(${interpolate(p, [0, 1], [180, 0])}px)`, textShadow: '0 6px 0 rgba(0,0,0,.35)'}}>{label}</div>
      </div>
      <div style={{position: 'absolute', left: 54, top: top + 160, display: 'flex', alignItems: 'center', gap: 16, opacity: Math.min(1, p2 * 2), transform: `translateX(${interpolate(p2, [0, 1], [-60, 0])}px)`}}>
        <div style={{width: 90 * p2, height: 8, background: C.neon}} />
        <div style={{fontFamily: F.cond, fontWeight: 800, fontSize: 52, letterSpacing: 5, color: C.neon, textShadow: '0 3px 10px rgba(0,0,0,.6)'}}>{kw}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- transisi: sapuan diagonal neon (menutup potongan) ----------
const Wipe: React.FC<{t: number}> = ({t}) => {
  const f = useCurrentFrame(); const a = S(t) - 4, b = S(t) + 5;
  if (f < a || f > b) return null;
  const p = interpolate(f, [a, b], [0, 1], {easing: Easing.inOut(Easing.cubic), ...clamp});
  return <div style={{position: 'absolute', top: -300, bottom: -300, width: 360, left: interpolate(p, [0, 1], [-700, 1500]), transform: 'skewX(-14deg)', background: `linear-gradient(90deg, rgba(198,255,61,0), ${C.neon} 40%, ${C.neon} 60%, rgba(198,255,61,0))`, mixBlendMode: 'normal', opacity: 0.95}} />;
};
const Flash: React.FC<{t: number}> = ({t}) => { const f = useCurrentFrame(); const o = interpolate(f, [S(t), S(t) + 4], [0.55, 0], clamp); return f >= S(t) && f < S(t) + 4 ? <AbsoluteFill style={{background: '#fff', opacity: o}} /> : null; };

// ---------- shot ----------
const ShotView: React.FC<{id: string; from: number; frames: number; idx: number; layout: string}> = ({id, from, frames, idx, layout}) => (
  <Sequence from={from} durationInFrames={frames}>
    <ShotInner id={id} frames={frames} idx={idx} layout={layout} />
  </Sequence>
);
const ShotInner: React.FC<{id: string; frames: number; idx: number; layout: string}> = ({id, frames, idx}) => {
  const f = useCurrentFrame();
  const punch = interpolate(f, [0, 6], [1.06, 1], {easing: Easing.out(Easing.cubic), ...clamp});
  const drift = interpolate(f, [0, frames], idx % 2 ? [1.0, 1.035] : [1.035, 1.0]);
  return (
    <AbsoluteFill style={{transform: `scale(${punch * drift})`}}>
      <OffthreadVideo src={staticFile(`clips/${id}.mp4`)} muted style={{width: 1080, height: 1920}} />
    </AbsoluteFill>
  );
};

// ---------- kad penutup ----------
const EndCard: React.FC = () => {
  const f = useCurrentFrame(); const pa = useIn(64.4, {damping: 14, stiffness: 200, mass: 0.7}), pb = useIn(65.4, {damping: 11, stiffness: 240, mass: 0.6}), pc = useIn(66.6);
  const dim = interpolate(f, [S(64), S(64.4)], [0, 0.62], clamp);
  if (f < S(64)) return null;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(11,18,32,${dim})`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', opacity: Math.min(1, pa * 2.5), transform: `translateY(${interpolate(pa, [0, 1], [50, 0])}px)`}}>
        <div style={{fontFamily: F.cond, fontWeight: 800, fontSize: 48, letterSpacing: 8, color: C.neon}}>KEJOHANAN</div>
        <div style={{fontFamily: F.cond, fontWeight: 900, fontSize: 150, lineHeight: 0.92, color: C.white, textShadow: '0 6px 0 rgba(0,0,0,.35)'}}>PICKLEBALL<br />ANTARA JABATAN</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1010, textAlign: 'center', transform: `scale(${interpolate(pb, [0, 1], [1.4, 1])})`, opacity: Math.min(1, pb * 3)}}>
        <div style={{display: 'inline-block', background: C.neon, color: C.bg, fontFamily: F.cond, fontWeight: 900, fontSize: 84, padding: '10px 34px 4px', lineHeight: 1, letterSpacing: 2, whiteSpace: 'nowrap'}}>JOM CUBA PICKLEBALL!</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1170, textAlign: 'center', opacity: Math.min(1, pc * 2.5), transform: `translateY(${interpolate(pc, [0, 1], [24, 0])}px)`}}>
        <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 42, color: C.white, textShadow: '0 3px 10px rgba(0,0,0,.6)'}}>Tag rakan sepasukan anda.</div>
        <div style={{fontFamily: F.cond, fontWeight: 700, fontSize: 36, letterSpacing: 5, color: C.dim, marginTop: 18}}>2 NOVEMBER 2026</div>
      </div>
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  useFonts();
  const sh = TIMING.shots;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <style>{fontCss}</style>
      {sh.map((s, i) => <ShotView key={s.id} id={s.id} from={s.from} frames={s.frames} idx={i} layout={EDL.shots[i].layout} />)}

      {/* HOOK 0-6s: tiga potongan, tiga kata */}
      <Scrim from={0} to={2} strength={0.7} top />
      <Slam t0={0.0} t1={2.0} text="SEMALAM." size={260} y={310} rot={-3} align="left" x={54} />
      <Slam t0={2.0} t1={4.0} text={'JABATAN\nVS JABATAN'} size={178} y={260} color={C.white} />
      <Slam t0={4.0} t1={6.0} text="PICKLEBALL!" size={196} y={330} color={C.neon} rot={-2} />

      {/* PERSOALAN 6-11s */}
      <Scrim from={6} to={11} top />
      <Line t0={6.2} t1={11} style={{left: 54, top: 300}}><div style={{fontFamily: F.cond, fontWeight: 800, fontSize: 84, letterSpacing: 4, color: C.neon}}>PICKLEBALL NI</div></Line>
      <Line t0={6.8} t1={11} style={{left: 54, top: 392}}><div style={{fontFamily: F.cond, fontWeight: 900, fontSize: 176, lineHeight: 0.9, color: C.white, textShadow: '0 6px 0 rgba(0,0,0,.35)'}}>SEBENARNYA</div></Line>
      <Line t0={7.4} t1={11} style={{left: 54, top: 548}}><div style={{fontFamily: F.cond, fontWeight: 900, fontSize: 176, lineHeight: 0.9, color: C.white, textShadow: '0 6px 0 rgba(0,0,0,.35)'}}>MACAM <span style={{color: C.neon}}>MANA?</span></div></Line>

      {/* PENERANGAN 11-31s */}
      {FACTS.map((x) => <Fact key={x.n} {...x} />)}

      {/* CONTOH 31-56s */}
      <Scrim from={43} to={47} top /><Scrim from={51} to={56} top />
      {TAGS.map((x, i) => <Tag key={x.label} {...x} t1={x.t0 + (i === 5 ? 5 : 4)} />)}

      {/* TAKEAWAY 56-64s */}
      <Scrim from={56} to={64} top />
      <Slam t0={56.2} t1={60} text={'SENANG'} size={176} y={300} align="left" x={54} />
      <Slam t0={56.6} t1={60} text={'DIPELAJARI.'} size={176} y={462} color={C.neon} align="left" x={54} />
      <Slam t0={60.2} t1={64} text={'SERONOK'} size={176} y={300} align="left" x={54} />
      <Slam t0={60.6} t1={64} text={'DIMAINKAN.'} size={176} y={462} color={C.neon} align="left" x={54} />

      {/* bingkai sudut untuk klip landscape */}
      {sh.map((s, i) => EDL.shots[i].layout === 'card' ? <Sequence key={'b' + s.id} from={s.from} durationInFrames={s.frames}><Brackets /></Sequence> : null)}

      <EndCard />
      <Hud />
      {[6, 11, 31, 56, 64].map((t) => <Wipe key={t} t={t} />)}
      {[2, 4, 35, 39, 43, 47, 51, 60].map((t) => <Flash key={'f' + t} t={t} />)}
      <Audio src={staticFile('audio/mix.wav')} />
    </AbsoluteFill>
  );
};
