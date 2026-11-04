import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import TL from './timeline.json';
export const Root: React.FC = () => (
  <Composition id="Pickleball" component={Video} durationInFrames={TL.total * TL.fps} fps={TL.fps} width={1080} height={1920} />
);
