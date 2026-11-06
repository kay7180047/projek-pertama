import React from 'react';
import {Composition} from 'remotion';
import {Reel, FPS, BAR, N} from './Reel';
import {CleanReel, CLEAN_DUR, CLEAN_N} from './CleanReel';

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
    <Composition id="Bahagian1Bersih" component={CleanReel} durationInFrames={CLEAN_DUR * CLEAN_N} fps={FPS} width={1080} height={1920} />
  </>
);
