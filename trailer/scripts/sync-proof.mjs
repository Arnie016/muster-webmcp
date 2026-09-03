import {copyFile, mkdir, readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const trailerDir = path.resolve(scriptDir, '..');
const repoDir = path.resolve(trailerDir, '..');
const manifest = JSON.parse(await readFile(path.join(trailerDir, 'manifest.json'), 'utf8'));

const overrides = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  const flag = process.argv[index];
  const value = process.argv[index + 1];
  if (!flag?.startsWith('--') || !value) throw new Error(`Expected --capture-id /path/to/image, received ${flag ?? 'nothing'}`);
  overrides.set(flag.slice(2), path.resolve(process.cwd(), value));
}

for (const target of manifest.captureTargets) {
  const source = overrides.get(target.id) ?? path.resolve(repoDir, target.source);
  const destination = path.resolve(trailerDir, target.destination);
  const sourceStats = await stat(source);
  if (!sourceStats.isFile()) throw new Error(`Proof source is not a file: ${source}`);
  await mkdir(path.dirname(destination), {recursive: true});
  await copyFile(source, destination);
  console.log(`SYNCED ${target.id} -> ${path.relative(trailerDir, destination)}`);
}
