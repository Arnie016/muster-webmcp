import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  addInject,
  analyzeRouteSketch,
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
assert.equal(checkCoverage(state).unresolved.length, 3);
state = recordAction(state, 'reroute');
state = recordAction(state, 'assist');
state = recordAction(state, 'account');
state = recordHumanSignal(state, 'security', 'uncertain');
assert.equal(state.humanSignals.length, 1);
assert.throws(() => recordHumanSignal(state, 'security', 'motivated'), /Unknown observed signal/);
assert.equal(checkCoverage(state).unresolved.length, 0);
state = stageReport(state);
assert.equal(state.report.status, 'ready-for-review');
assert.equal(state.report.expected.length, 3);
assert.equal(state.report.observed.length, 3);
assert.equal(state.report.improvements[0].owner, 'Fire Safety Manager');
state = approveReport(state);
assert.equal(state.status, 'complete');
assert.equal(state.approved, true);

const studio = inspectZone(state, 'studio').result;
assert.equal(studio.fixture_occupants, 6);
assert.equal(studio.assisted_occupants, 2);
const routes = compareRoutes({ ...state, injectIds: ['smoke', 'stair'] }, 'studio');
assert.equal(routes.alternatives[0].scenario_status, 'unavailable');
assert.equal(routes.alternatives[0].distance_m, 18);
assert.equal(routes.alternatives[1].distance_m, 30.1);
assert.match(routes.decision_boundary, /does not direct/i);
assert.match(hazardSnapshot(state).model_type, /not a physical/i);
const sketchedRoute = analyzeRouteSketch(
  { ...state, injectIds: ['smoke', 'stair'] },
  'studio',
  [{ x: 700, y: 390 }, { x: 640, y: 410 }, { x: 742, y: 479 }],
);
assert.equal(sketchedRoute.endpoint_nearest_exit, 'Stair B');
assert.equal(sketchedRoute.endpoint_exit_available, false);
assert.match(sketchedRoute.decision_boundary, /qualified human/i);
assert.throws(() => analyzeRouteSketch(state, 'studio', [{ x: 10, y: 10 }]), /between 2 and 80/);

const app = await readFile(new URL('./app.js', import.meta.url), 'utf8');
const html = await readFile(new URL('./index.html', import.meta.url), 'utf8');
const toolNames = [...app.matchAll(/name: '([a-z_]+)'/g)].map((match) => match[1]);
assert.deepEqual(toolNames, ['run_drill_manager', 'read_plan', 'start_drill', 'send_inject', 'record_action', 'check_coverage', 'stage_report', 'inspect_zone', 'compare_routes', 'analyze_route_sketch', 'read_drill_guide', 'read_hazard', 'read_floor_register', 'read_status_board', 'read_site_context', 'read_room_profile', 'read_equipment', 'read_lessons', 'record_human_signal']);
assert.equal(new Set(toolNames).size, 19);
assert.ok(toolNames.every((name) => name.length <= 30));
assert.match(app, /document\.modelContext\.registerTool/);
assert.match(html, /Training only/);
assert.match(html, /Not for live emergencies/);
assert.match(html, /Incident Commander/);
assert.match(html, /conversationHistory/);
assert.match(html, /Live trace/);
assert.match(html, /3D building/);
assert.match(html, /Draw a route/);
assert.match(html, /Skill\.md/);
assert.match(html, /id="phaseGuide"/);
assert.match(html, /data-agent-prompt="equipment"/);
assert.doesNotMatch(app, /fetch\(|XMLHttpRequest|tel:/);

console.log('PASS · deterministic drill state and report approval');
console.log('PASS · one manager plus eighteen unique WebMCP tools, all names <= 30 characters');
console.log('PASS · human signals are facilitator observations, never inferred intent');
console.log('PASS · zone, route, assistance, and scripted-hazard boundaries');
console.log('PASS · training boundary visible and no network or call integration');
