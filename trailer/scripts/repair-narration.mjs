import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const trailerDir = path.resolve(scriptDir, '..');
const raw = path.join(trailerDir, 'public', 'audio', 'narration-raw.wav');
const output = path.join(trailerDir, 'public', 'audio', 'narration.wav');

// The realtime recording contains one unwanted spoken preamble from 0–5.65s.
// The nine approved paragraphs below are trimmed from the raw take and placed at
// their matching scene starts. This preserves the natural delivery without the
// long synthetic gaps that were present in the first edit.
const clips = [
  {from: 5.65, to: 10.441, at: 0.15},
  {from: 10.965, to: 16.905, at: 6.2},
  {from: 18.004, to: 28.299, at: 13.25},
  {from: 28.812, to: 39.001, at: 24.2},
  {from: 40.014, to: 47.003, at: 35.2},
  {from: 47.972, to: 52.536, at: 43.2},
  {from: 53.038, to: 62.877, at: 49.2},
  {from: 63.307, to: 71.358, at: 60.2},
  {from: 71.826, to: 75.4, at: 69.2},
];

const filters = clips.map((clip, index) =>
  `[0:a]atrim=start=${clip.from}:end=${clip.to},asetpts=PTS-STARTPTS,adelay=${Math.round(clip.at * 1000)}:all=1[a${index}]`,
);
const inputs = clips.map((_, index) => `[a${index}]`).join('');
filters.push(`${inputs}amix=inputs=${clips.length}:duration=longest:normalize=0,apad=pad_dur=75,atrim=0:75,loudnorm=I=-16:TP=-1.5:LRA=11[out]`);

const result = spawnSync('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y', '-i', raw,
  '-filter_complex', filters.join(';'), '-map', '[out]', '-ar', '48000', '-ac', '1', output,
], {stdio: 'inherit'});

if (result.status !== 0) process.exit(result.status ?? 1);
process.stdout.write(`Wrote corrected narration: ${output}\n`);
process.stdout.write('Removed the accidental 0–5.65s meta-preamble and aligned nine approved paragraphs to the 75s cut.\n');
