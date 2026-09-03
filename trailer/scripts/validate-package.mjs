import {access, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const trailerDir = path.resolve(scriptDir, '..');
const repoDir = path.resolve(trailerDir, '..');
const manifestPath = path.join(trailerDir, 'manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const failures = [];

const fail = (message) => failures.push(message);
const duration = manifest.project?.durationSeconds;
if (!Number.isFinite(duration) || duration < 120 || duration > 180) fail(`duration must be 120–180 seconds; received ${duration}`);
if (manifest.project?.width !== 1920 || manifest.project?.height !== 1080) fail('composition must be 1920×1080');
if (manifest.project?.fps !== 30) fail('composition must be 30 fps');

const scenes = manifest.scenes ?? [];
if (!scenes.length) fail('manifest has no scenes');
if (scenes.length < 15) fail(`the long-form cut needs at least 15 visual beats; received ${scenes.length}`);
if (scenes[0]?.start !== 0) fail('first scene must begin at zero');
if (scenes.at(-1)?.end !== duration) fail('last scene must end at project duration');
for (let index = 0; index < scenes.length; index += 1) {
  const scene = scenes[index];
  if (!(scene.end > scene.start)) fail(`${scene.id} has an invalid time range`);
  if (index > 0 && scene.start !== scenes[index - 1].end) fail(`${scene.id} does not begin where the previous scene ends`);
  const headlineWords = String(scene.headline ?? '').trim().split(/\s+/).filter(Boolean).length;
  if (headlineWords > 8) fail(`${scene.id} headline exceeds eight words`);
  if (!scene.narration) fail(`${scene.id} is missing narration copy`);
  if (!scene.intelligenceRole) fail(`${scene.id} is missing an intelligenceRole`);
}

const firstProof = scenes.find((scene) => scene.type === 'proof' && String(scene.asset ?? '').startsWith('proof/'));
if (!firstProof || firstProof.start >= 20) fail('real product proof must appear before 20 seconds');
const ctaScenes = scenes.filter((scene) => scene.type === 'cta');
if (ctaScenes.length !== 1) fail(`exactly one CTA scene is required; received ${ctaScenes.length}`);
if (!manifest.cta?.url || !manifest.cta?.label) fail('CTA label and URL are required');
if (manifest.audio?.enabled) {
  try {
    await access(path.resolve(trailerDir, 'public', manifest.audio.source));
  } catch {
    fail('audio.enabled is true but the narration file is missing');
  }
}

const limitations = (manifest.knownLimitations ?? []).join(' ').toLowerCase();
for (const required of ['fictional', 'human', 'native webmcp discovery']) {
  if (!limitations.includes(required)) fail(`knownLimitations must mention ${required}`);
}

for (const target of manifest.captureTargets ?? []) {
  try {
    await access(path.resolve(trailerDir, target.destination));
  } catch {
    fail(`synced proof asset is missing: ${target.destination}`);
  }
}

const allCopy = JSON.stringify(manifest).toLowerCase();
for (const forbidden of ['webmcp discovery observed', 'live occupancy feed', 'connected to emergency services']) {
  if (allCopy.includes(forbidden)) fail(`forbidden unsupported claim found: ${forbidden}`);
}

const appSource = await readFile(path.join(repoDir, manifest.toolContractProof.source), 'utf8');
const toolNames = [...appSource.matchAll(/name: '([a-z_]+)'/g)].map((match) => match[1]);
const managerCount = toolNames.filter((name) => name === manifest.toolContractProof.managerTool).length;
const boundedPageTools = toolNames.length - managerCount;
if (managerCount !== manifest.toolContractProof.managerCount) {
  fail(`manager tool count drifted: source=${managerCount}, manifest=${manifest.toolContractProof.managerCount}`);
}
if (boundedPageTools !== manifest.toolContractProof.boundedPageTools) {
  fail(`bounded page-tool count drifted: source=${boundedPageTools}, manifest=${manifest.toolContractProof.boundedPageTools}`);
}
if (toolNames.length !== manifest.toolContractProof.totalToolContracts) {
  fail(`total tool-contract count drifted: source=${toolNames.length}, manifest=${manifest.toolContractProof.totalToolContracts}`);
}

if (failures.length) {
  console.error('Muster trailer validation failed:');
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`PASS · ${duration}s · ${manifest.project.width}×${manifest.project.height} · ${manifest.project.fps} fps`);
console.log(`PASS · ${scenes.length} contiguous scenes · product proof at ${firstProof.start}s · one CTA`);
console.log('PASS · fictional-data, human-approval, and native-discovery boundaries are explicit');
console.log(`PASS · source-aligned tool count: ${managerCount} manager + ${boundedPageTools} bounded page tools`);
