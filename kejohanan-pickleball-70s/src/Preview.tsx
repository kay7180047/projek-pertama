import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, delayRender, continueRender, Easing} from 'remotion';
import T from './timing.json';

const FPS = T.fps;
const K = T.k;
const C = {bg: '#050A1C', gold: '#FFC83D', lime: '#C6FF1A', blue: '#2D7BFF', red: '#FF3B4E', white: '#FFFFFF'};

// ---------- fonts (tempatan, dari @fontsource) ----------
const fontHandle = delayRender('fonts');
Promise.all(
  [
    ['Barlow Condensed', 'fonts/barlow-condensed-latin-800-normal.woff2', '800'],
    ['Barlow Condensed', 'fonts/barlow-condensed-latin-700-normal.woff2', '700'],
    ['Inter', 'fonts/inter-latin-500-normal.woff2', '500'],
    ['Inter', 'fonts/inter-latin-700-normal.woff2', '700'],
  ].map(async ([fam, file, w]) => {
    const ff = new FontFace(fam, `url(${staticFile(file)})`, {weight: w});
    await ff.load();
    document.fonts.add(ff);
  })
).then(() => continueRender(fontHandle)).catch(() => continueRender(fontHandle));

const H: React.CSSProperties = {fontFamily: 'Barlow Condensed', fontWeight: 800, textTransform: 'uppercase', lineHeight: 0.92, letterSpacing: '0.01em'};
const B: React.CSSProperties = {fontFamily: 'Inter', fontWeight: 500};
const SP = {damping: 13, stiffness: 140, mass: 0.7};

// ---------- helpers ----------
const useSpring = (t0: number, config = SP) => {
  const f = useCurrentFrame();
  return spring({frame: f - t0 * FPS, fps: FPS, config});
};
const Gate: React.FC<{a: number; b: number; children: React.ReactNode}> = ({a, b, children}) => {
  const f = useCurrentFrame();
  return f >= a * FPS && f < b * FPS ? <>{children}</> : null;
};
// Naik masuk + (pilihan) keluar pantas.
const In: React.FC<{t0: number; out?: number; dy?: number; dx?: number; from?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({t0, out, dy = 60, dx = 0, from = 0.85, style, children}) => {
  const f = useCurrentFrame();
  const p = spring({frame: f - t0 * FPS, fps: FPS, config: SP});
  let o = Math.min(1, p * 1.6), ex = 0, es = 1;
  if (out !== undefined) {
    const q = interpolate(f, [out * FPS, out * FPS + 7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
    o *= 1 - q; ex = -q * 50; es = 1 + q * 0.08;
  }
  return <div style={{opacity: o, transform: `translate(${(1 - p) * dx}px, ${(1 - p) * dy + ex}px) scale(${(from + (1 - from) * p) * es})`, ...style}}>{children}</div>;
};
const Words: React.FC<{text: string; t0: number; size: number; color?: string; step?: number; max?: number}> = ({text, t0, size, color = C.white, step = 0.08, max = 980}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${size * 0.22}px`, maxWidth: max, ...H, fontSize: size, color}}>
      {text.split(' ').map((w, i) => {
        const p = spring({frame: f - (t0 + i * step) * FPS, fps: FPS, config: {damping: 15, stiffness: 150, mass: 0.7}});
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', padding: `${size * 0.08}px 0`}}>
            <span style={{display: 'inline-block', transform: `translateY(${(1 - Math.min(1, p)) * 115}%)`}}>{w}</span>
          </span>
        );
      })}
    </div>
  );
};

const Ball: React.FC<{size: number; rot?: number}> = ({size, rot = 0}) => {
  const holes: [number, number][] = [[50, 50], [50, 28], [50, 72], [28, 50], [72, 50], [34, 34], [66, 34], [34, 66], [66, 66], [50, 12], [50, 88], [12, 50], [88, 50], [22, 22], [78, 22], [22, 78], [78, 78]];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{transform: `rotate(${rot}deg)`}}>
      <defs>
        <radialGradient id="bg" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#F4FF9A" />
          <stop offset="0.55" stopColor="#C6FF1A" />
          <stop offset="1" stopColor="#6FA300" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#bg)" />
      {holes.map(([x, y], i) => (Math.hypot(x - 50, y - 50) < 44 ? <circle key={i} cx={x} cy={y} r="4.3" fill="#2f4700" opacity="0.8" /> : null))}
    </svg>
  );
};

// ---------- latar gelap ----------
const Bg: React.FC = () => {
  const f = useCurrentFrame();
  const dots = Array.from({length: 26}, (_, i) => {
    const x = (i * 211) % 1080, sp = 0.6 + ((i * 37) % 10) / 12, y = 1920 - ((f * sp * 1.6 + i * 173) % 2000);
    return <div key={i} style={{position: 'absolute', left: x, top: y, width: 5 + (i % 3) * 3, height: 5 + (i % 3) * 3, borderRadius: 99, background: i % 3 === 0 ? C.gold : i % 3 === 1 ? '#5FA2FF' : C.lime, opacity: 0.35}} />;
  });
  return (
    <AbsoluteFill style={{background: 'radial-gradient(120% 75% at 50% 28%, #14286A 0%, #080F32 52%, #03061A 100%)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: '-60%', width: '220%', bottom: '-12%', height: '52%', transform: 'perspective(700px) rotateX(64deg)', opacity: 0.55,
        backgroundImage: 'repeating-linear-gradient(90deg, rgba(90,150,255,.35) 0 3px, transparent 3px 130px), repeating-linear-gradient(0deg, rgba(90,150,255,.35) 0 3px, transparent 3px 130px)', backgroundPosition: `0 ${(f * 3) % 130}px`}} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', top: -200, height: 2400, width: 160 + i * 60, left: ((f * (5 + i * 2) + i * 500) % 1900) - 400, transform: 'skewX(-18deg)', background: `linear-gradient(90deg, transparent, ${['rgba(255,59,78,.22)', 'rgba(45,123,255,.25)', 'rgba(255,200,61,.14)'][i]}, transparent)`}} />
      ))}
      {dots}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.55) 100%)'}} />
    </AbsoluteFill>
  );
};

// ---------- wipe bersudut ----------
const WIPE_COL: Record<number, string> = {4: C.gold, 8: C.blue, 10: C.red, 16: C.lime, 60: C.gold, 64: C.lime};
const Wipe: React.FC<{b: number; color: string}> = ({b, color}) => {
  const f = useCurrentFrame();
  const p = (f - (b * FPS - 9)) / 18;
  if (p < 0 || p > 1.2) return null;
  const e = Easing.inOut(Easing.quad);
  const x1 = interpolate(e(Math.min(1, Math.max(0, p))), [0, 1], [-1750, 1750]);
  const x2 = interpolate(e(Math.min(1, Math.max(0, p - 0.1))), [0, 1], [-1750, 1750]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: -100, height: 2120, width: 1500, left: 540 + x2 - 750, transform: 'skewX(-14deg)', background: '#fff'}} />
      <div style={{position: 'absolute', top: -100, height: 2120, width: 1500, left: 540 + x1 - 750, transform: 'skewX(-14deg)', background: `linear-gradient(100deg, ${color}, #0b1640 80%)`}} />
    </AbsoluteFill>
  );
};

// ---------- 0-4s: logo penganjur ----------
const OpenLogos: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  // Bg putih + kilauan
  const bgGlow = <AbsoluteFill style={{background: 'radial-gradient(70% 45% at 50% 48%, #E6F1FF 0%, #FFFFFF 70%)'}} />;
  // --- MBPK: menara "naik" dari bawah ke atas ---
  const pA = interpolate(t, [0.05, 0.95], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const exitA = interpolate(t, [1.78, 2.0], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const sweep = interpolate(t, [0.9, 1.5], [-600, 1500], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hA = 1300, wA = hA * (1440 / 2029);
  // --- KESUMBA: 6 jalur menyusun ---
  const strips = 6, wK = 920, hK = wK * (1532 / 1440);
  const tK = t - K.kesumba;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {bgGlow}
      <AbsoluteFill style={{opacity: 0.5}}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{position: 'absolute', top: -200, height: 2400, width: 90, left: 120 + i * 300 + Math.sin(f / 40 + i) * 20, transform: 'skewX(-18deg)', background: 'linear-gradient(180deg, rgba(40,100,200,0), rgba(40,100,200,.07), rgba(40,100,200,0))'}} />
        ))}
      </AbsoluteFill>
      <In t0={0.05} dy={-30} style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center'}}>
        <span style={{...H, fontSize: 54, letterSpacing: '0.35em', color: '#1B3A8A'}}>ANJURAN</span>
      </In>
      {t < 2.05 && (
        <div style={{position: 'absolute', left: 540 - wA / 2, top: 260 + exitA * -220, width: wA, height: hA, opacity: 1 - exitA, transform: `scale(${1 + exitA * 0.12})`}}>
          <div style={{width: '100%', height: '100%', clipPath: `inset(${(1 - pA) * 100}% 0 0 0)`}}>
            <Img src={staticFile('logos/00a-mbpk.jpg')} style={{width: '100%', height: '100%', mixBlendMode: 'multiply'}} />
          </div>
          {/* garis cahaya mengikut hujung reveal */}
          <div style={{position: 'absolute', left: -40, right: -40, top: `${(1 - pA) * 100}%`, height: 6, background: '#2D7BFF', boxShadow: '0 0 30px 8px rgba(45,123,255,.7)', opacity: pA < 1 ? 1 : 0}} />
          <div style={{position: 'absolute', top: 0, bottom: 0, width: 160, left: sweep - 300, transform: 'skewX(-18deg)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.9), transparent)', mixBlendMode: 'screen'}} />
        </div>
      )}
      {t >= 2.0 && (
        <div style={{position: 'absolute', left: 540 - wK / 2, top: 960 - hK / 2 - 20, width: wK, height: hK}}>
          {Array.from({length: strips}, (_, i) => {
            const d = i * 0.055;
            const p = spring({frame: (tK - d) * FPS, fps: FPS, config: {damping: 15, stiffness: 150, mass: 0.8}});
            const dir = i % 2 === 0 ? -1 : 1;
            const sw = wK / strips;
            return (
              <div key={i} style={{position: 'absolute', left: i * sw, top: 0, width: sw + 1, height: hK, overflow: 'hidden', transform: `translateY(${(1 - Math.min(1, p)) * 900 * dir}px)`, opacity: Math.min(1, p * 3)}}>
                <Img src={staticFile('logos/00b-kesumba.jpg')} style={{position: 'absolute', left: -i * sw, top: 0, width: wK, height: hK, filter: 'brightness(1.033)', mixBlendMode: 'multiply'}} />
              </div>
            );
          })}
          <div style={{position: 'absolute', top: 0, bottom: 0, width: 150, left: interpolate(tK, [0.55, 1.15], [-300, wK + 200], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), transform: 'skewX(-18deg)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.95), transparent)', mixBlendMode: 'screen'}} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- 4-8s: hook ----------
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const out = (t0: number) => interpolate(f, [t0 * FPS, t0 * FPS + 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const slam = (t0: number) => spring({frame: f - t0 * FPS, fps: FPS, config: {damping: 11, stiffness: 220, mass: 0.6}});
  const shake = (t0: number) => { const q = f - t0 * FPS; return q >= 0 && q < 8 ? Math.sin(q * 3) * (8 - q) * 1.4 : 0; };
  const ph = t % 1, by = 4 * ph * (1 - ph);
  const sq = ph < 0.08 || ph > 0.92 ? 0.82 : 1;
  const e1 = out(K.satu), e2 = out(K.piala);
  return (
    <AbsoluteFill>
      {t < K.satu && (
        <div style={{position: 'absolute', top: 480, width: '100%', textAlign: 'center', opacity: 1 - e1, transform: `translate(${shake(K.ten)}px, 0) scale(${(1.7 - 0.7 * Math.min(1.1, slam(K.ten))) * (1 + e1 * 0.2)})`}}>
          <div style={{...H, fontSize: 640, color: C.gold, textShadow: '0 10px 0 #8a5a00, 0 0 60px rgba(255,200,61,.5)'}}>10</div>
          <div style={{...H, fontSize: 210, color: C.white, marginTop: -40}}>PASUKAN</div>
        </div>
      )}
      {t >= K.satu && t < K.piala && (
        <div style={{position: 'absolute', top: 470, width: '100%', textAlign: 'center', opacity: 1 - e2, transform: `translate(${shake(K.satu)}px, 0) scale(${(1.6 - 0.6 * Math.min(1.1, slam(K.satu))) * (1 + e2 * 0.2)})`}}>
          <div style={{...H, fontSize: 250, color: C.white}}>SATU</div>
          <div style={{...H, fontSize: 420, color: C.lime, marginTop: -30, textShadow: '0 0 70px rgba(198,255,26,.45)'}}>PIALA</div>
        </div>
      )}
      {t >= K.piala && (
        <div style={{position: 'absolute', top: 420, width: '100%', textAlign: 'center'}}>
          <In t0={K.piala} dy={80}>
            <div style={{...H, fontSize: 118, color: C.gold}}>PIALA DATUK BANDAR</div>
            <div style={{...H, fontSize: 250, color: C.white, marginTop: 6}}>KUANTAN</div>
            <div style={{...H, fontSize: 250, color: C.white, marginTop: -10, textShadow: '0 0 50px rgba(45,123,255,.7)'}}>2026</div>
          </In>
          <In t0={K.piala + 0.35} dy={50} style={{marginTop: 40, display: 'inline-block'}}>
            <div style={{...H, fontSize: 86, color: '#06102E', background: C.lime, padding: '12px 38px 6px', transform: 'skewX(-8deg)'}}>4.11.26 – 9.12.26</div>
          </In>
        </div>
      )}
      {/* bola melantun */}
      <div style={{position: 'absolute', left: 540 - 75 + Math.sin(t * 1.5) * 150, top: 1650 - by * 210 - 150, transform: `scaleY(${sq}) scaleX(${2 - sq})`}}>
        <Ball size={150} rot={t * 360} />
      </div>
      <div style={{position: 'absolute', left: 140, right: 140, top: 1672, height: 6, background: 'linear-gradient(90deg, transparent, #5FA2FF, transparent)', boxShadow: '0 0 24px rgba(95,162,255,.8)'}} />
    </AbsoluteFill>
  );
};

// ---------- 8-10s: jabatan / agensi / GLC ----------
const Jab: React.FC = () => (
  <AbsoluteFill>
    <div style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center'}}>
      <In t0={K.jab} dx={-500} dy={0}><div style={{...H, fontSize: 300, color: C.white}}>JABATAN</div></In>
      <In t0={K.agensi} dx={500} dy={0}><div style={{...H, fontSize: 300, color: C.gold}}>AGENSI</div></In>
      <In t0={K.glc} dx={-500} dy={0}><div style={{...H, fontSize: 300, color: C.lime}}>GLC</div></In>
    </div>
  </AbsoluteFill>
);

const Card: React.FC<{t0: number; label: string; value: string; size?: number; accent: string}> = ({t0, label, value, size = 88, accent}) => (
  <In t0={t0} dx={-300} dy={0}>
    <div style={{width: 920, minHeight: 150, padding: '18px 36px 14px', boxSizing: 'border-box', borderRadius: 22, background: 'rgba(8,16,50,.82)', border: `3px solid ${accent}`, boxShadow: `0 0 36px ${accent}55`}}>
      <div style={{...H, fontSize: 36, color: accent, letterSpacing: '0.2em'}}>{label}</div>
      <div style={{...H, fontSize: size, color: C.white, marginTop: 4}}>{value}</div>
    </div>
  </In>
);

// ---------- 10-16s: maklumat perasmian ----------
const Info: React.FC = () => (
  <AbsoluteFill>
    <div style={{position: 'absolute', top: 230, width: '100%', textAlign: 'center'}}>
      <In t0={K.mp} dy={-60}><div style={{...H, fontSize: 190, color: C.gold, textShadow: '0 6px 0 #7a4f00'}}>MAJLIS</div></In>
      <In t0={K.mp + 0.1} dy={-60}><div style={{...H, fontSize: 190, color: C.gold, textShadow: '0 6px 0 #7a4f00', marginTop: -6}}>PERASMIAN</div></In>
      <In t0={K.kej}><div style={{...H, fontSize: 62, color: C.white, marginTop: 18, borderBottom: `6px solid ${C.lime}`, display: 'inline-block', paddingBottom: 6}}>KEJOHANAN PICKLEBALL BERPASUKAN</div></In>
    </div>
    <div style={{position: 'absolute', top: 770, left: 80, display: 'flex', flexDirection: 'column', gap: 22}}>
      <Card t0={K.date} label="TARIKH" value="RABU, 4 NOVEMBER 2026" accent={C.blue} />
      <Card t0={K.time} label="MASA" value="8:30 MALAM" accent={C.lime} />
      <Card t0={K.venue} label="LOKASI" value="THE PICKLE EXCHANGE (TPX), KUANTAN" size={60} accent={C.red} />
    </div>
    <div style={{position: 'absolute', top: 1340, width: '100%', textAlign: 'center'}}>
      <In t0={K.rasmi}>
        <div style={{...H, fontSize: 44, color: C.gold, letterSpacing: '0.25em'}}>DIRASMIKAN OLEH</div>
        <div style={{...H, fontSize: 82, color: C.white, marginTop: 6}}>YBHG. DATUK BANDAR KUANTAN</div>
      </In>
      <In t0={K.vip} style={{marginTop: 26, display: 'inline-block'}}>
        <div style={{...B, fontWeight: 700, fontSize: 38, color: '#fff', background: 'rgba(255,59,78,.9)', padding: '12px 30px', borderRadius: 99}}>Turut dihadiri tetamu jemputan & VIP</div>
      </In>
    </div>
  </AbsoluteFill>
);

const FIT = ['cover', 'cover', 'cover', 'cover', 'cover', 'contain', 'cover', 'contain', 'cover', 'cover'] as const;
const LBG = ['#000', '#000', '#f7f7f7', '#000', '#000', '#fff', '#1d2046', '#f7f7f7', '#000', '#fff'];

// ---------- 16-20s: pemakluman tarikh + wakil pasukan ----------
const Apa: React.FC = () => {
  const f = useCurrentFrame();
  const bar = interpolate(f, [K.diag * FPS, (K.diag + 0.8) * FPS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 250, width: '100%', textAlign: 'center'}}>
        <In t0={K.apa} dy={-30}><div style={{...H, fontSize: 50, color: C.gold, letterSpacing: '0.35em'}}>PEMAKLUMAN</div></In>
        <In t0={K.apa + 0.1} from={0.6}><div style={{...H, fontSize: 330, color: C.lime, marginTop: 10, textShadow: '0 0 60px rgba(198,255,26,.4)'}}>4 NOV</div></In>
        <In t0={K.apa + 0.3} from={0.7}><div style={{...H, fontSize: 170, color: C.white, marginTop: -10}}>– 9 DIS 2026</div></In>
      </div>
      <Gate a={K.diag - 0.1} b={20}>
        <div style={{position: 'absolute', left: 110, top: 960, width: 860}}>
          <div style={{position: 'relative', height: 16, borderRadius: 9, background: 'rgba(255,255,255,.18)'}}>
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${bar * 100}%`, borderRadius: 9, background: `linear-gradient(90deg, ${C.lime}, ${C.gold})`, boxShadow: `0 0 24px ${C.lime}aa`}} />
            <div style={{position: 'absolute', left: -14, top: -12, width: 40, height: 40, borderRadius: 99, background: C.lime, boxShadow: `0 0 26px ${C.lime}`}} />
            <div style={{position: 'absolute', right: -14, top: -12, width: 40, height: 40, borderRadius: 99, background: C.gold, transform: `scale(${bar > 0.98 ? 1 : 0})`, boxShadow: `0 0 26px ${C.gold}`}} />
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 24}}>
            <div style={{...H, fontSize: 52, color: C.lime}}>PERASMIAN</div>
            <div style={{...H, fontSize: 52, color: C.gold, opacity: bar > 0.98 ? 1 : 0}}>TAMAT</div>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div style={{...B, fontWeight: 700, fontSize: 36, color: C.white}}>4 Nov</div>
            <div style={{...B, fontWeight: 700, fontSize: 36, color: C.white, opacity: bar > 0.98 ? 1 : 0}}>9 Dis</div>
          </div>
        </div>
      </Gate>
      <div style={{position: 'absolute', top: 1235, width: '100%', textAlign: 'center'}}>
        <In t0={K.wk} dy={50}>
          <div style={{...H, fontSize: 150, color: C.white}}>10 PASUKAN</div>
          <div style={{...B, fontWeight: 700, fontSize: 44, color: C.gold, marginTop: 8}}>Wakil Jabatan · Agensi · GLC</div>
        </In>
      </div>
      <div style={{position: 'absolute', top: 1520, left: 46, display: 'flex', gap: 12}}>
        {T.teams.map((tm, i) => {
          const p = spring({frame: f - (K.chip + i * K.chipStep) * FPS, fps: FPS, config: {damping: 11, stiffness: 180, mass: 0.6}});
          return (
            <div key={i} style={{width: 88, height: 88, borderRadius: 20, overflow: 'hidden', background: LBG[i], border: `3px solid ${tm.accent}`, boxSizing: 'border-box', opacity: Math.min(1, p * 2), transform: `scale(${0.3 + 0.7 * p})`}}>
              <Img src={staticFile(tm.file)} style={{width: '100%', height: '100%', objectFit: FIT[i]}} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- pasukan ----------
const TeamScene: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  const tm = T.teams[i];
  const t0 = T.scene.teams + i * T.scene.teamLen;
  const lt = f / FPS - t0;
  const a = tm.w / tm.h;
  const box = 800;
  const w = a >= 1 ? box : box * a, h = a >= 1 ? box / a : box;
  const p = spring({frame: f - (t0 + 0.12) * FPS, fps: FPS, config: {damping: 12, stiffness: 110, mass: 0.9}});
  const zoom = 1 + lt * 0.02;
  const float = Math.sin(lt * 2.4) * 8;
  const rays = f * 0.6;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 540 - 800, top: 770 - 800, width: 1600, height: 1600, opacity: 0.55 * Math.min(1, p), background: `radial-gradient(circle, ${tm.accent}66 0%, transparent 55%)`}} />
      <div style={{position: 'absolute', left: 540 - 800, top: 770 - 800, width: 1600, height: 1600, opacity: 0.35 * Math.min(1, p), transform: `rotate(${rays}deg)`,
        background: `repeating-conic-gradient(from 0deg, ${tm.accent}55 0deg 8deg, transparent 8deg 24deg)`, WebkitMaskImage: 'radial-gradient(circle, #000 0%, transparent 55%)', maskImage: 'radial-gradient(circle, #000 0%, transparent 55%)'}} />
      <div style={{position: 'absolute', left: 540 - w / 2, top: 770 - h / 2 + float, width: w, height: h, opacity: Math.min(1, p * 2),
        transform: `translateX(${(1 - p) * 1100}px) rotate(${(1 - p) * 10}deg) scale(${zoom * (0.85 + 0.15 * Math.min(1.05, p))})`}}>
        <div style={{width: '100%', height: '100%', borderRadius: 38, overflow: 'hidden', background: LBG[i], border: `6px solid ${tm.accent}`, boxShadow: `0 0 70px ${tm.accent}99, 0 30px 80px rgba(0,0,0,.6)`, boxSizing: 'border-box'}}>
          <Img src={staticFile(tm.file)} style={{width: '100%', height: '100%', objectFit: FIT[i]}} />
          <div style={{position: 'absolute', top: 0, bottom: 0, width: 130, left: interpolate(lt, [0.55, 1.1], [-250, w + 150], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), transform: 'skewX(-18deg)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent)', borderRadius: 20}} />
        </div>
      </div>
      <div style={{position: 'absolute', top: 1235, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Words text={tm.name} t0={t0 + 0.6} size={150} max={980} />
        {tm.sub ? (
          <In t0={t0 + 1.05} dy={30} style={{marginTop: 12}}>
            <div style={{...B, fontWeight: 700, fontSize: 44, color: C.white, textAlign: 'center', maxWidth: 920, borderTop: `4px solid ${tm.accent}`, paddingTop: 12}}>{tm.sub}</div>
          </In>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

const Pips: React.FC = () => {
  const f = useCurrentFrame();
  const cur = Math.floor((f / FPS - T.scene.teams) / T.scene.teamLen);
  return (
    <div style={{position: 'absolute', top: 1735, width: '100%', display: 'flex', justifyContent: 'center', gap: 16}}>
      {T.teams.map((tm, i) => (
        <div key={i} style={{width: i === cur ? 64 : 22, height: 14, borderRadius: 9, background: i <= cur ? tm.accent : 'rgba(255,255,255,.25)', boxShadow: i === cur ? `0 0 18px ${tm.accent}` : 'none'}} />
      ))}
    </div>
  );
};

// ---------- 60-64s: semua pasukan ----------
const GridScene: React.FC = () => {
  const f = useCurrentFrame();
  const cell = 236, gap = 18;
  const rows = [3, 4, 3];
  let idx = 0;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 220, width: '100%', textAlign: 'center'}}>
        <In t0={K.gridHead} from={0.6}><div style={{...H, fontSize: 230, color: C.gold, textShadow: '0 6px 0 #7a4f00'}}>10 PASUKAN</div></In>
        <In t0={K.gridHead + 0.2} from={0.6}><div style={{...H, fontSize: 130, color: C.white}}>SATU PIALA</div></In>
      </div>
      <div style={{position: 'absolute', top: 690, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap}}>
        {rows.map((n, r) => (
          <div key={r} style={{display: 'flex', gap}}>
            {Array.from({length: n}, () => {
              const i = idx++;
              const tm = T.teams[i];
              const p = spring({frame: f - (K.gridStart + i * K.gridStep) * FPS, fps: FPS, config: {damping: 11, stiffness: 170, mass: 0.7}});
              return (
                <div key={i} style={{width: cell, height: cell, borderRadius: 28, overflow: 'hidden', background: LBG[i], border: `5px solid ${tm.accent}`, boxShadow: `0 0 28px ${tm.accent}88`, boxSizing: 'border-box', opacity: Math.min(1, p * 2), transform: `scale(${0.3 + 0.7 * p}) rotate(${(1 - p) * -14}deg)`}}>
                  <Img src={staticFile(tm.file)} style={{width: '100%', height: '100%', objectFit: FIT[i]}} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <In t0={K.gridStart + 1.9} dy={40} style={{position: 'absolute', top: 1500, width: '100%', textAlign: 'center'}}>
        <div style={{...B, fontWeight: 700, fontSize: 40, color: C.white}}>Kejohanan berlangsung</div>
        <div style={{...H, fontSize: 116, color: C.lime}}>4.11.26 – 9.12.26</div>
      </In>
    </AbsoluteFill>
  );
};

// ---------- 64-70s: penutup + penghargaan penaja ----------
const SPONSORS = [
  {file: 'logos/s1-tpx.jpg', bg: '#010715', fit: 'cover'},
  {file: 'logos/s2-yap.jpg', bg: '#010715', fit: 'cover'},
  {file: 'logos/s3-alliance.jpg', bg: '#fff', fit: 'contain'},
  {file: 'logos/s4-kospek.jpg', bg: '#fff', fit: 'contain'},
] as const;

const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const fade = interpolate(f, [(T.scene.end - 0.4) * FPS, T.scene.end * FPS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <In t0={K.cta} dy={-50} style={{position: 'absolute', top: 175, width: '100%', textAlign: 'center'}}>
        <div style={{...H, fontSize: 46, color: C.gold, letterSpacing: '0.22em'}}>MAJLIS PERASMIAN</div>
        <div style={{...H, fontSize: 215, color: C.lime, marginTop: 6, textShadow: '0 0 70px rgba(198,255,26,.45)'}}>JOM HADIR!</div>
      </In>
      <div style={{position: 'absolute', top: 540, left: 80, display: 'flex', flexDirection: 'column', gap: 20}}>
        <Card t0={K.ctaDate} label="RABU, 4 NOVEMBER 2026" value="8:30 MALAM" accent={C.blue} />
        <Card t0={K.ctaVenue} label="LOKASI" value="THE PICKLE EXCHANGE (TPX), KUANTAN" size={60} accent={C.red} />
      </div>
      <In t0={K.ctaSupport} dy={50} style={{position: 'absolute', top: 990, width: '100%', textAlign: 'center'}}>
        <div style={{...H, fontSize: 100, color: C.white}}>SOKONG PASUKAN</div>
        <div style={{...H, fontSize: 100, color: C.gold}}>PILIHAN ANDA</div>
      </In>
      <In t0={K.spons} dy={30} style={{position: 'absolute', top: 1235, width: '100%', textAlign: 'center'}}>
        <div style={{...H, fontSize: 38, color: '#9FB6FF', letterSpacing: '0.18em'}}>SETINGGI PENGHARGAAN KEPADA PENAJA BERSAMA</div>
      </In>
      <div style={{position: 'absolute', top: 1295, left: 70, width: 940, display: 'flex', flexWrap: 'wrap', gap: 20}}>
        {SPONSORS.map((sp, i) => {
          const p = spring({frame: f - (K.spons + 0.2 + i * 0.22) * FPS, fps: FPS, config: {damping: 13, stiffness: 150, mass: 0.7}});
          return (
            <div key={i} style={{width: 460, height: 210, borderRadius: 24, overflow: 'hidden', background: sp.bg, border: '3px solid rgba(255,255,255,.35)', boxSizing: 'border-box', opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 70}px) scale(${0.85 + 0.15 * p})`}}>
              <Img src={staticFile(sp.file)} style={{width: '100%', height: '100%', objectFit: sp.fit}} />
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{background: '#03061A', opacity: fade}} />
    </AbsoluteFill>
  );
};

const Hud: React.FC = () => (
  <div style={{position: 'absolute', top: 105, width: '100%', textAlign: 'center'}}>
    <span style={{...H, fontSize: 36, letterSpacing: '0.28em', color: C.gold, opacity: 0.9}}>PIALA DATUK BANDAR KUANTAN 2026</span>
  </div>
);

export const Preview: React.FC = () => {
  const S = T.scene;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Gate a={S.hook} b={S.end}><Bg /></Gate>
      <Gate a={0} b={S.hook}><OpenLogos /></Gate>
      <Gate a={S.hook} b={S.jab}><Hook /></Gate>
      <Gate a={S.jab} b={S.info}><Jab /></Gate>
      <Gate a={S.info} b={S.apa}><Info /></Gate>
      <Gate a={S.apa} b={S.teams}><Apa /></Gate>
      <Gate a={S.info} b={S.grid}><Hud /></Gate>
      {T.teams.map((_, i) => (
        <Gate key={i} a={S.teams + i * S.teamLen} b={S.teams + (i + 1) * S.teamLen}><TeamScene i={i} /></Gate>
      ))}
      <Gate a={S.teams} b={S.grid}><Pips /></Gate>
      <Gate a={S.grid} b={S.cta}><GridScene /></Gate>
      <Gate a={S.cta} b={S.end}><Cta /></Gate>
      {T.wipes.map((b) => {
        const ti = (b - S.teams) / S.teamLen;
        const color = b >= S.teams && b < S.grid ? T.teams[ti].accent : WIPE_COL[b] ?? C.blue;
        return <Wipe key={b} b={b} color={color} />;
      })}
      <Audio src={staticFile('soundtrack.wav')} />
    </AbsoluteFill>
  );
};
