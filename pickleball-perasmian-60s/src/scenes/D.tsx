import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Ball, Bg, Card, H, P} from '../components';
import {C, useF, beat, clamp, easeInOut, pop, rise} from '../theme';

const rows = [
  {k: 'D.r1', t: 'BERPASUKAN', s: 'Antara agensi', icon: 'team'},
  {k: 'D.r2', t: '5 ACARA', s: 'Bagi setiap pasukan', icon: 'five'},
  {k: 'D.r3', t: 'RABU & KHAMIS', s: 'Hari pertandingan', icon: 'cal'},
  {k: 'D.r4', t: '4 NOV – 16 DIS 2026', s: 'Tarikh kejohanan', icon: 'range'},
];

const Icon: React.FC<{k: string}> = ({k}) => {
  const s = {stroke: '#fff', strokeWidth: 6, fill: 'none', strokeLinecap: 'round'} as const;
  return (
    <svg width={80} height={80} viewBox="0 0 80 80">
      {k === 'team' && (<g {...s}><circle cx="28" cy="28" r="10" /><circle cx="54" cy="30" r="8" /><path d="M10 64c0-12 8-20 18-20s18 8 18 20M46 48c10-4 22 2 24 16" /></g>)}
      {k === 'five' && (<text x="40" y="60" textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={64} fill="#fff">5</text>)}
      {k === 'cal' && (<g {...s}><rect x="10" y="16" width="60" height="54" rx="8" /><path d="M10 34h60M26 8v14M54 8v14" /></g>)}
      {k === 'range' && (<g {...s}><circle cx="14" cy="40" r="7" /><circle cx="66" cy="40" r="7" /><path d="M24 40h32" /></g>)}
    </svg>
  );
};

// hari Rabu & Khamis, 4 Nov – 16 Dis 2026 (16 Dis = Rabu terakhir)
const weeks = ['4 NOV', '11', '18', '25', '2 DIS', '9', '16 DIS'];

export const SceneD: React.FC = () => {
  const f = useF();
  const {fps} = useVideoConfig();
  const head = rise(f, beat('D.head'), 30);
  const active = rows.reduce((a, r, i) => (f >= beat(r.k) ? i : a), -1);
  const lit = interpolate(f, [beat('D.r3'), beat('D.r3') + 70], [0, 13], clamp); // bilangan titik menyala
  const bar = interpolate(f, [beat('D.r4'), beat('D.r4') + 50], [0, 1], {...clamp, easing: easeInOut});
  return (
    <AbsoluteFill>
      <Bg scene="D" />
      <div style={{position: 'absolute', left: 70, top: 200, opacity: head.opacity, transform: `translateY(${head.y}px)`}}>
        <P size={44} color={C.teal} weight={800} style={{letterSpacing: 5}}>APA YANG PERLU ANDA TAHU</P>
      </div>
      {rows.map((r, i) => {
        const p = pop(f, fps, beat(r.k));
        const isActive = i === active;
        const op = f < beat(r.k) ? 0 : isActive ? 1 : 0.5;
        return (
          <div key={r.k} style={{position: 'absolute', left: 60, right: 60, top: 300 + i * 220, height: 190, opacity: op * p.opacity, transform: `scale(${isActive ? p.scale : 0.97})`, transformOrigin: '0 50%'}}>
            <div style={{height: '100%', borderRadius: 36, background: isActive ? '#F7F8FA' : 'rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', gap: 32, padding: '0 36px', boxShadow: isActive ? '0 14px 40px rgba(5,10,40,.45)' : 'none', borderLeft: `16px solid ${isActive ? C.red : C.teal}`}}>
              <div style={{width: 104, height: 104, borderRadius: 52, background: isActive ? C.blue : C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}><Icon k={r.icon} /></div>
              <div>
                <H size={r.t.length > 14 ? 56 : 74} color={isActive ? C.blue : '#fff'} style={{whiteSpace: 'nowrap'}}>{r.t}</H>
                <P size={36} color={isActive ? '#4A5680' : C.ice} weight={700} style={{marginTop: 10}}>{r.s}</P>
              </div>
            </div>
          </div>
        );
      })}
      {/* garis masa Rabu & Khamis */}
      <div style={{position: 'absolute', left: 60, right: 60, top: 1215, height: 300, opacity: interpolate(f, [beat('D.r3') - 6, beat('D.r3') + 6], [0, 1], clamp)}}>
        <div style={{display: 'flex', justifyContent: 'space-between', padding: '0 10px'}}>
          {weeks.map((w, wi) => (
            <div key={w} style={{width: 124, textAlign: 'center'}}>
              <div style={{display: 'flex', gap: 14, justifyContent: 'center', height: 56}}>
                {[0, 1].map((d) => {
                  const idx = wi * 2 + d;
                  if (wi === 6 && d === 1) return <div key={d} style={{width: 44}} />;
                  const on = lit > idx;
                  const ptop = Math.min(1, Math.max(0, lit - idx));
                  return <div key={d} style={{width: 44, height: 44, borderRadius: 22, background: on ? C.teal : 'rgba(255,255,255,.18)', transform: `scale(${0.7 + 0.3 * ptop})`, border: on ? `4px solid #fff` : 'none'}} />;
                })}
              </div>
              <P size={30} color="#fff" weight={800} style={{marginTop: 14}}>{w}</P>
            </div>
          ))}
        </div>
        <div style={{position: 'relative', height: 18, margin: '26px 70px 0', background: 'rgba(255,255,255,.16)', borderRadius: 9}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${bar * 100}%`, background: C.red, borderRadius: 9}} />
          <div style={{position: 'absolute', left: `${bar * 100}%`, top: -22, transform: 'translateX(-50%)', opacity: bar > 0 ? 1 : 0}}><Ball size={60} spin={f * 14} /></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
