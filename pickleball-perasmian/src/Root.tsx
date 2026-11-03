import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import T from './timing.json';

export const Root: React.FC = () => (
  <Composition id="Perasmian" component={Video} width={1080} height={1920} fps={T.fps}
    durationInFrames={Math.round(T.total * T.fps)} />
);
