import React from 'react';
import {Composition} from 'remotion';
import manifest from '../manifest.json';
import {MusterDemo, type Manifest} from './MusterDemo';

export const MusterVideoRoot: React.FC = () => (
  <Composition
    id="MusterDemo"
    component={MusterDemo}
    durationInFrames={manifest.project.durationSeconds * manifest.project.fps}
    fps={manifest.project.fps}
    width={manifest.project.width}
    height={manifest.project.height}
    defaultProps={{manifest: manifest as Manifest}}
  />
);
