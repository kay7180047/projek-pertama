import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender} from 'remotion';
import EDL from './edl.json';
import TIMING from './timing.json';
import TLN from './timeline.json';
const TOTAL = TLN.total, E_END = 77.5; // E_END = mula kad penutup

// ---------- tema sementara (tiada branding diberi): hitam-biru malam + hijau-kuning neon (warna bola) ----------
const C = {bg: '#07173A', neon: '#C6FF3D', white: '#FFFFFF', dim: 'rgba(255,255,255,0.78)'};
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
  const f = useCurrentFrame(); const tot = TOTAL * FPS;
  const show = f < S(E_END) ? 1 : interpolate(f, [S(E_END), S(E_END + 0.3)], [1, 0], clamp);
  return (
    <div style={{opacity: show}}>
      <div style={{position: 'absolute', left: 54, top: 142, display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(11,18,32,.72)', border: `2px solid ${C.neon}`, padding: '10px 22px 8px 18px', borderRadius: 6}}>
        <div style={{width: 14, height: 14, borderRadius: 7, background: C.neon, boxShadow: `0 0 14px ${C.neon}`}} />
        <div style={{fontFamily: F.cond, fontWeight: 800, fontSize: 32, letterSpacing: 2.5, color: C.white}}>KEJOHANAN PICKLEBALL ANTARA JABATAN</div>
      </div>
      <div style={{position: 'absolute', left: 54, right: 54, top: 214, height: 6, background: 'rgba(255,255,255,.18)'}}>
        <div style={{width: `${(f / tot) * 100}%`, height: '100%', background: C.neon}} />
      </div>
      <div style={{position: 'absolute', right: 54, top: 232, fontFamily: F.cond, fontWeight: 700, fontSize: 28, letterSpacing: 3, color: C.dim}}>LIPUTAN · 02 NOV 2026</div>
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

// ---------- seksyen penerangan ----------
// Sumber: poster rasmi "Kejohanan Pickleball Antara Jabatan 2026" (Jadual Kumpulan & Perlawanan)
const FACTS: {t0: number; n: string; chip: string; title: string; teams?: string[]; sub?: string}[] = [
  {t0: 11, n: '01', chip: 'KUMPULAN A', title: 'KUMPULAN A', teams: ['HORIZON', 'ZENITH A', 'VANGUARD A', 'VALIANT A']},
  {t0: 16, n: '02', chip: 'KUMPULAN B', title: 'KUMPULAN B', teams: ['GUARDIAN A', 'PHOENIX B', 'ZENITH B', 'VALIANT B']},
  {t0: 21, n: '03', chip: 'KUMPULAN C', title: 'KUMPULAN C', teams: ['VANGUARD B', 'PHOENIX A', 'GUARDIAN B']},
  {t0: 26, n: '04', chip: 'JADUAL', title: '11 PASUKAN\n15 PERLAWANAN', sub: 'Peringkat kumpulan di Court 1 hingga 8.'}
];
const Fact: React.FC<(typeof FACTS)[number]> = ({t0, n, chip, title, teams, sub}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const pn = useIn(t0, {damping: 12, stiffness: 240, mass: 0.6}), pt = useIn(t0 + 0.15), ps = useIn(t0 + 0.55);
  const o = outAt(f, t0 + 5, 0.12);
  if (f < S(t0) || f >= S(t0 + 5)) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 54, top: 262, display: 'flex', alignItems: 'center', gap: 14, opacity: Math.min(1, pn * 2)}}>
        <div style={{background: C.neon, color: C.bg, fontFamily: F.cond, fontWeight: 900, fontSize: 40, padding: '2px 14px 0', letterSpacing: 2, transform: `scale(${interpolate(pn, [0, 1], [1.6, 1])})`}}>{n}</div>
        <div style={{fontFamily: F.cond, fontWeight: 800, fontSize: 32, letterSpacing: 4, color: C.neon}}>PASUKAN BERTANDING · {n}/04</div>
      </div>
      <div style={{position: 'absolute', left: 54, top: 322, fontFamily: F.cond, fontWeight: 900, fontSize: 118, lineHeight: 0.92, color: C.white, whiteSpace: 'pre', textShadow: '0 6px 0 rgba(0,0,0,.35)',
        opacity: Math.min(1, pt * 2.5), transform: `translateX(${interpolate(pt, [0, 1], [-90, 0])}px)`}}>{title}</div>
      {sub && <div style={{position: 'absolute', left: 54, top: 1405, width: 960, fontFamily: F.body, fontWeight: 700, fontSize: 44, lineHeight: 1.25, color: C.white, opacity: Math.min(1, ps * 2.5), transform: `translateY(${interpolate(ps, [0, 1], [26, 0])}px)`, textShadow: '0 3px 10px rgba(0,0,0,.6)'}}>{sub}</div>}
      {teams && <div style={{position: 'absolute', left: 54, right: 54, top: 1398, display: 'flex', flexWrap: 'wrap', gap: 12}}>
        {teams.map((t, i) => { const pp = spring({frame: f - S(t0 + 0.5 + i * 0.12), fps, config: {damping: 14, stiffness: 220, mass: 0.6}});
          return <div key={t} style={{background: C.white, color: C.bg, fontFamily: F.cond, fontWeight: 900, fontSize: 46, letterSpacing: 2, padding: '8px 22px 4px', borderRadius: 8, borderBottom: `6px solid ${C.neon}`, opacity: Math.min(1, pp * 2.5), transform: `translateY(${interpolate(pp, [0, 1], [30, 0])}px)`, boxShadow: '0 6px 18px rgba(0,0,0,.4)'}}>{t}</div>; })}
      </div>}
    </AbsoluteFill>
  );
};

// ---------- contoh (tag aksi) ----------
const TAGS = [
  {t0: 31, label: 'AKSI 01', kw: 'RALLY', cover: false}, {t0: 35, label: 'AKSI 02', kw: 'PUKULAN', cover: false}, {t0: 39, label: 'SORAKAN', kw: 'PENYOKONG', cover: false},
  {t0: 43, label: 'AKSI 03', kw: 'LARIAN', cover: true}, {t0: 47, label: 'REPLAY', kw: 'AKSI 04 · SLOW-MO', cover: false}, {t0: 51, label: 'SUASANA', kw: 'GELANGGANG', cover: true}
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
const Flash: React.FC<{t: number; a?: number}> = ({t, a = 0.55}) => { const f = useCurrentFrame(); const o = interpolate(f, [S(t), S(t) + 4], [a, 0], clamp); return f >= S(t) && f < S(t) + 4 ? <AbsoluteFill style={{background: '#fff', opacity: o}} /> : null; };

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

// ---------- plat logo penganjur (Majlis, KESUMBA, BIRO) ----------
const LOGOS = [{f: 'mbk', h: 230, w: 111, alt: 'Majlis Bandaraya Kuantan'}, {f: 'kesumba', h: 200, w: 195, alt: 'KESUMBA'}, {f: 'biro', h: 210, w: 200, alt: 'Biro Sukan dan Rekreasi KESUMBA'}];
const LogoPlate: React.FC<{t0: number; t1: number; top: number}> = ({t0, t1, top}) => {
  const f = useCurrentFrame(); const p = useIn(t0, {damping: 15, stiffness: 190, mass: 0.7});
  if (f < S(t0) || f >= S(t1)) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', opacity: Math.min(1, p * 2.5) * outAt(f, t1, 0.12), transform: `translateY(${interpolate(p, [0, 1], [70, 0])}px) scale(${interpolate(p, [0, 1], [0.92, 1])})`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 46, background: '#fff', padding: '22px 44px', borderRadius: 26, borderBottom: `8px solid ${C.neon}`, boxShadow: '0 14px 40px rgba(0,0,0,.45)'}}>
        {LOGOS.map((l, i) => (
          <React.Fragment key={l.f}>
            {i > 0 && <div style={{width: 2, height: 150, background: 'rgba(11,18,32,.14)'}} />}
            <Img src={staticFile(`logos/${l.f}.png`)} alt={l.alt} style={{height: l.h, width: l.w, objectFit: 'contain'}} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ---------- muka hadapan: poster rasmi pada 0.5s pertama (= cover lalai TikTok), kemudian terus ke hook ----------
const PosterOpen: React.FC = () => {
  const f = useCurrentFrame(); const END = S(0.5);
  if (f >= END) return null;
  const z = interpolate(f, [0, END], [1.0, 1.045], {easing: Easing.out(Easing.cubic), ...clamp});
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Img src={staticFile('poster.jpg')} style={{position: 'absolute', inset: 0, width: 1080, height: 1920, objectFit: 'cover', filter: 'blur(38px) brightness(.55)', transform: 'scale(1.25)'}} />
      <Img src={staticFile('poster.jpg')} style={{position: 'absolute', left: 0, top: 196, width: 1080, height: 1527, transform: `scale(${z})`}} />
    </AbsoluteFill>
  );
};

// ---------- JUARA: PHOENIX A ----------
const DEPTS = ['JABATAN PENYELENGGARAAN', 'JABATAN PENILAIAN & PENGURUSAN HARTA'];
const DeptPill: React.FC<{t0: number; t1: number; top: number; text: string; size?: number}> = ({t0, t1, top, text, size = 40}) => {
  const f = useCurrentFrame(); const p = useIn(t0, {damping: 15, stiffness: 210, mass: 0.6});
  if (f < S(t0) || f >= S(t1)) return null;
  return (
    <div style={{position: 'absolute', left: 54, top, opacity: Math.min(1, p * 2.5) * outAt(f, t1, 0.1), transform: `translateX(${interpolate(p, [0, 1], [-120, 0])}px)`}}>
      <div style={{display: 'inline-block', background: C.white, color: C.bg, fontFamily: F.cond, fontWeight: 800, fontSize: size, letterSpacing: 2.5, padding: '8px 22px 3px', borderRadius: 8, borderBottom: `6px solid ${C.neon}`, boxShadow: '0 6px 18px rgba(0,0,0,.4)'}}>{text}</div>
    </div>
  );
};
const Chip: React.FC<{t0: number; t1: number; top: number; text: string}> = ({t0, t1, top, text}) => (
  <Line t0={t0} t1={t1} style={{left: 54, top}}><div style={{display: 'inline-block', background: C.neon, color: C.bg, fontFamily: F.cond, fontWeight: 900, fontSize: 46, letterSpacing: 5, padding: '6px 20px 2px'}}>{text}</div></Line>
);
const Confetti: React.FC<{b: number; n?: number; seed?: number; dur?: number}> = ({b, n = 70, seed = 3, dur = 4.2}) => {
  const f = useCurrentFrame(); const t = f / FPS - b;
  if (t < 0 || t > dur + 1.5) return null;
  let sd = seed * 977; const r = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
  const cols = [C.neon, C.white, '#3DDCFF', '#FFE600'];
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      {Array.from({length: n}).map((_, i) => {
        const x0 = r() * 1080, d = r() * 0.9, vy = 520 + r() * 520, sway = 30 + r() * 70, ph = r() * 6.28, w = 14 + r() * 10, h = 22 + r() * 14, rs = 220 + r() * 520, col = cols[(r() * cols.length) | 0];
        const lt = t - d; if (lt < 0) return null;
        const y = -60 + vy * lt; if (y > 2000) return null;
        return <div key={i} style={{position: 'absolute', left: x0 + Math.sin(lt * 3 + ph) * sway, top: y, width: w, height: h, background: col, opacity: 0.95, transform: `rotate(${lt * rs}deg) rotateX(${lt * 400}deg)`}} />;
      })}
    </AbsoluteFill>
  );
};

// ---------- kad penutup ----------
const EndCard: React.FC = () => {
  const f = useCurrentFrame(); const pa = useIn(E_END + 0.4, {damping: 14, stiffness: 200, mass: 0.7}), pb = useIn(E_END + 1.4, {damping: 11, stiffness: 240, mass: 0.6}), pc = useIn(E_END + 2.6);
  const dim = interpolate(f, [S(E_END), S(E_END + 0.4)], [0, 0.62], clamp);
  if (f < S(E_END)) return null;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(11,18,32,${dim})`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', opacity: Math.min(1, pa * 2.5), transform: `translateY(${interpolate(pa, [0, 1], [50, 0])}px)`}}>
        <div style={{fontFamily: F.cond, fontWeight: 800, fontSize: 48, letterSpacing: 8, color: C.neon}}>LIPUTAN KEJOHANAN 2026</div>
        <div style={{fontFamily: F.cond, fontWeight: 900, fontSize: 150, lineHeight: 0.92, color: C.white, textShadow: '0 6px 0 rgba(0,0,0,.35)'}}>PICKLEBALL<br />ANTARA JABATAN</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center', transform: `scale(${interpolate(pb, [0, 1], [1.4, 1])})`, opacity: Math.min(1, pb * 3)}}>
        <div style={{display: 'inline-block', background: C.neon, color: C.bg, fontFamily: F.cond, fontWeight: 900, fontSize: 78, padding: '10px 34px 4px', lineHeight: 1, letterSpacing: 2, whiteSpace: 'nowrap'}}>TAG RAKAN SEPASUKAN!</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1050, textAlign: 'center', opacity: Math.min(1, pc * 2.5), transform: `translateY(${interpolate(pc, [0, 1], [24, 0])}px)`}}>
        <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 42, color: C.white, textShadow: '0 3px 10px rgba(0,0,0,.6)'}}>Follow untuk liputan seterusnya.</div>
        <div style={{fontFamily: F.cond, fontWeight: 700, fontSize: 36, letterSpacing: 5, color: C.dim, marginTop: 18}}>2 NOVEMBER 2026</div>
      </div>
      <LogoPlate t0={E_END + 3.2} t1={TOTAL + 0.1} top={1215} />
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
      <Slam t0={0.5} t1={2.0} text="SEMALAM." size={260} y={310} rot={-3} align="left" x={54} />
      <Slam t0={2.0} t1={4.0} text={'JABATAN\nVS JABATAN'} size={178} y={260} color={C.white} />
      <Slam t0={4.0} t1={6.0} text="SIAPA JUARA?" size={168} y={330} color={C.neon} rot={-2} />

      {/* PERSOALAN 6-11s */}
      <Scrim from={6} to={11} top />
      <Line t0={6.2} t1={11} style={{left: 54, top: 300}}><div style={{fontFamily: F.cond, fontWeight: 800, fontSize: 84, letterSpacing: 4, color: C.neon}}>LAPORAN KEJOHANAN</div></Line>
      <Line t0={6.8} t1={11} style={{left: 54, top: 392}}><div style={{fontFamily: F.cond, fontWeight: 900, fontSize: 176, lineHeight: 0.9, color: C.white, textShadow: '0 6px 0 rgba(0,0,0,.35)'}}>PICKLEBALL</div></Line>
      <Line t0={7.4} t1={11} style={{left: 54, top: 548}}><div style={{fontFamily: F.cond, fontWeight: 900, fontSize: 150, lineHeight: 0.9, color: C.white, textShadow: '0 6px 0 rgba(0,0,0,.35)'}}><span style={{color: C.neon}}>ANTARA JABATAN</span></div></Line>

      <LogoPlate t0={8.2} t1={11} top={1190} />

      {/* PENERANGAN 11-31s */}
      {FACTS.map((x) => <Fact key={x.n} {...x} />)}

      {/* CONTOH 31-56s */}
      <Scrim from={43} to={47} top /><Scrim from={51} to={56} top />
      {TAGS.map((x, i) => <Tag key={x.label} {...x} t1={x.t0 + (i === 5 ? 5 : 4)} />)}

      {/* JUARA 56-69.5s: build-up -> reveal -> sorakan -> kad juara */}
      <Scrim from={56} to={69.5} top />
      <Line t0={56.2} t1={60} style={{left: 54, top: 300}}><div style={{fontFamily: F.cond, fontWeight: 900, fontSize: 150, lineHeight: 0.92, color: C.white, textShadow: '0 6px 0 rgba(0,0,0,.35)'}}>DAN JUARANYA</div></Line>
      {[57.2, 57.8, 58.4].map((t, k) => <Line key={k} t0={t} t1={60} style={{left: 54 + k * 62, top: 430}}><div style={{fontFamily: F.cond, fontWeight: 900, fontSize: 150, lineHeight: 0.6, color: C.neon}}>.</div></Line>)}
      <Chip t0={60.3} t1={62.5} top={300} text="JUARA 2026" />
      <Slam t0={60.0} t1={62.5} text="PHOENIX A" size={230} y={375} color={C.white} align="left" x={54} />
      <Line t0={62.7} t1={65.5} style={{left: 54, top: 290}}><div style={{fontFamily: F.cond, fontWeight: 900, fontSize: 130, lineHeight: 0.9, color: C.neon, textShadow: '0 6px 0 rgba(0,0,0,.35)'}}>PHOENIX A</div></Line>
      <DeptPill t0={62.7} t1={65.5} top={430} text={DEPTS[0]} />
      <DeptPill t0={63.3} t1={65.5} top={505} text={DEPTS[1]} />
      <Chip t0={65.8} t1={69.5} top={290} text="JUARA KEJOHANAN 2026" />
      <Slam t0={65.5} t1={69.5} text="PHOENIX A" size={190} y={350} color={C.neon} align="left" x={54} />
      <DeptPill t0={66.2} t1={69.5} top={545} text={DEPTS[0]} />
      <DeptPill t0={66.6} t1={69.5} top={615} text={DEPTS[1]} />
      <Confetti b={60.0} /><Confetti b={65.5} n={50} seed={9} />

      {/* TAKEAWAY 69.5-77.5s */}
      <Scrim from={69.5} to={E_END} top />
      <Slam t0={69.7} t1={73.5} text={'TAHNIAH'} size={176} y={300} align="left" x={54} />
      <Slam t0={70.1} t1={73.5} text={'SEMUA PESERTA!'} size={150} y={462} color={C.neon} align="left" x={54} />
      <Slam t0={73.7} t1={E_END} text={'TERIMA KASIH'} size={132} y={300} align="left" x={54} />
      <Slam t0={74.1} t1={E_END} text={'PENYOKONG!'} size={132} y={430} color={C.neon} align="left" x={54} />

      {/* bingkai sudut untuk klip landscape */}
      {sh.map((s, i) => EDL.shots[i].layout === 'card' ? <Sequence key={'b' + s.id} from={s.from} durationInFrames={s.frames}><Brackets /></Sequence> : null)}

      <EndCard />
      <Hud />
      <PosterOpen />
      {[6, 11, 31, 56, 65.5, E_END].map((t) => <Wipe key={t} t={t} />)}
      {[2, 4, 35, 39, 43, 47, 51].map((t) => <Flash key={'f' + t} t={t} />)}
      <Flash t={60} a={0.85} />
      <Audio src={staticFile('audio/mix.wav')} />
    </AbsoluteFill>
  );
};
