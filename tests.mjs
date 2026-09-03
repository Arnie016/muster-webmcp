import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  addInject,
  approveReport,
  checkCoverage,
  compareRoutes,
  createInitialState,
  recordAction,
  stageReport,
  startDrill,
  hazardSnapshot,
  inspectZone,
  recordHumanSignal,
} from './drill-core.js';

let state = createInitialState();
assert.equal(state.status, 'ready');
state = startDrill(state);
assert.deepEqual(state.injectIds, ['smoke']);
state = addInject(state, 'stair');
state = addInject(state, 'roster');
assert.equal(checkCoverage(state).unresolved.length, 2);
state = recordAction(state, 'reroute');
state = recordAction(state, 'assist');
state = recordHumanSignal(state, 'security', 'uncertain');
assert.equal(state.humanSignals.length, 1);
assert.throws(() => recordHumanSignal(state, 'security', 'motivated'), /Unknown observed signal/);
assert.equal(checkCoverage(state).unresolved.length, 0);
state = stageReport(state);
assert.equal(state.report.status, 'ready-for-review');
state = approveReport(state);
assert.equal(state.status, 'complete');
assert.equal(state.approved, true);

const studio = inspectZone(state, 'studio').result;
assert.equal(studio.fixture_occupants, 6);
assert.equal(studio.assisted_occupants, 2);
const routes = compareRoutes({ ...state, injectIds: ['smoke', 'stair'] }, 'studio');
assert.equal(routes.alternatives[0].scenario_status, 'unavailable');
assert.match(routes.decision_boundary, /does not direct/i);
assert.match(hazardSnapshot(state).model_type, /not a physical/i);

const app = await readFile(new URL('./app.js', import.meta.url), 'utf8');
const html = await readFile(new URL('./index.html', import.meta.url), 'utf8');
const toolNames = [...app.matchAll(/name: '([a-z_]+)'/g)].map((match) => match[1]);
assert.deepEqual(toolNames, ['run_drill_manager', 'read_plan', 'start_drill', 'send_inject', 'record_action', 'check_coverage', 'stage_report', 'inspect_zone', 'compare_routes', 'read_drill_guide', 'read_hazard', 'read_floor_register', 'read_status_board', 'read_site_context', 'read_room_profile', 'read_equipment', 'read_lessons', 'record_human_signal']);
assert.equal(new Set(toolNames).size, 18);
assert.ok(toolNames.every((name) => name.length <= 30));
assert.match(app, /document\.modelContext\.registerTool/);
assert.match(html, /Training only/);
assert.match(html, /Not for live emergencies/);
assert.match(html, /Incident Commander/);
assert.match(html, /conversationHistory/);
assert.match(html, /WebMCP calls/);
assert.match(html, /id="phaseGuide"/);
assert.match(html, /data-agent-prompt="equipment"/);
assert.doesNotMatch(app, /fetch\(|XMLHttpRequest|tel:/);

console.log('PASS · deterministic drill state and report approval');
console.log('PASS · one manager plus seventeen unique WebMCP tools, all names <= 30 characters');
console.log('PASS · human signals are facilitator observations, never inferred intent');
console.log('PASS · zone, route, assistance, and scripted-hazard boundaries');
console.log('PASS · training boundary visible and no network or call integration');
