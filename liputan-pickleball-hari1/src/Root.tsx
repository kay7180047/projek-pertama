import React from 'react';
import {Composition} from 'remotion';
import {Reel, FPS, BAR, N} from './Reel';
import {CleanReel, CLEAN_DUR, INTRO, END_HOLD} from './CleanReel';
import b1 from './selection-b1.json';
import b2 from './selection-b2.json';
import b3 from './selection-b3.json';

export const Root: React.FC = () => (
  <>
    {[1, 2, 3].map((p) => (
      <Composition
        key={p}
        id={`Bahagian${p}`}
        component={Reel}
        durationInFrames={BAR * N}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{part: p}}
      />
    ))}
    <Composition id="Bahagian1Bersih" component={CleanReel} durationInFrames={INTRO + CLEAN_DUR * b1.length + END_HOLD} fps={FPS} width={1080} height={1920} defaultProps={{items: b1 as any}} />
    <Composition id="Bahagian2Bersih" component={CleanReel} durationInFrames={INTRO + CLEAN_DUR * b2.length + END_HOLD} fps={FPS} width={1080} height={1920} defaultProps={{items: b2 as any}} />
    <Composition id="Bahagian3Bersih" component={CleanReel} durationInFrames={INTRO + CLEAN_DUR * b3.length + END_HOLD} fps={FPS} width={1080} height={1920} defaultProps={{items: b3 as any}} />
  </>
);
