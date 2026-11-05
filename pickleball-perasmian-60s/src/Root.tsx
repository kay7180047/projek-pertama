import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, staticFile} from 'remotion';
import T from './timeline.json';
import {Wipes} from './components';
import {SceneStart} from './theme';
import {SceneA} from './scenes/A';
import {SceneB} from './scenes/B';
import {SceneC} from './scenes/C';
import {SceneD} from './scenes/D';
import {SceneE} from './scenes/E';
import {SceneF} from './scenes/F';
import {SceneG} from './scenes/G';

const map: Record<string, React.FC> = {A: SceneA, B: SceneB, C: SceneC, D: SceneD, E: SceneE, F: SceneF, G: SceneG};

const Video: React.FC = () => (
  <AbsoluteFill style={{background: '#121F55'}}>
    {Object.entries(T.scenes).map(([k, [from, to]]) => {
      const S = map[k];
      return (
        <Sequence key={k} from={from} durationInFrames={to - from} name={`Babak ${k}`}>
          <SceneStart.Provider value={from}><S /></SceneStart.Provider>
        </Sequence>
      );
    })}
    <Wipes />
    <Audio src={staticFile('audio/soundtrack.wav')} />
  </AbsoluteFill>
);

export const Root: React.FC = () => (
  <Composition id="Perasmian" component={Video} durationInFrames={T.duration} fps={T.fps} width={T.width} height={T.height} />
);
