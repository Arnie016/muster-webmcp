import assert from 'node:assert/strict';
import {
  addInject,
  approveReport,
  checkCoverage,
  createInitialState,
  inspectZone,
  recordAction,
  recordHumanSignal,
  stageReport,
  startDrill,
} from './drill-core.js';

let seed = 7402;
const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 2 ** 32;
};
const shuffle = (items) => [...items].sort(() => random() - .5);

for (let run = 0; run < 500; run += 1) {
  let state = startDrill(createInitialState());
  const injects = shuffle(['stair', 'roster']);
  const actions = shuffle(['account', 'reroute', 'assist']);

  for (const inject of injects) {
    state = addInject(state, inject);
    const duplicate = addInject(state, inject);
    assert.equal(duplicate.injectIds.filter((id) => id === inject).length, 1);
  }

  for (const action of actions) {
    state = recordAction(state, action);
    const duplicate = recordAction(state, action);
    assert.equal(duplicate.decisions.filter((item) => item.actionId === action).length, 1);
  }

  const role = ['fsm', 'security', 'warden-east', 'warden-west', 'mobility'][run % 5];
  const signal = ['confirms', 'uncertain', 'disagrees', 'delayed'][run % 4];
  state = recordHumanSignal(state, role, signal);
  assert.equal(state.humanSignals.at(-1).signal, signal);

  const zone = ['west', 'east', 'meeting', 'studio', 'lobby', 'electrical'][run % 6];
  const inspection = inspectZone(state, zone);
  state = inspection.state;
  assert.equal(inspection.result.training_only, true);
  assert.equal(inspection.result.external_effects, false);
  assert.equal(checkCoverage(state).unresolved.length, 0);

  state = stageReport(state);
  assert.equal(state.report.status, 'ready-for-review');
  state = approveReport(state);
  assert.equal(state.status, 'complete');
  assert.equal(state.approved, true);
}

let blocked = startDrill(createInitialState());
blocked = addInject(blocked, 'stair');
blocked = addInject(blocked, 'roster');
blocked = stageReport(blocked);
assert.equal(blocked.report.status, 'needs-action');
assert.throws(() => approveReport(blocked), /Resolve the visible gap/);
assert.throws(() => addInject(createInitialState(), 'stair'), /Start the exercise/);
assert.throws(() => recordAction(createInitialState(), 'assist'), /Start the exercise/);
assert.throws(() => inspectZone(createInitialState(), 'unknown'), /Unknown floor zone/);

console.log('PASS · 500 shuffled manager workflows preserve idempotency and approval gates');
console.log('PASS · invalid transitions fail closed and no simulated output gains external effects');
