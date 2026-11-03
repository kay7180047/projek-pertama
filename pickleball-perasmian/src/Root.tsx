import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import T from './timing.json';

export const Root: React.FC = () => (
  <>
  <Composition id="Perasmian" component={Video} width={1080} height={1920} fps={T.fps}
    durationInFrames={Math.round(T.total * T.fps)} defaultProps={{tiktok: false}} />
  <Composition id="PerasmianTikTok" component={Video} width={1080} height={1920} fps={T.fps}
    durationInFrames={Math.round(T.total * T.fps)} defaultProps={{tiktok: true}} />
  </>
);
