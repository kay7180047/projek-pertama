import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender} from 'remotion';
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
const FACTS = [
  {t0: 11, n: '01', title: 'PERLAWANAN\nBERMULA', sub: 'Pemain dari pelbagai jabatan mula bertanding.'},
  {t0: 16, n: '02', title: 'RALLY\nYANG RANCAK', sub: 'Pertukaran bola yang rancak di gelanggang.'},
  {t0: 21, n: '03', title: 'PASUKAN\nBERTARUNG', sub: 'Setiap jabatan membawa semangat sendiri.'},
  {t0: 26, n: '04', title: 'AKSI SEPANJANG\nMALAM', sub: 'Gelanggang tak pernah sunyi.'}
];
const Fact: React.FC<(typeof FACTS)[number]> = ({t0, n, title, sub}) => {
  const f = useCurrentFrame(); const pn = useIn(t0, {damping: 12, stiffness: 240, mass: 0.6}), pt = useIn(t0 + 0.15), ps = useIn(t0 + 0.55);
  const o = outAt(f, t0 + 5, 0.12);
  if (f < S(t0) || f >= S(t0 + 5)) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 54, top: 262, display: 'flex', alignItems: 'center', gap: 14, opacity: Math.min(1, pn * 2)}}>
        <div style={{background: C.neon, color: C.bg, fontFamily: F.cond, fontWeight: 900, fontSize: 40, padding: '2px 14px 0', letterSpacing: 2, transform: `scale(${interpolate(pn, [0, 1], [1.6, 1])})`}}>{n}</div>
        <div style={{fontFamily: F.cond, fontWeight: 800, fontSize: 32, letterSpacing: 4, color: C.neon}}>SOROTAN PERLAWANAN · {n}/04</div>
      </div>
      <div style={{position: 'absolute', left: 54, top: 322, fontFamily: F.cond, fontWeight: 900, fontSize: 118, lineHeight: 0.92, color: C.white, whiteSpace: 'pre', textShadow: '0 6px 0 rgba(0,0,0,.35)',
        opacity: Math.min(1, pt * 2.5), transform: `translateX(${interpolate(pt, [0, 1], [-90, 0])}px)`}}>{title}</div>
      <div style={{position: 'absolute', left: 54, top: 1405, width: 960, fontFamily: F.body, fontWeight: 700, fontSize: 44, lineHeight: 1.25, color: C.white, opacity: Math.min(1, ps * 2.5), transform: `translateY(${interpolate(ps, [0, 1], [26, 0])}px)`, textShadow: '0 3px 10px rgba(0,0,0,.6)'}}>{sub}</div>
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

// ---------- kad penutup ----------
const EndCard: React.FC = () => {
  const f = useCurrentFrame(); const pa = useIn(64.4, {damping: 14, stiffness: 200, mass: 0.7}), pb = useIn(65.4, {damping: 11, stiffness: 240, mass: 0.6}), pc = useIn(66.6);
  const dim = interpolate(f, [S(64), S(64.4)], [0, 0.62], clamp);
  if (f < S(64)) return null;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(11,18,32,${dim})`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', opacity: Math.min(1, pa * 2.5), transform: `translateY(${interpolate(pa, [0, 1], [50, 0])}px)`}}>
        <div style={{fontFamily: F.cond, fontWeight: 800, fontSize: 48, letterSpacing: 8, color: C.neon}}>LIPUTAN KEJOHANAN</div>
        <div style={{fontFamily: F.cond, fontWeight: 900, fontSize: 150, lineHeight: 0.92, color: C.white, textShadow: '0 6px 0 rgba(0,0,0,.35)'}}>PICKLEBALL<br />ANTARA JABATAN</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center', transform: `scale(${interpolate(pb, [0, 1], [1.4, 1])})`, opacity: Math.min(1, pb * 3)}}>
        <div style={{display: 'inline-block', background: C.neon, color: C.bg, fontFamily: F.cond, fontWeight: 900, fontSize: 78, padding: '10px 34px 4px', lineHeight: 1, letterSpacing: 2, whiteSpace: 'nowrap'}}>TAG RAKAN SEPASUKAN!</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1050, textAlign: 'center', opacity: Math.min(1, pc * 2.5), transform: `translateY(${interpolate(pc, [0, 1], [24, 0])}px)`}}>
        <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 42, color: C.white, textShadow: '0 3px 10px rgba(0,0,0,.6)'}}>Follow untuk liputan seterusnya.</div>
        <div style={{fontFamily: F.cond, fontWeight: 700, fontSize: 36, letterSpacing: 5, color: C.dim, marginTop: 18}}>2 NOVEMBER 2026</div>
      </div>
      <LogoPlate t0={67.2} t1={70.1} top={1215} />
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
      <Line t0={6.2} t1={11} style={{left: 54, top: 300}}><div style={{fontFamily: F.cond, fontWeight: 800, fontSize: 84, letterSpacing: 4, color: C.neon}}>LAPORAN KEJOHANAN</div></Line>
      <Line t0={6.8} t1={11} style={{left: 54, top: 392}}><div style={{fontFamily: F.cond, fontWeight: 900, fontSize: 176, lineHeight: 0.9, color: C.white, textShadow: '0 6px 0 rgba(0,0,0,.35)'}}>PICKLEBALL</div></Line>
      <Line t0={7.4} t1={11} style={{left: 54, top: 548}}><div style={{fontFamily: F.cond, fontWeight: 900, fontSize: 150, lineHeight: 0.9, color: C.white, textShadow: '0 6px 0 rgba(0,0,0,.35)'}}><span style={{color: C.neon}}>ANTARA JABATAN</span></div></Line>

      <LogoPlate t0={8.2} t1={11} top={1190} />

      {/* PENERANGAN 11-31s */}
      {FACTS.map((x) => <Fact key={x.n} {...x} />)}

      {/* CONTOH 31-56s */}
      <Scrim from={43} to={47} top /><Scrim from={51} to={56} top />
      {TAGS.map((x, i) => <Tag key={x.label} {...x} t1={x.t0 + (i === 5 ? 5 : 4)} />)}

      {/* TAKEAWAY 56-64s */}
      <Scrim from={56} to={64} top />
      <Slam t0={56.2} t1={60} text={'TAHNIAH'} size={176} y={300} align="left" x={54} />
      <Slam t0={56.6} t1={60} text={'SEMUA PESERTA!'} size={150} y={462} color={C.neon} align="left" x={54} />
      <Slam t0={60.2} t1={64} text={'TERIMA KASIH'} size={132} y={300} align="left" x={54} />
      <Slam t0={60.6} t1={64} text={'PENYOKONG!'} size={132} y={430} color={C.neon} align="left" x={54} />

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
