import React from 'react';
import {AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Slide, Item, LIME, NAVY, FONT} from './Reel';

// Versi bersih: gambar terpilih + tajuk atas. Tiada muzik, label, kaunter atau kad.
// Intro: logo MBK Pickle Flux berpusing (3D) pada latar hitam, kemudian pudar ke gambar pertama.
export const CLEAN_DUR = 90; // 3s setiap gambar
// Tepi bawah tajuk = 2/16 daripada ketinggian video (1920 x 2/16 = 240px dari dasar)
export const TITLE_BOTTOM = (1920 * 2) / 16;
export const VID_DUR = 120; // selitan video 4s
export const LOGO_HOLD = 54; // logo penuh sehingga frame ini
export const LOGO_FADE = 12; // pudar ke gambar pertama
export const INTRO = LOGO_HOLD; // gambar pertama bermula di sini (di bawah penutup logo)
export const END_FADE = 10; // pudar ke kad penutup (bertindih dengan gambar terakhir)
export const END_HOLD = 75; // kad penutup logo, 2.5s

const LogoCover: React.FC = () => {
  const f = useCurrentFrame();
  const spin = Easing.out(Easing.cubic)(Math.min(1, f / 46));
  const rot = 540 * (1 - spin); // 1.5 pusingan, berhenti menghadap depan
  const sc = 0.55 + 0.45 * Easing.out(Easing.cubic)(Math.min(1, f / 40)) + (f > 46 ? 0.02 * Math.sin((f - 46) / 3) * Math.max(0, 1 - (f - 46) / 14) : 0);
  const appear = Math.min(1, f / 6);
  const cover = interpolate(f, [LOGO_HOLD, LOGO_HOLD + LOGO_FADE], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const exit = interpolate(f, [LOGO_HOLD, LOGO_HOLD + LOGO_FADE], [1, 1.18], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (cover <= 0) return null;
  return (
    <AbsoluteFill style={{background: '#000', opacity: cover, isolation: 'isolate', perspective: 1600, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', width: 1100, height: 1100, borderRadius: 550, background: 'radial-gradient(circle, rgba(215,242,58,0.20) 0%, rgba(215,242,58,0) 65%)', opacity: appear * Math.min(1, spin + 0.2)}} />
      <Img
        src={staticFile('logo/mbk-pickle-flux.jpg')}
        style={{width: 960, height: 960, mixBlendMode: 'screen', opacity: appear, transform: `scale(${sc * exit}) rotateY(${rot}deg)`}}
      />
    </AbsoluteFill>
  );
};

export type Interlude = {kind: 'wide'; clip: string} | {kind: 'stack'; top: string; bottom: string};
export type Entry = Item | Interlude;
const isInterlude = (e: Entry): e is Interlude => (e as Interlude).kind !== undefined;
export const durOf = (e: Entry) => (isInterlude(e) ? VID_DUR : CLEAN_DUR);
export const totalOf = (items: Entry[]) => items.reduce((a, e) => a + durOf(e), 0);

const Flash: React.FC<{peak?: number}> = ({peak = 0.6}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{background: 'white', opacity: interpolate(f, [0, 6], [peak, 0], {extrapolateRight: 'clamp'}), pointerEvents: 'none'}} />;
};

// Klip kamera landskap 16:9: dipaparkan dalam jalur lebar penuh (tiada pemotongan), latar = klip sama dikaburkan.
const BlurBg: React.FC<{clip: string}> = ({clip}) => (
  <OffthreadVideo src={staticFile(`clips/${clip}.mp4`)} muted style={{position: 'absolute', left: -240, top: -60, width: 1560, height: 2040, objectFit: 'cover', filter: 'blur(40px) brightness(0.5) saturate(1.3)'}} />
);

const WideSlide: React.FC<{clip: string}> = ({clip}) => {
  const f = useCurrentFrame();
  const t = Easing.out(Easing.cubic)(Math.min(1, f / 14));
  const z = interpolate(f, [0, VID_DUR], [1, 1.05]);
  return (
    <AbsoluteFill style={{background: NAVY, overflow: 'hidden'}}>
      <BlurBg clip={clip} />
      <div style={{position: 'absolute', left: 0, top: 656, width: 1080, height: 608, overflow: 'hidden', transform: `scale(${(0.92 + 0.08 * t) * z})`, opacity: t, boxShadow: '0 30px 90px rgba(0,0,0,0.6)'}}>
        <OffthreadVideo src={staticFile(`clips/${clip}.mp4`)} muted style={{width: 1080, height: 608}} />
      </div>
      <div style={{position: 'absolute', left: 0, top: 650, width: 1080 * t, height: 4, background: LIME}} />
      <div style={{position: 'absolute', right: 0, top: 1264, width: 1080 * t, height: 4, background: LIME}} />
      <Flash />
    </AbsoluteFill>
  );
};

const StackSlide: React.FC<{top: string; bottom: string}> = ({top, bottom}) => {
  const f = useCurrentFrame();
  const t = Easing.out(Easing.cubic)(Math.min(1, f / 16));
  const t2 = Easing.out(Easing.cubic)(Math.min(1, Math.max(0, (f - 8) / 16)));
  const box = (clip: string, y: number, dx: number, p: number) => (
    <div style={{position: 'absolute', left: 0, top: y, width: 1080, height: 608, overflow: 'hidden', transform: `translateX(${(1 - p) * dx}px)`, boxShadow: '0 20px 70px rgba(0,0,0,0.55)'}}>
      <OffthreadVideo src={staticFile(`clips/${clip}.mp4`)} muted style={{width: 1080, height: 608}} />
    </div>
  );
  return (
    <AbsoluteFill style={{background: NAVY, overflow: 'hidden'}}>
      <BlurBg clip={top} />
      <AbsoluteFill style={{background: 'rgba(4,10,35,0.35)'}} />
      {box(top, 290, -1080, t)}
      {box(bottom, 942, 1080, t2)}
      <div style={{position: 'absolute', left: 0, top: 898, width: 1080 * t, height: 4, background: LIME}} />
      <div style={{position: 'absolute', right: 0, top: 1550, width: 1080 * t2, height: 4, background: LIME}} />
      <Flash peak={0.5} />
    </AbsoluteFill>
  );
};

const BG_END = '#F7F7F7';
const EndCard: React.FC = () => {
  const f = useCurrentFrame(); // 0 = mula pudar ke putih
  const bg = interpolate(f, [0, END_FADE], [0, 1], {extrapolateRight: 'clamp'});
  const pop = (d: number) => {
    const t = Math.min(1, Math.max(0, (f - END_FADE - d) / 16));
    return {opacity: t, transform: `translateY(${(1 - Easing.out(Easing.cubic)(t)) * 40}px) scale(${0.94 + 0.06 * Easing.out(Easing.cubic)(t)})`};
  };
  const line = Math.min(1, Math.max(0, (f - END_FADE - 8) / 14));
  return (
    <AbsoluteFill style={{background: BG_END, opacity: bg, isolation: 'isolate', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 0}}>
      <div style={{width: 470, display: 'flex', justifyContent: 'center', mixBlendMode: 'multiply', ...pop(0)}}>
        <Img src={staticFile('logo/kesumba-putih.png')} style={{width: 440, height: 440 * 516 / 484}} />
      </div>
      <div style={{width: 3, height: 560 * line, background: 'rgba(7,20,58,0.18)', borderRadius: 2}} />
      <div style={{width: 470, display: 'flex', justifyContent: 'center', mixBlendMode: 'multiply', ...pop(6)}}>
        <Img src={staticFile('logo/mbk-kuantan.jpg')} style={{width: 440, height: 440 * 842 / 595}} />
      </div>
    </AbsoluteFill>
  );
};

export const CleanReel: React.FC<{items: Entry[]}> = ({items}) => {
  const f = useCurrentFrame();
  const endStart = INTRO + totalOf(items) - END_FADE;
  let off = 0;
  let pk = 0;
  const titleIn = interpolate(f, [LOGO_HOLD, LOGO_HOLD + LOGO_FADE], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * interpolate(f, [endStart, endStart + END_FADE], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: NAVY, fontFamily: FONT, color: 'white'}}>
      {items.map((it, k) => {
        const from = INTRO + off;
        const d = durOf(it);
        off += d;
        let body: React.ReactNode;
        if (isInterlude(it)) body = it.kind === 'wide' ? <WideSlide clip={it.clip} /> : <StackSlide top={it.top} bottom={it.bottom} />;
        else body = <Slide it={it} k={pk++} dur={d} photoDir="photos-hd" />;
        return (
          <Sequence key={k} from={from} durationInFrames={d} name={isInterlude(it) ? `Video ${k + 1}` : `${k + 1} ${(it as Item).src}`}>
            {body}
          </Sequence>
        );
      })}
      <div style={{opacity: titleIn}}>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 560, background: 'linear-gradient(rgba(4,10,35,0), rgba(4,10,35,0.85))'}} />
        <div style={{position: 'absolute', left: 56, bottom: TITLE_BOTTOM, display: 'flex', alignItems: 'center', gap: 20}}>
          <div style={{width: 34, height: 34, borderRadius: 17, background: LIME, boxShadow: '0 0 0 6px rgba(215,242,58,0.25)'}} />
          <div>
            <div style={{fontSize: 33, fontWeight: 800, letterSpacing: 2.5, lineHeight: 1.1}}>KEJOHANAN PICKLEBALL BERPASUKAN</div>
            <div style={{fontSize: 25, fontWeight: 600, letterSpacing: 2, opacity: 0.82, marginTop: 6}}>PIALA DATUK BANDAR KUANTAN 2026</div>
          </div>
        </div>
      </div>
      <Sequence from={endStart} durationInFrames={END_FADE + END_HOLD} name="Kad penutup">
        <EndCard />
      </Sequence>
      <LogoCover />
    </AbsoluteFill>
  );
};
