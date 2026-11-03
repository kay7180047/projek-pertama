import React from 'react';
import {Composition} from 'remotion';
import {Ad} from './Ad';
import T from './timing.json';

export const Root: React.FC = () => (
  <Composition id="Iklan" component={Ad} width={1920} height={1080} fps={T.fps} durationInFrames={T.duration} />
);
