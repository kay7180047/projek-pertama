import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Slide, Item, LIME, NAVY, FONT} from './Reel';
import selection from './selection-b1.json';

// Versi bersih Bahagian 1: gambar terpilih sahaja + tajuk atas. Tiada muzik, label, kaunter atau kad.
export const CLEAN_DUR = 90; // 3s setiap gambar
export const CLEAN_N = (selection as Item[]).length;

export const CleanReel: React.FC = () => {
  const items = selection as Item[];
  return (
    <AbsoluteFill style={{background: NAVY, fontFamily: FONT, color: 'white'}}>
      {items.map((it, k) => (
        <Sequence key={it.src} from={k * CLEAN_DUR} durationInFrames={CLEAN_DUR} name={`${k + 1} ${it.src}`}>
          <Slide it={it} k={k} dur={CLEAN_DUR} />
        </Sequence>
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 300, background: 'linear-gradient(rgba(4,10,35,0.85), rgba(4,10,35,0))'}} />
      <div style={{position: 'absolute', left: 56, top: 84, display: 'flex', alignItems: 'center', gap: 20}}>
        <div style={{width: 34, height: 34, borderRadius: 17, background: LIME, boxShadow: '0 0 0 6px rgba(215,242,58,0.25)'}} />
        <div>
          <div style={{fontSize: 33, fontWeight: 800, letterSpacing: 2.5, lineHeight: 1.1}}>KEJOHANAN PICKLEBALL BERPASUKAN</div>
          <div style={{fontSize: 25, fontWeight: 600, letterSpacing: 2, opacity: 0.82, marginTop: 6}}>PIALA DATUK BANDAR KUANTAN 2026</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
