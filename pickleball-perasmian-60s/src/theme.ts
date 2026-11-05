import {Easing, interpolate, spring} from 'remotion';
import T from './timeline.json';

export const C = {
  navy: '#1E3480',      // biru logo Majlis / KESUMBA (lebih gelap utk latar)
  navyDeep: '#121F55',
  blue: '#263F94',      // biru logo
  teal: '#33C1CE',      // teal logo
  red: '#E6212B',       // merah KESUMBA
  ball: '#F7B32B',      // kuning-oren bola pickleball (poster)
  ballDark: '#C9820B',
  white: '#FFFFFF',
  ice: '#EAF4FA',
};
export const FONT = "'Inter', 'Inter Display', sans-serif";
export const beat = (k: string) => (T.beats as Record<string, number>)[k];
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

// Slam: masuk besar -> mendarat (punch-in), digunakan utk point penting
export const slam = (frame: number, at: number, dur = 9) => {
  const p = interpolate(frame - at, [0, dur], [0, 1], {...clamp, easing: easeOut});
  return {scale: 1.55 - 0.55 * p, opacity: interpolate(frame - at, [0, 3], [0, 1], clamp)};
};
// Pop: spring kecil
export const pop = (frame: number, fps: number, at: number) => {
  const s = spring({frame: frame - at, fps, config: {damping: 13, stiffness: 190, mass: 0.7}});
  return {scale: 0.6 + 0.4 * s, opacity: interpolate(frame - at, [0, 4], [0, 1], clamp)};
};
export const rise = (frame: number, at: number, dist = 40, dur = 14) => {
  const p = interpolate(frame - at, [0, dur], [0, 1], {...clamp, easing: easeOut});
  return {y: (1 - p) * dist, opacity: interpolate(frame - at, [0, 6], [0, 1], clamp)};
};

// Frame mutlak (bukan relatif kepada Sequence) supaya beat dalam timeline.json terus guna.
import React from 'react';
import {useCurrentFrame} from 'remotion';
export const SceneStart = React.createContext(0);
export const useF = () => useCurrentFrame() + React.useContext(SceneStart);
