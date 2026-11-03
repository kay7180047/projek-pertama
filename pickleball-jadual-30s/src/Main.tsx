import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, continueRender, delayRender, Easing} from 'remotion';
import {T, s2f, TOTAL} from './timing';
import {TEAMS, WEEKS, Day, Week} from './data';

const C = {ink: '#0A0824', deep: '#1A0B4D', lime: '#C8FF2B', cyan: '#1FE0FF', pink: '#FF3D8B', gold: '#FFC93C', white: '#FFFFFF'};
const DISPLAY = "'Bungee', Impact, sans-serif";
const TEXT = "'Barlow Condensed', 'Arial Narrow', sans-serif";
const logo = (k: string) => staticFile(`assets/logos/${k}.png`);

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const defs: [string, string, string][] = [
      ['Bungee', 'bungee-latin-400-normal.woff2', '400'],
      ['Barlow Condensed', 'barlow-condensed-latin-600-normal.woff2', '600'],
      ['Barlow Condensed', 'barlow-condensed-latin-800-normal.woff2', '800'],
    ];
    Promise.all(defs.map(([n, f, w]) => new FontFace(n, `url(${staticFile('fonts/' + f)})`, {weight: w}).load()))
      .then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(h); })
      .catch((e) => { console.error(e); continueRender(h); });
  }, [h]);
};

const pop = (f: number, start: number, damping = 11, stiffness = 190) =>
  f < start ? 0 : spring({frame: f - start, fps: 30, config: {damping, stiffness, mass: 0.7}});

const Ball: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <circle cx="50" cy="50" r="46" fill={C.lime} stroke={C.ink} strokeWidth="4" />
    {[[50,22],[28,36],[72,36],[22,60],[50,50],[78,60],[36,78],[64,78]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5.5" fill={C.ink} opacity=".85" />)}
    <path d="M14 38 Q30 18 52 14" stroke="#fff" strokeOpacity=".5" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

const Bg: React.FC<{tint: string}> = ({tint}) => {
  const f = useCurrentFrame();
  const balls = [[90, 520, 130, 0], [900, 760, 90, 2], [140, 1180, 100, 4], [930, 1480, 140, 1], [520, 1790, 80, 3]];
  return (
    <AbsoluteFill style={{background: `linear-gradient(165deg, ${C.ink} 0%, ${C.deep} 55%, ${C.ink} 100%)`, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: `radial-gradient(900px 700px at 85% 15%, ${tint}33, transparent 70%), radial-gradient(800px 700px at 10% 90%, ${C.pink}30, transparent 70%)`}} />
      <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(115deg, rgba(255,255,255,.04) 0 70px, transparent 70px 140px)', backgroundPosition: `${f * 2}px 0`}} />
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.10) 3px, transparent 3.6px)', backgroundSize: '38px 38px', backgroundPosition: `0 ${-f * 0.8}px`, WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 30%, #000 70%, transparent 100%)'}} />
      {balls.map(([x, y, s, o], i) => (
        <Ball key={i} size={s} style={{position: 'absolute', left: x - s / 2, top: y - s / 2 + Math.sin((f + o * 17) / 18) * 22, opacity: 0.22, transform: `rotate(${f * (i % 2 ? 1.2 : -1.2)}deg)`}} />
      ))}
    </AbsoluteFill>
  );
};

const Txt: React.FC<{children: React.ReactNode; size: number; color?: string; shadow?: string; style?: React.CSSProperties}> = ({children, size, color = C.white, shadow, style}) => (
  <div style={{fontFamily: DISPLAY, fontSize: size, lineHeight: 1, color, textAlign: 'center', textShadow: shadow ? `${size * 0.045}px ${size * 0.055}px 0 ${shadow}` : undefined, letterSpacing: 1, ...style}}>{children}</div>
);

const Pill: React.FC<{children: React.ReactNode; bg: string; fg?: string; size: number; style?: React.CSSProperties}> = ({children, bg, fg = C.ink, size, style}) => (
  <div style={{display: 'inline-block', background: bg, color: fg, fontFamily: DISPLAY, fontSize: size, padding: `${size * 0.22}px ${size * 0.5}px`, borderRadius: size, border: `4px solid ${C.ink}`, boxShadow: `6px 7px 0 ${C.ink}`, lineHeight: 1, ...style}}>{children}</div>
);

// ---------- HOOK ----------
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const a = pop(f, 0, 9, 230), b = pop(f, 6, 9, 230);
  const shrink = interpolate(f, [28, 42], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const top = interpolate(shrink, [0, 1], [560, 300]);
  const sc = interpolate(shrink, [0, 1], [1, 0.52]);
  const stamps: [string, string, string, number, number][] = [['11', 'PASUKAN', C.lime, 30, -3], ['6', 'MINGGU', C.cyan, 45, 3], ['1', 'PIALA', C.pink, 60, -2]];
  const push = 1 + f * 0.0008;
  return (
    <AbsoluteFill style={{transform: `scale(${push})`}}>
      <div style={{position: 'absolute', top: 160, width: '100%', opacity: pop(f, 32), transform: `translateY(${(1 - pop(f, 32)) * -30}px)`}}>
        <div style={{fontFamily: TEXT, fontWeight: 800, fontSize: 40, color: C.gold, textAlign: 'center', letterSpacing: 4}}>KEJOHANAN PICKLEBALL BERPASUKAN</div>
        <div style={{fontFamily: TEXT, fontWeight: 800, fontSize: 56, color: C.white, textAlign: 'center', letterSpacing: 2}}>PIALA DATUK BANDAR KUANTAN 2026</div>
      </div>
      <div style={{position: 'absolute', top, width: '100%', transformOrigin: '50% 0', transform: `scale(${sc})`}}>
        <Txt size={210} color={C.white} shadow={C.pink} style={{transform: `scale(${a}) rotate(-4deg)`, opacity: a > 0 ? 1 : 0}}>JADUAL</Txt>
        <Txt size={122} color={C.lime} shadow={C.ink} style={{marginTop: 14, transform: `scale(${b}) rotate(-4deg)`, opacity: b > 0 ? 1 : 0}}>DAH KELUAR!</Txt>
      </div>
      {stamps.map(([n, l, col, st, rot], i) => {
        const p = pop(f, st, 8, 260);
        return (
          <div key={i} style={{position: 'absolute', top: 560 + i * 285, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 28, opacity: p > 0 ? 1 : 0, transform: `scale(${0.4 + p * 0.6}) rotate(${rot * p}deg)`}}>
            <Txt size={260} color={col} shadow={C.ink}>{n}</Txt>
            <Txt size={104} color={C.white} shadow={C.ink}>{l}</Txt>
          </div>
        );
      })}
      <div style={{position: 'absolute', top: 1450, width: '100%', textAlign: 'center', opacity: pop(f, 74), transform: `scale(${0.6 + 0.4 * pop(f, 74)})`}}>
        <Pill bg={C.gold} size={46}>4 NOV – 9 DIS 2026</Pill>
      </div>
    </AbsoluteFill>
  );
};

// ---------- INFO (persoalan + penerangan) ----------
const Card: React.FC<{y: number; at: number; h: number; border: string; children: React.ReactNode}> = ({y, at, h, border, children}) => {
  const f = useCurrentFrame();
  const p = pop(f, at, 12, 200);
  return (
    <div style={{position: 'absolute', left: 80, width: 920, top: y, height: h, opacity: p > 0 ? 1 : 0, transform: `translateX(${(1 - p) * -700}px) rotate(${(1 - p) * -6}deg)`, background: 'rgba(14,10,52,.92)', border: `6px solid ${border}`, borderRadius: 34, boxShadow: `12px 14px 0 ${border}55`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}}>{children}</div>
  );
};
const Info: React.FC = () => {
  const f = useCurrentFrame();
  const t = pop(f, 0, 10, 220);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 230, width: '100%', transform: `scale(${t}) rotate(-3deg)`}}>
        <Txt size={112} color={C.white} shadow={C.pink}>BILA & DI MANA?</Txt>
      </div>
      <Card y={470} h={300} at={5} border={C.cyan}>
        <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
          <Pill bg={C.cyan} size={80}>RABU</Pill><Txt size={70} color={C.white}>&</Txt><Pill bg={C.pink} fg={C.white} size={80}>KHAMIS</Pill>
        </div>
        <div style={{fontFamily: TEXT, fontWeight: 800, fontSize: 52, color: C.gold, letterSpacing: 3}}>SETIAP MINGGU</div>
      </Card>
      <Card y={810} h={330} at={20} border={C.lime}>
        <Img src={logo('tpx')} style={{height: 96, borderRadius: 10}} />
        <Txt size={54} color={C.white}>THE PICKLE EXCHANGE</Txt>
        <div style={{fontFamily: TEXT, fontWeight: 800, fontSize: 52, color: C.lime, letterSpacing: 3}}>(TPX) · COURT 7 – 10</div>
      </Card>
      <Card y={1180} h={270} at={45} border={C.gold}>
        <Txt size={96} color={C.gold} shadow={C.ink}>9 · 10 · 11 MLM</Txt>
        <div style={{fontFamily: TEXT, fontWeight: 800, fontSize: 50, color: C.white, letterSpacing: 3}}>3 SLOT PERLAWANAN SEMALAM</div>
      </Card>
      <div style={{position: 'absolute', top: 1510, width: '100%', textAlign: 'center', opacity: pop(f, 58), transform: `scale(${0.7 + 0.3 * pop(f, 58)})`}}>
        <Pill bg={C.lime} size={38}>5 MINGGU LIGA ➜ MINGGU 6 KALAH SINGKIR</Pill>
      </div>
    </AbsoluteFill>
  );
};

// ---------- MINGGU ----------
const nameSize = (n: string) => (n.length <= 16 ? 40 : n.length <= 20 ? 35 : 26);
const TeamName: React.FC<{k: string; align: 'left' | 'right'}> = ({k, align}) => {
  const n = TEAMS[k];
  return <div style={{flex: 1, fontFamily: TEXT, fontWeight: 800, fontSize: nameSize(n), lineHeight: 0.92, color: C.white, textAlign: align, letterSpacing: 0.5, textTransform: 'uppercase'}}>{n}</div>;
};
const Row: React.FC<{l: string; r: string; hr: number; at: number; col: string; i: number}> = ({l, r, hr, at, col, i}) => {
  const f = useCurrentFrame();
  const p = pop(f, at, 14, 230);
  const dir = i % 2 ? 1 : -1;
  return (
    <div style={{height: 100, display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px', opacity: p > 0 ? 1 : 0, transform: `translateX(${(1 - p) * 360 * dir}px)`, background: i % 2 ? 'rgba(255,255,255,.05)' : 'transparent', borderTop: `2px solid ${col}33`}}>
      <Img src={logo(l)} style={{width: 78, height: 78}} />
      <TeamName k={l} align="left" />
      <div style={{width: 118, textAlign: 'center'}}>
        <div style={{fontFamily: DISPLAY, fontSize: 40, color: col, lineHeight: 1}}>VS</div>
        <div style={{fontFamily: TEXT, fontWeight: 800, fontSize: 25, color: C.gold, lineHeight: 1, marginTop: 4}}>{hr}.00 MLM</div>
      </div>
      <TeamName k={r} align="right" />
      <Img src={logo(r)} style={{width: 78, height: 78}} />
    </div>
  );
};
const DayBlock: React.FC<{day: Day; col: string; top: number; head: number; rows: number; dim: number}> = ({day, col, top, head, rows, dim}) => {
  const f = useCurrentFrame();
  const hp = pop(f, head, 11, 220);
  return (
    <div style={{position: 'absolute', left: 40, width: 1000, top, opacity: (hp > 0 ? 1 : 0) * dim, transform: `scale(${0.85 + 0.15 * hp})`, transformOrigin: '50% 0', border: `5px solid ${col}`, borderRadius: 30, overflow: 'hidden', background: 'rgba(12,9,46,.93)', boxShadow: `10px 12px 0 ${col}44`}}>
      <div style={{height: 88, background: col, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px'}}>
        <Txt size={52} color={col === C.cyan ? C.ink : C.white}>{day.name} · {day.date}</Txt>
        <div style={{fontFamily: TEXT, fontWeight: 800, fontSize: 32, color: col === C.cyan ? C.ink : C.white, letterSpacing: 2}}>TPX · {day.m.length} PERLAWANAN</div>
      </div>
      {day.m.map(([l, r, h], i) => <Row key={i} l={l} r={r} hr={h} at={rows + i * 3} col={col} i={i} />)}
    </div>
  );
};
const WeekScene: React.FC<{w: Week}> = ({w}) => {
  const f = useCurrentFrame();
  const tp = pop(f, 0, 9, 230);
  const dimRabu = interpolate(f, [78, 84], [1, 0.62], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) + interpolate(f, [128, 136], [0, 0.38], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 160, left: 50, right: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transform: `scale(${0.6 + 0.4 * tp})`, transformOrigin: '0 50%', opacity: tp > 0 ? 1 : 0}}>
        <Txt size={98} color={w.color} shadow={C.ink} style={{transform: "rotate(-3deg)", whiteSpace: "nowrap"}}>MINGGU {w.n}</Txt>
        <div>
          <Txt size={42} color={C.white} shadow={C.ink} style={{textAlign: "right", whiteSpace: "nowrap"}}>{w.range}</Txt>
          <div style={{display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16}}>
            {[1, 2, 3, 4, 5, 6].map((n) => <div key={n} style={{width: 26, height: 26, borderRadius: 13, background: n <= w.n ? w.color : 'transparent', border: `4px solid ${n <= w.n ? w.color : '#ffffff66'}`}} />)}
          </div>
        </div>
      </div>
      <DayBlock day={w.rabu} col={C.cyan} top={350} head={10} rows={16} dim={dimRabu} />
      <DayBlock day={w.khamis} col={C.pink} top={350 + 88 + 5 * 100 + 10 + 22} head={78} rows={86} dim={1} />
    </AbsoluteFill>
  );
};

// ---------- BRACKET ----------
const Slot: React.FC<{t: string; bg: string; fg?: string}> = ({t, bg, fg = C.ink}) => <Pill bg={bg} fg={fg} size={50} style={{minWidth: 250, textAlign: 'center'}}>{t}</Pill>;
const BCard: React.FC<{y: number; h: number; at: number; label: string; a: string; b: string; court: string; col: string; big?: boolean}> = ({y, h, at, label, a, b, court, col, big}) => {
  const f = useCurrentFrame();
  const p = pop(f, at, 12, 210);
  return (
    <div style={{position: 'absolute', left: 60, width: 960, top: y, height: h, opacity: p > 0 ? 1 : 0, transform: `scale(${0.7 + 0.3 * p}) rotate(${(1 - p) * 5}deg)`, background: big ? `linear-gradient(135deg, #3a1470, ${C.deep})` : 'rgba(14,10,52,.93)', border: `6px solid ${col}`, borderRadius: 34, boxShadow: `12px 14px 0 ${col}55${big ? `, 0 0 70px ${col}88` : ''}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16}}>
      <div style={{fontFamily: TEXT, fontWeight: 800, fontSize: big ? 56 : 46, color: col, letterSpacing: 4}}>{label}</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
        <Slot t={a} bg={C.cyan} /><Txt size={56} color={C.white}>VS</Txt><Slot t={b} bg={C.pink} fg={C.white} />
      </div>
      <div style={{fontFamily: TEXT, fontWeight: 800, fontSize: 38, color: C.white, letterSpacing: 3}}>COURT {court}</div>
    </div>
  );
};
const Trophy: React.FC = () => {
  const f = useCurrentFrame();
  const p = pop(f, 111 - 0, 7, 250);
  const flash = interpolate(f, [111, 114, 126], [0, 0.55, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <>
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <svg width="170" height="170" viewBox="0 0 100 100" style={{position: 'absolute', left: 455, top: 1210, opacity: p > 0 ? 1 : 0, transform: `scale(${p}) rotate(${(1 - p) * -20}deg)`, filter: `drop-shadow(0 0 24px ${C.gold})`}}>
        <path d="M28 14h44v22c0 16-10 26-22 26S28 52 28 36z" fill={C.gold} stroke={C.ink} strokeWidth="4" />
        <path d="M28 20H14c0 16 6 24 16 26M72 20h14c0 16-6 24-16 26" fill="none" stroke={C.gold} strokeWidth="6" />
        <rect x="44" y="62" width="12" height="14" fill={C.gold} stroke={C.ink} strokeWidth="3" />
        <rect x="30" y="76" width="40" height="12" rx="3" fill={C.pink} stroke={C.ink} strokeWidth="4" />
        <path d="M38 22q0 14 6 22" stroke="#fff" strokeOpacity=".7" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    </>
  );
};
const Bracket: React.FC = () => {
  const f = useCurrentFrame();
  const t = pop(f, 0, 9, 230);
  const arrow = (y: number, at: number) => <div style={{position: 'absolute', top: y, width: '100%', textAlign: 'center', fontFamily: DISPLAY, fontSize: 56, color: C.gold, opacity: pop(f, at), lineHeight: 1}}>▼</div>;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 160, width: '100%', transform: `scale(${0.6 + 0.4 * t}) rotate(-3deg)`, opacity: t > 0 ? 1 : 0}}>
        <Txt size={128} color={C.gold} shadow={C.ink}>MINGGU 6</Txt>
        <Txt size={50} color={C.white} shadow={C.pink} style={{marginTop: 14}}>KALAH SINGKIR · RABU 9 DIS</Txt>
      </div>
      <BCard y={450} h={215} at={6} label="SEPARUH AKHIR 1" a="NO. 1" b="NO. 4" court="7 & 8" col={C.cyan} />
      <BCard y={690} h={215} at={33} label="SEPARUH AKHIR 2" a="NO. 2" b="NO. 3" court="9 & 10" col={C.cyan} />
      {arrow(910, 56)}
      <BCard y={975} h={200} at={60} label="TEMPAT KE-3 / KE-4" a="KALAH 1" b="KALAH 2" court="7 & 8" col={C.pink} />
      <BCard y={1400} h={270} at={90} label="PERLAWANAN AKHIR" a="MENANG 1" b="MENANG 2" court="9 & 10" col={C.gold} big />
      <Trophy />
    </AbsoluteFill>
  );
};

// ---------- CTA ----------
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const a = pop(f, 1, 9, 230), b = pop(f, 7, 9, 230);
  const sp = ['tpx', 'yap', 'kospek', 'alliance'];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 250, width: '100%'}}>
        <Txt size={150} color={C.white} shadow={C.pink} style={{transform: `scale(${a}) rotate(-4deg)`, opacity: a > 0 ? 1 : 0}}>JOM</Txt>
        <Txt size={124} color={C.lime} shadow={C.ink} style={{marginTop: 10, transform: `scale(${a}) rotate(-4deg)`, opacity: a > 0 ? 1 : 0}}>SOKONG</Txt>
        <Txt size={96} color={C.white} shadow={C.cyan} style={{marginTop: 16, transform: `scale(${b}) rotate(-4deg)`, opacity: b > 0 ? 1 : 0}}>PASUKAN ANDA!</Txt>
      </div>
      <div style={{position: 'absolute', top: 830, width: '100%', textAlign: 'center', opacity: pop(f, 14), transform: `scale(${0.7 + 0.3 * pop(f, 14)})`}}>
        <Pill bg={C.gold} size={44}>4 NOV – 9 DIS 2026</Pill>
        <div style={{fontFamily: TEXT, fontWeight: 800, fontSize: 48, color: C.white, marginTop: 30, letterSpacing: 3}}>THE PICKLE EXCHANGE (TPX)</div>
      </div>
      <div style={{position: 'absolute', top: 1130, width: '100%', textAlign: 'center', fontFamily: TEXT, fontWeight: 800, fontSize: 38, color: C.gold, letterSpacing: 8, opacity: pop(f, 18)}}>PENAJA BERSAMA</div>
      <div style={{position: 'absolute', top: 1190, left: 60, width: 960, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 28}}>
        {['mbk_hq', 'kesumba_hq', 'biro_hq'].map((k, i) => <Img key={k} src={logo(k)} style={{height: 170, borderRadius: 18, border: '4px solid #fff', boxShadow: `6px 8px 0 ${C.ink}`, opacity: pop(f, 20 + i * 3), transform: `scale(${0.6 + 0.4 * pop(f, 20 + i * 3)}) rotate(${(i - 1) * 2}deg)`}} />)}
      </div>
      <div style={{position: 'absolute', top: 1420, left: 80, width: 920, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, justifyItems: 'center', alignItems: 'center'}}>
        {sp.map((k, i) => <Img key={k} src={logo(k)} style={{height: 78, borderRadius: 10, border: '3px solid #ffffff44', opacity: pop(f, 30 + i * 2), transform: `scale(${0.6 + 0.4 * pop(f, 30 + i * 2)})`}} />)}
      </div>
    </AbsoluteFill>
  );
};

// ---------- WIPE ----------
const Wipe: React.FC<{col: string}> = ({col}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 14], [0, 1], {easing: Easing.inOut(Easing.cubic)});
  const left = interpolate(p, [0, 1], [1300, -2100]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: -200, height: 2400, width: 1900, left: left + 160, background: C.ink, transform: 'skewX(-12deg)'}} />
      <div style={{position: 'absolute', top: -200, height: 2400, width: 1900, left, background: col, transform: 'skewX(-12deg)'}} />
    </AbsoluteFill>
  );
};

export const Main: React.FC = () => {
  useFonts();
  const bounds = [T.info, T.week[0], T.week[1], T.week[2], T.week[3], T.week[4], T.bracket, T.cta];
  const wcols = [C.lime, C.pink, C.cyan, C.gold, C.lime, C.pink, C.cyan, C.gold];
  const tints = [C.lime, C.cyan, ...WEEKS.map((w) => w.color), C.gold, C.pink];
  const scenes: [number, number, React.ReactNode][] = [
    [T.hook, T.info, <Hook />], [T.info, T.week[0], <Info />],
    ...WEEKS.map((w, i): [number, number, React.ReactNode] => [T.week[i], i < 4 ? T.week[i + 1] : T.bracket, <WeekScene w={w} />]),
    [T.bracket, T.cta, <Bracket />], [T.cta, T.end, <Cta />],
  ];
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Audio src={staticFile('audio/soundtrack.wav')} />
      {scenes.map(([a, b, el], i) => (
        <Sequence key={i} from={s2f(a)} durationInFrames={s2f(b) - s2f(a)}>
          <Bg tint={tints[i]} />
          {el}
        </Sequence>
      ))}
      <Img src={logo('mbk_hq')} style={{position: 'absolute', left: 40, top: 36, height: 104, borderRadius: 16, border: '3px solid #ffffff'}} />
      <Img src={logo('kesumba_hq')} style={{position: 'absolute', right: 40, top: 36, height: 104, borderRadius: 16, border: '3px solid #ffffff'}} />
      {bounds.map((b, i) => (
        <Sequence key={i} from={s2f(b) - 7} durationInFrames={14}><Wipe col={wcols[i]} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
