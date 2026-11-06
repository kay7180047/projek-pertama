import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './Reel';
import {CleanReel, INTRO, END_HOLD, totalOf} from './CleanReel';
import b1 from './selection-b1.json';
import b2 from './selection-b2.json';
import b3 from './selection-b3.json';

const sets = [b1, b2, b3];

export const Root: React.FC = () => (
  <>
    {sets.map((items, i) => (
      <Composition
        key={i}
        id={`Bahagian${i + 1}Bersih`}
        component={CleanReel}
        durationInFrames={INTRO + totalOf(items as any) + END_HOLD}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{items: items as any}}
      />
    ))}
  </>
);
