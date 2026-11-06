import React from 'react';
import {Composition} from 'remotion';
import {Reel, FPS, BAR, N} from './Reel';

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
  </>
);
