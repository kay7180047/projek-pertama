import React from 'react';
import {Composition} from 'remotion';
import {Preview} from './Preview';
import T from './timing.json';

export const Root: React.FC = () => (
  <Composition id="Preview" component={Preview} durationInFrames={T.duration} fps={T.fps} width={1080} height={1920} />
);
