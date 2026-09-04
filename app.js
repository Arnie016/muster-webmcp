import {
  ACTIONS,
  BUILDING,
  CHECKLISTS,
  EQUIPMENT,
  INJECTS,
  LESSONS,
  ROOM_PROFILES,
  SITE_CONTEXT,
  ZONES,
  addInject,
  analyzeRouteSketch,
  approveReport,
  checkCoverage,
  compareRoutes,
  createInitialState,
  publicSnapshot,
  hazardSnapshot,
  inspectZone,
  recordHumanSignal,
  recordAction,
  returnToDrill,
  stageReport,
  startDrill,
} from './drill-core.js';
import MusterPeopleData from './people-data.js';
import { initBuildingScene } from './building-scene.js';

const STORAGE_KEY = 'muster-demo-state-v2';
const $ = (selector) => document.querySelector(selector);
const loadState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...createInitialState(), ...JSON.parse(stored) } : createInitialState();
  } catch {
    return createInitialState();
  }
};

let state = loadState();
const restoredUi = state.ui || {};
let planRead = Boolean(restoredUi.planRead || state.activity.some((event) => event.title === 'read_plan'));
let timer = null;
let elapsed = Number.isFinite(restoredUi.elapsed) ? restoredUi.elapsed : state.injectIds.includes('roster') ? 240 : state.injectIds.includes('stair') ? 120 : 0;
let dossierView = 'context';
let managerBusy = false;
let pendingAssistant = null;
let spatialMode = restoredUi.spatialMode === 'floor' ? 'floor' : 'building';
let orbit = { x: 62, z: -38, scale: 1 };
let floorView = { scale: 1, x: 0, y: 0, originX: 50, originY: 50 };
let routeDrawMode = false;
let routeDrawing = false;
let routePoints = Array.isArray(restoredUi.routePoints) ? restoredUi.routePoints : [];
let selectedTraceOffset = 0;
let selectedFloor = Number(restoredUi.selectedFloor) || 7;
let guidedStep = Number(restoredUi.guidedStep) || 0;
let selectedToolName = 'read_plan';
let lastRouteResult = restoredUi.lastRouteResult || null;
let buildingScene = null;
let peopleState = MusterPeopleData.resetPeopleState();
let conversation = [
  { role: 'assistant', text: 'Start with Read the plan. I will explain every change and wait for your next decision.' },
];

const FLOOR_PRESETS = {
  3: {
    code: 'F03', label: 'Retail podium', drawing: 'MX-FS-03-006', revision: '06', occupants: 112, assisted: 1,
    perimeter: 'M70 72H830V535H70Z',
    core: 'M270 72V240H630V72M270 240V535M630 240V535',
    rooms: 'M70 325H270M630 325H830M390 240V535M510 240V535',
    service: 'M270 410H390M510 410H630',
    labels: [['FOOD HALL',108,116],['RETAIL EAST',654,116],['LIFT LOBBY',394,118],['SERVICE BAY',96,365],['EVENT SPACE',652,365],['FIRE',302,285],['LIFT',300,303],['ELEC.',528,285],['STORE',528,303]],
    fixtures: 'M105 160h120v48h-120zM650 160h130v48h-130zM105 240h120v48h-120zM650 240h130v48h-130z',
    actionable: false,
  },
  7: {
    code: 'F07', label: 'Office command', drawing: 'MX-FS-07-004', revision: '04', occupants: 84, assisted: 2,
    perimeter: 'M70 72H830V535H70Z',
    core: 'M330 72V210H568V72M330 210V535M568 210V535',
    rooms: 'M70 350H330M568 350H830',
    service: 'M420 210V350M478 210V350',
    labels: [['WEST WORKPLACE',108,116],['EAST WORKPLACE',608,116],['LIFT LOBBY',365,118],['MEETING SUITE',96,388],['STUDIO',610,388],['FIRE',350,255],['LIFT',348,273],['7-E',493,255],['ELEC.',491,273],['WC / SERVICE',352,403]],
    fixtures: 'M115 165h70v34h-70zM215 165h70v34h-70zM115 235h70v34h-70zM215 235h70v34h-70zM615 165h70v34h-70zM715 165h70v34h-70zM615 235h70v34h-70zM715 235h70v34h-70z',
    actionable: true,
  },
  12: {
    code: 'F12', label: 'Care suite', drawing: 'MX-FS-12-003', revision: '03', occupants: 46, assisted: 6,
    perimeter: 'M70 72H830V535H70Z',
    core: 'M360 72V190H540V72M360 190V535M540 190V535',
    rooms: 'M70 250H360M540 250H830M70 390H360M540 390H830',
    service: 'M425 190V535M475 190V535',
    labels: [['CARE WEST',112,116],['CARE EAST',646,116],['LIFT LOBBY',392,118],['QUIET ROOM',108,290],['THERAPY',648,290],['NURSE BASE',108,430],['DAY ROOM',648,430],['FIRE LIFT',374,220],['SERVICE',486,220]],
    fixtures: 'M110 150h82v42h-82zM220 150h82v42h-82zM598 150h82v42h-82zM708 150h82v42h-82zM110 302h190v46h-190zM600 302h190v46h-190z',
    actionable: false,
  },
};

const SITE_POINTS = {
  'assembly-a': {
    label: 'Assembly A · West court',
    meta: 'Primary accounting point · fictional site fixture',
    detail: 'Connected to the west exit path. Use the floor register and a facilitator-confirmed headcount before closing the exercise.',
  },
  'assembly-b': {
    label: 'Assembly B · East court',
    meta: 'Alternate accounting point · fictional site fixture',
    detail: 'Connected to the east exit path. Its availability follows the authored route condition shown in the active exercise.',
  },
  'appliance-bay': {
    label: 'Fire appliance bay',
    meta: 'South approach · training geometry only',
    detail: 'A visible staging reference for tabletop coordination. Muster does not dispatch crews or verify real access clearance.',
  },
  'service-road': {
    label: 'South service road',
    meta: 'Appliance approach · training geometry only',
    detail: 'Links the fictional access edge to the appliance bay and public podium. A qualified site review is still required.',
  },
};

const GUIDED_SEQUENCE = [
  { tool: 'read_plan', title: 'Read the visible plan', description: 'Ground the agent in Floor 07, its revision, exits, and fixture register.', button: 'Read the plan', change: 'The plan, exits, roles, and fixture counts will enter the visible context.', input: {} },
  { tool: 'start_drill', title: 'Start one authored signal', description: 'Introduce the fictional detector activation beside Electrical Room 7-E.', button: 'Start the scenario', change: 'An orange signal will appear at 7-E. It is not a live alarm or spread model.', input: {} },
  { tool: 'inspect_zone', title: 'Inspect the affected group', description: 'Zoom to the Studio group and read its people, assistance need, and nearest exit.', button: 'Inspect the Studio', change: 'The plan will zoom to six occupants, including two who need assistance.', input: { zone_id: 'studio' } },
  { tool: 'send_inject', title: 'Change one condition', description: 'Make Stair B unavailable in the authored exercise.', button: 'Block Stair B', change: 'The short route turns red. Red means unavailable in this exercise, not danger everywhere.', input: { inject_id: 'stair' } },
  { tool: 'compare_routes', title: 'Compare both exits', description: 'Ask the plan specialist to compare the two fixture distances.', button: 'Compare routes', change: 'The trace will show both alternatives and why Stair A remains available.', input: { zone_id: 'studio' } },
  { tool: 'record_action', title: 'Record the team decision', description: 'Preserve the alternate route selected by the exercise wardens.', button: 'Record Stair A route', change: 'A named response will be added; the agent cannot invent that it occurred.', input: { action_id: 'reroute' } },
  { tool: 'send_inject', title: 'Reveal the people gap', description: 'Show that two registered occupants still lack a named assistance owner.', button: 'Reveal assistance gap', change: 'The people layer and responsibility check will expose an unresolved owner.', input: { inject_id: 'roster' } },
  { tool: 'record_action', title: 'Assign assistance', description: 'Record the exercise assistance pair and move the responder marker to the Studio.', button: 'Assign responder pair', change: 'A yellow responder moves toward the assisted occupant group.', input: { action_id: 'assist' } },
  { tool: 'record_action', title: 'Reconcile the register', description: 'Record the assembly-area accounting step with its named owner.', button: 'Record accounting', change: 'The review ledger will hold the third facilitator-confirmed action.', input: { action_id: 'account' } },
  { tool: 'check_coverage', title: 'Check every responsibility', description: 'Verify that each active exercise problem has a visible owner.', button: 'Check coverage', change: 'The result will pass or preserve exact unresolved gaps without hiding them.', input: {} },
  { tool: 'stage_report', title: 'Prepare the review draft', description: 'Turn the visible exercise evidence into an after-action draft.', button: 'Prepare the draft', change: 'The report will be staged. Human approval remains separate.', input: {} },
];

const toolDefinitions = [
  {
    name: 'run_drill_manager',
    description: 'Route one clear training intent through the bounded plan, people, equipment, and review specialists on this page.',
    inputSchema: {
      type: 'object',
      properties: {
        intent: { type: 'string', enum: ['orient', 'find_gaps', 'inspect_equipment', 'read_history', 'read_status', 'inspect_zone', 'rehearse', 'prepare_review'] },
        zone_id: { type: 'string', enum: ['west', 'east', 'meeting', 'studio', 'lobby', 'electrical'] },
      },
      required: ['intent'],
    },
    annotations: { readOnlyHint: false },
    execute: async ({ intent, zone_id }) => runManagerIntent(intent, zone_id),
  },
  {
    name: 'read_plan',
    description: 'Read the selected fictional building plan, roles, occupants, exits, and revision. No external effects.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => {
      planRead = true;
      logTool('read_plan', `${BUILDING.name} · floor ${BUILDING.floor} · ${BUILDING.planVersion}`);
      render();
      return {
        training_only: true,
        building: BUILDING.name,
        floor: BUILDING.floor,
        plan_version: BUILDING.planVersion,
        occupants: BUILDING.occupants,
        assisted_occupants: BUILDING.assistedOccupants,
        exits: BUILDING.exits,
        missing_role: BUILDING.roles.find((role) => role.status === 'missing')?.label,
        external_effects: false,
      };
    },
  },
  {
    name: 'start_drill',
    description: 'Start the fictional tabletop exercise on this page. Does not alarm, call, dispatch, or control a building.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: false },
    execute: async () => {
      state = startDrill(state);
      saveAndRender();
      startClock();
      return publicSnapshot(state);
    },
  },
  {
    name: 'send_inject',
    description: 'Add one scripted training complication to the visible exercise timeline.',
    inputSchema: {
      type: 'object',
      properties: { inject_id: { type: 'string', enum: ['stair', 'roster'] } },
      required: ['inject_id'],
    },
    annotations: { readOnlyHint: false },
    execute: async ({ inject_id }) => {
      state = addInject(state, inject_id);
      saveAndRender();
      return publicSnapshot(state);
    },
  },
  {
    name: 'record_action',
    description: 'Record one facilitator-confirmed team action and owner in the exercise log.',
    inputSchema: {
      type: 'object',
      properties: { action_id: { type: 'string', enum: Object.keys(ACTIONS) } },
      required: ['action_id'],
    },
    annotations: { readOnlyHint: false },
    execute: async ({ action_id }) => {
      state = recordAction(state, action_id);
      saveAndRender();
      return { ...publicSnapshot(state), recorded_action: { id: action_id, label: ACTIONS[action_id].label, owner: ACTIONS[action_id].owner } };
    },
  },
  {
    name: 'check_coverage',
    description: 'Check whether active training injects have a recorded action and owner. Does not judge a live response.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => {
      const result = { ...checkCoverage(state), training_only: true, external_effects: false };
      logTool('check_coverage', result.unresolved.length ? `${result.unresolved.length} gap found` : 'No open gaps');
      render();
      return result;
    },
  },
  {
    name: 'stage_report',
    description: 'Prepare a visible after-action draft from the exercise log. A human must approve it in the page.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: false },
    execute: async () => {
      state = stageReport(state);
      saveAndRender();
      return { ...state.report, human_approval_required: true, external_effects: false };
    },
  },
  {
    name: 'inspect_zone',
    description: 'Highlight one fictional floor zone and read its fixture occupancy, assistance count, and nearest plan exit.',
    inputSchema: {
      type: 'object',
      properties: { zone_id: { type: 'string', enum: ['west', 'east', 'meeting', 'studio', 'lobby', 'electrical'] } },
      required: ['zone_id'],
    },
    annotations: { readOnlyHint: false },
    execute: async ({ zone_id }) => {
      const inspection = inspectZone(state, zone_id);
      state = inspection.state;
      setSpatialMode('floor');
      focusFloorZone(zone_id);
      saveAndRender();
      return inspection.result;
    },
  },
  {
    name: 'compare_routes',
    description: 'Compare fictional plan distances and scripted route availability. Never directs a live evacuation or rescue.',
    inputSchema: {
      type: 'object',
      properties: { zone_id: { type: 'string', enum: ['west', 'east', 'meeting', 'studio', 'lobby'] } },
      required: ['zone_id'],
    },
    annotations: { readOnlyHint: true },
    execute: async ({ zone_id }) => {
      const result = compareRoutes(state, zone_id);
      logTool('compare_routes', `${result.zone} · ${result.alternatives.length} plan routes`);
      render();
      return result;
    },
  },
  {
    name: 'analyze_route_sketch',
    description: 'Measure a facilitator-drawn path against this fictional plan and flag whether its endpoint reaches an available exit.',
    inputSchema: {
      type: 'object',
      properties: {
        zone_id: { type: 'string', enum: ['west', 'east', 'meeting', 'studio', 'lobby', 'electrical'] },
        points: {
          type: 'array', minItems: 2, maxItems: 80,
          items: { type: 'object', properties: { x: { type: 'number' }, y: { type: 'number' } }, required: ['x', 'y'] },
        },
      },
      required: ['zone_id', 'points'],
    },
    annotations: { readOnlyHint: true },
    execute: async ({ zone_id, points }) => {
      const result = analyzeRouteSketch(state, zone_id, points);
      routePoints = points;
      lastRouteResult = result;
      logTool('analyze_route_sketch', `${result.estimated_plan_metres} m sketch · ${result.endpoint_nearest_exit}`);
      render();
      return result;
    },
  },
  {
    name: 'read_drill_guide',
    description: 'Read the fictional exercise checklist for before, during, or after the drill. Not live emergency guidance.',
    inputSchema: {
      type: 'object',
      properties: { phase: { type: 'string', enum: ['before', 'during', 'after'] } },
      required: ['phase'],
    },
    annotations: { readOnlyHint: true },
    execute: async ({ phase }) => {
      const result = { phase, items: CHECKLISTS[phase], training_only: true, external_effects: false };
      logTool('read_drill_guide', `${phase} · ${result.items.length} checks`);
      render();
      return result;
    },
  },
  {
    name: 'read_hazard',
    description: 'Read the current scripted hazard snapshot. This is not a physical fire-spread prediction or live sensor feed.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => {
      const result = hazardSnapshot(state);
      logTool('read_hazard', result.scripted_phase);
      render();
      return result;
    },
  },
  {
    name: 'read_floor_register',
    description: 'Read fictional zone counts and assistance ownership from the exercise floor register. Returns no personal data.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => {
      const assistanceAssigned = state.decisions.some((item) => item.actionId === 'assist');
      const result = {
        training_only: true,
        register_type: 'fictional aggregate fixture',
        zones: Object.values(ZONES).map((zone) => ({ zone: zone.label, occupants: zone.occupants, assisted: zone.assisted })),
        assisted_total: BUILDING.assistedOccupants,
        assistance_owner: assistanceAssigned ? ACTIONS.assist.owner : null,
        personal_data: false,
        external_effects: false,
      };
      logTool('read_floor_register', `${BUILDING.occupants} fixture occupants · ${result.assisted_total} assisted`);
      render();
      return result;
    },
  },
  {
    name: 'read_status_board',
    description: 'Read the fictional evacuation status board derived from facilitator-recorded exercise actions.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => {
      const accounted = state.decisions.some((item) => item.actionId === 'account');
      const rerouted = state.decisions.some((item) => item.actionId === 'reroute');
      const assisted = state.decisions.some((item) => item.actionId === 'assist');
      const result = {
        training_only: true,
        floor: BUILDING.floor,
        status: state.status,
        fixture_accounting_recorded: accounted,
        alternate_route_recorded: rerouted,
        assistance_owner_recorded: assisted,
        clearance_claimed: false,
        note: 'Muster never infers or claims real floor clearance.',
        external_effects: false,
      };
      logTool('read_status_board', `Floor ${BUILDING.floor} · ${[accounted, rerouted, assisted].filter(Boolean).length}/3 records`);
      render();
      return result;
    },
  },
  {
    name: 'read_site_context',
    description: 'Read the fictional site setting, assembly areas, access note, and live-data boundaries.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => {
      const result = { training_only: true, ...SITE_CONTEXT, external_effects: false };
      logTool('read_site_context', SITE_CONTEXT.setting);
      dossierView = 'context';
      render();
      return result;
    },
  },
  {
    name: 'read_room_profile',
    description: 'Highlight one fictional room or zone and read use, protection fixtures, and operational context.',
    inputSchema: {
      type: 'object',
      properties: { room_id: { type: 'string', enum: Object.keys(ROOM_PROFILES) } },
      required: ['room_id'],
    },
    annotations: { readOnlyHint: false },
    execute: async ({ room_id }) => {
      const inspection = inspectZone(state, room_id);
      state = inspection.state;
      dossierView = 'rooms';
      setSpatialMode('floor');
      focusFloorZone(room_id);
      saveAndRender();
      return { ...inspection.result, profile: ROOM_PROFILES[room_id], cause_inferred: false };
    },
  },
  {
    name: 'read_equipment',
    description: 'Read equipment shown on the fictional plan with room and inspection-fixture status. Does not certify adequacy.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => {
      const result = { training_only: true, equipment: EQUIPMENT, adequacy: 'qualified review required', external_effects: false };
      logTool('read_equipment', `${EQUIPMENT.length} plan items · adequacy not certified`);
      dossierView = 'equipment';
      render();
      return result;
    },
  },
  {
    name: 'read_lessons',
    description: 'Read dated fictional lessons from earlier exercises and the changes they motivated.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => {
      const result = { training_only: true, lessons: LESSONS, incident_claims: false, external_effects: false };
      logTool('read_lessons', `${LESSONS.length} fictional learning records`);
      dossierView = 'lessons';
      render();
      return result;
    },
  },
  {
    name: 'record_human_signal',
    description: 'Record a facilitator-observed participant signal. Never infer personality, intent, emotion, or competence.',
    inputSchema: {
      type: 'object',
      properties: {
        role_id: { type: 'string', enum: BUILDING.roles.map((role) => role.id) },
        signal: { type: 'string', enum: ['confirms', 'uncertain', 'disagrees', 'delayed'] },
      },
      required: ['role_id', 'signal'],
    },
    annotations: { readOnlyHint: false },
    execute: async ({ role_id, signal }) => {
      state = recordHumanSignal(state, role_id, signal);
      dossierView = 'people';
      saveAndRender();
      return { training_only: true, recorded: state.humanSignals.at(-1), inference: false, external_effects: false };
    },
  },
].map((tool) => ({
  ...tool,
  title: tool.name.split('_').map((word) => `${word[0].toUpperCase()}${word.slice(1)}`).join(' '),
  inputSchema: { ...tool.inputSchema, additionalProperties: false },
  annotations: {
    untrustedContentHint: false,
    ...tool.annotations,
  },
}));

function persistedState() {
  return {
    ...state,
    ui: { planRead, elapsed, spatialMode, selectedFloor, guidedStep, routePoints, lastRouteResult },
  };
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState()));
}

function restoreDerivedPeopleState() {
  const assistanceAssigned = state.decisions.some((item) => item.actionId === 'assist');
  if (!assistanceAssigned) return;
  try {
    MusterPeopleData.assignResponder('responder-s-tan', 'office-studio-07', 'task-assistance-handoff');
    MusterPeopleData.movePerson('responder-s-tan', 'office-studio-07', MusterPeopleData.PERSON_STATUSES.ASSISTING);
    peopleState = MusterPeopleData.getPeopleState();
  } catch { /* deterministic fixture may already be restored */ }
}

restoreDerivedPeopleState();

function saveAndRender() {
  selectedTraceOffset = 0;
  persistState();
  render();
}

function logTool(name, detail) {
  state = { ...state, activity: [...state.activity, { type: 'tool', title: name, detail }] };
  selectedTraceOffset = 0;
  persistState();
}

function showToolResult(value) {
  $('#toolResult').textContent = JSON.stringify(value, null, 2);
}

function tracePayload(value) {
  if (value === undefined) return {};
  try {
    const text = JSON.stringify(value);
    return text.length > 900 ? { summary: `${text.slice(0, 860)}…`, truncated: true } : JSON.parse(text);
  } catch {
    return { summary: String(value) };
  }
}

function normaliseToolInput(value) {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function attachTraceEvidence(name, input, result, durationMs, activityStart) {
  let target = -1;
  for (let index = state.activity.length - 1; index >= activityStart; index -= 1) {
    if (state.activity[index].title === name) { target = index; break; }
  }
  const evidence = {
    type: 'tool',
    title: name,
    detail: target >= 0 ? state.activity[target].detail : summariseToolResult(name, result),
    at: `T+${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`,
    durationMs,
    input: tracePayload(input),
    output: tracePayload(result),
  };
  const activity = [...state.activity];
  if (target >= 0) activity[target] = { ...activity[target], ...evidence };
  else activity.push(evidence);
  state = { ...state, activity };
  persistState();
}

function maybeAdvanceGuide(name, input) {
  const expected = GUIDED_SEQUENCE[guidedStep];
  if (!expected || expected.tool !== name) return;
  const expectedInput = JSON.stringify(expected.input || {});
  const receivedInput = JSON.stringify(input || {});
  if (expectedInput !== receivedInput) return;
  guidedStep += 1;
}

const specialistForTool = {
  read_plan: 'plan', start_drill: 'plan', inspect_zone: 'plan', compare_routes: 'plan', analyze_route_sketch: 'plan', read_hazard: 'plan', read_site_context: 'plan',
  send_inject: 'people', read_floor_register: 'people', read_status_board: 'people', record_human_signal: 'people', record_action: 'people',
  read_equipment: 'equipment', read_room_profile: 'equipment', read_drill_guide: 'equipment',
  check_coverage: 'review', stage_report: 'review', read_lessons: 'review',
};

const friendlyToolNames = {
  run_drill_manager: 'Route one mission intent',
  read_plan: 'Read plan',
  start_drill: 'Start smoke scenario',
  send_inject: 'Advance scenario',
  record_action: 'Record team action',
  check_coverage: 'Check responsibilities',
  stage_report: 'Prepare review',
  inspect_zone: 'Inspect floor zone',
  compare_routes: 'Compare exit routes',
  analyze_route_sketch: 'Analyze drawn route',
  read_drill_guide: 'Read drill checklist',
  read_hazard: 'Read scripted hazard',
  read_floor_register: 'Read people register',
  read_status_board: 'Read team status',
  read_site_context: 'Read site file',
  read_room_profile: 'Read room profile',
  read_equipment: 'Read equipment register',
  read_lessons: 'Read earlier lessons',
  record_human_signal: 'Record observation',
};

const traceMeta = {
  'Exercise loaded': { phase: 'Observe', owner: 'System', why: 'Load a clean fictional exercise state.', change: 'No building state changed.', boundary: 'No network or emergency connection.' },
  'WebMCP ready': { phase: 'Ready', owner: 'Manager', why: 'Expose the visible page actions to an enabled browser agent.', change: 'Tools became discoverable in this tab.', boundary: 'Registration does not grant hidden data or external control.' },
  run_drill_manager: { phase: 'Route', owner: 'Incident Commander', why: 'Turn one human intent into a bounded sequence of named page tools.', change: 'Specialist results and their visible receipts are reconciled on this page.', boundary: 'The manager cannot call emergency services, control building systems, or approve the report.' },
  read_plan: { phase: 'Think', owner: 'Plan specialist', why: 'Ground the exercise in the visible plan revision, exits, roles, and fixture counts.', change: 'Plan context is available to the drill manager.', boundary: 'Reads only this fictional page.' },
  start_drill: { phase: 'Act', owner: 'Plan specialist', why: 'Begin the authored tabletop sequence.', change: 'The smoke inject appears beside room 7-E.', boundary: 'No alarm, dispatch, door, or building system is activated.' },
  send_inject: { phase: 'Act', owner: 'People specialist', why: 'Introduce one controlled complication for the team to respond to.', change: 'The timeline, map, and responsibility checks update together.', boundary: 'The facilitator chooses when an inject is delivered.' },
  inspect_zone: { phase: 'Observe', owner: 'Plan specialist', why: 'Focus the plan on one room and its fixture occupancy, assistance, and exit distance.', change: 'The floor view zooms to the selected zone.', boundary: 'Counts and dimensions are training fixtures.' },
  compare_routes: { phase: 'Think', owner: 'Plan specialist', why: 'Compare the two authored exit paths after conditions change.', change: 'Available and unavailable alternatives are surfaced.', boundary: 'It does not direct a live evacuation.' },
  analyze_route_sketch: { phase: 'Think', owner: 'Plan specialist', why: 'Measure the route the facilitator drew and inspect its endpoint.', change: 'The custom path and review verdict appear on the same plan.', boundary: 'A qualified human must approve any real route.' },
  read_floor_register: { phase: 'Observe', owner: 'People specialist', why: 'Read aggregate fixture counts and assistance ownership.', change: 'The current people context is returned.', boundary: 'No personal data or live sensor count.' },
  record_action: { phase: 'Record', owner: 'People specialist', why: 'Preserve a facilitator-confirmed team action and named owner.', change: 'Responsibility coverage updates.', boundary: 'The agent cannot invent that an action occurred.' },
  record_human_signal: { phase: 'Record', owner: 'People specialist', why: 'Capture an observed confirmation, delay, uncertainty, or disagreement.', change: 'The observation is added to the review record.', boundary: 'No personality, intent, emotion, or competence inference.' },
  check_coverage: { phase: 'Verify', owner: 'Review specialist', why: 'Check that every active exercise problem has a recorded owner.', change: 'Open gaps are listed without being auto-resolved.', boundary: 'Passing the check is not proof of real-world readiness.' },
  stage_report: { phase: 'Prepare', owner: 'Review specialist', why: 'Turn the visible exercise log into an after-action draft.', change: 'A review artifact is staged.', boundary: 'Human Fire Safety Manager approval remains mandatory.' },
  'Human approval': { phase: 'Approve', owner: 'Fire Safety Manager', why: 'Accept the complete training record after review.', change: 'The draft becomes an approved exercise record.', boundary: 'This is a human page action, not an agent tool call.' },
};

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function setSpatialMode(mode) {
  spatialMode = mode === 'floor' ? 'floor' : 'building';
  const preset = FLOOR_PRESETS[selectedFloor];
  $('#buildingView').classList.toggle('view-hidden', spatialMode !== 'building');
  $('#floorView').classList.toggle('view-hidden', spatialMode !== 'floor');
  $('#buildingMode').classList.toggle('active', spatialMode === 'building');
  $('#floorMode').classList.toggle('active', spatialMode === 'floor');
  $('#spatialTitle').textContent = spatialMode === 'building'
    ? '18-floor building model'
    : preset ? `${preset.code} ${preset.label} plan` : `Floor ${String(selectedFloor).padStart(2, '0')} plan`;
  if (spatialMode === 'floor') requestAnimationFrame(applyFloorView);
  else requestAnimationFrame(() => buildingScene?.refresh());
  persistState();
}

function renderTower() {
  const tower = $('#towerCore');
  if (!tower || tower.childElementCount) return;
  tower.innerHTML = Array.from({ length: 18 }, (_, index) => {
    const floor = 18 - index;
    return `<button class="tower-floor ${floor === 7 ? 'selected' : ''} ${FLOOR_PRESETS[floor] ? 'loaded' : ''}" style="--level:${floor}" data-building-floor="${floor}" type="button" aria-label="Select floor ${String(floor).padStart(2, '0')}"><span>F${String(floor).padStart(2, '0')}</span><i></i><b></b></button>`;
  }).join('');
  tower.querySelectorAll('[data-building-floor]').forEach((button) => button.addEventListener('click', () => {
    selectFloor(Number(button.dataset.buildingFloor));
  }));
  document.querySelectorAll('[data-plan-floor]').forEach((button) => button.addEventListener('click', () => {
    selectFloor(Number(button.dataset.planFloor));
  }));
}

function selectSitePoint(pointId) {
  const point = SITE_POINTS[pointId];
  if (!point) return;
  document.querySelectorAll('[data-site-point]').forEach((button) => button.classList.toggle('selected', button.dataset.sitePoint === pointId));
  buildingScene?.selectSitePoint(pointId);
  $('#buildingStatus').innerHTML = `<span>Site point selected</span><strong>${point.label}</strong><p><b>${point.meta}</b><br />${point.detail}</p>`;
}

function selectFloor(floor, openPlan = false) {
  selectedFloor = Number(floor);
  document.querySelectorAll('[data-site-point]').forEach((button) => button.classList.remove('selected'));
  buildingScene?.selectFloor(selectedFloor);
  const preset = FLOOR_PRESETS[selectedFloor];
  document.querySelectorAll('[data-building-floor]').forEach((button) => button.classList.toggle('selected', Number(button.dataset.buildingFloor) === selectedFloor));
  document.querySelectorAll('[data-plan-floor]').forEach((button) => button.classList.toggle('active', Number(button.dataset.planFloor) === selectedFloor));
  $('#enterFloorButton').hidden = !preset;
  $('#enterFloorButton').textContent = preset ? `View ${preset.code} schematic` : 'View schematic';
  $('#floorMode').disabled = !preset;
  $('#buildingStatus').innerHTML = preset
    ? `<span>${preset.actionable ? 'Active exercise file' : 'Reference training plan'}</span><strong>${preset.code} · ${preset.label}</strong><p>${preset.occupants} fixture occupants · ${preset.assisted} assisted · revision ${preset.revision}</p>`
    : `<span>3D model only</span><strong>Floor ${String(selectedFloor).padStart(2, '0')}</strong><p>No schematic for this floor. The scenario runs on Floor 07; your progress is kept.</p>`;
  if (!preset) {
    setSpatialMode('building');
    renderMap();
    renderPeopleLayer();
    persistState();
    return;
  }
  $('#floorBeaconLabel').textContent = `${preset.code} · ${preset.actionable ? 'exercise loaded' : 'reference plan'}`;
  $('#floorPlanHeading').textContent = `${preset.code} · ${preset.label} · 1:200`;
  $('#floorTitle').textContent = `Fictional ${preset.code} ${preset.label} training plan`;
  $('#floorDesc').textContent = `${preset.label} ${preset.actionable ? 'exercise' : 'reference'} plan with fictional dimensions and training fixtures.`;
  $('#drawingTitle').textContent = `Level ${String(selectedFloor).padStart(2, '0')} ${preset.label.toLowerCase()} fire protection & egress plan`;
  $('#drawingNumber').textContent = preset.drawing;
  $('#drawingRevision').textContent = `${preset.revision} · training`;
  $('#perimeterWall').setAttribute('d', preset.perimeter);
  $('#coreWall').setAttribute('d', preset.core);
  $('#roomWall').setAttribute('d', preset.rooms);
  $('#serviceWall').setAttribute('d', preset.service);
  $('#roomLabels').innerHTML = preset.labels.map(([label, x, y]) => `<text x="${x}" y="${y}">${label}</text>`).join('');
  $('#planFixtures').innerHTML = `<path d="${preset.fixtures}" />`;
  document.body.classList.toggle('reference-floor', !preset.actionable);
  renderPeopleLayer();
  if (openPlan) {
    setSpatialMode('floor');
    resetFloorView();
  }
  persistState();
}

function applyOrbit() {
  $('#buildingOrbit').style.setProperty('--orbit-x', `${orbit.x}deg`);
  $('#buildingOrbit').style.setProperty('--orbit-z', `${orbit.z}deg`);
  $('#buildingOrbit').style.setProperty('--orbit-scale', String(orbit.scale));
  buildingScene?.setView(orbit);
}

function resetOrbit() {
  orbit = { x: 62, z: -38, scale: 1 };
  applyOrbit();
}

function applyFloorView() {
  const plan = $('#floorPlan');
  if (!plan) return;
  plan.style.setProperty('--floor-scale', String(floorView.scale));
  plan.style.setProperty('--floor-x', `${floorView.x}px`);
  plan.style.setProperty('--floor-y', `${floorView.y}px`);
  plan.style.setProperty('--origin-x', `${floorView.originX}%`);
  plan.style.setProperty('--origin-y', `${floorView.originY}%`);
  $('#floorZoomLabel').textContent = `${Math.round(floorView.scale * 100)}%`;
}

const floorFocus = {
  west: [22, 34], east: [78, 34], meeting: [22, 72], studio: [78, 72], lobby: [50, 24], electrical: [59, 47],
};

function focusFloorZone(zoneId) {
  const point = floorFocus[zoneId] || [50, 50];
  floorView = { scale: 1.42, x: 0, y: 0, originX: point[0], originY: point[1] };
  applyFloorView();
}

function resetFloorView() {
  floorView = { scale: 1, x: 0, y: 0, originX: 50, originY: 50 };
  routeDrawMode = false;
  routeDrawing = false;
  $('#drawRouteButton').classList.remove('active');
  $('#drawRouteButton').textContent = 'Draw a route';
  $('#planGesture').textContent = 'Click a room · drag to pan · scroll to zoom';
  applyFloorView();
}

function svgPoint(event) {
  const svg = $('#floorPlan');
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const transformed = point.matrixTransform(svg.getScreenCTM().inverse());
  return { x: Math.max(0, Math.min(900, Math.round(transformed.x))), y: Math.max(0, Math.min(610, Math.round(transformed.y))) };
}

function renderRouteSketch() {
  $('#userRoute').setAttribute('points', routePoints.map((point) => `${point.x},${point.y}`).join(' '));
  $('#userRoute').classList.toggle('active', routePoints.length > 1);
}

function traceDetails(event) {
  const meta = traceMeta[event?.title] || {
    phase: event?.type === 'human' ? 'Human' : 'Observe',
    owner: event?.type === 'human' ? 'Facilitator' : 'Page tool',
    why: 'Make the exercise state visible and reviewable.',
    change: 'The visible exercise state was read.',
    boundary: 'Training data only. No hidden side effect.',
  };
  return { ...meta, outcome: event?.detail || 'Waiting for the first page action.' };
}

function renderConversation() {
  const target = $('#conversationHistory');
  if (!target) return;
  target.innerHTML = conversation.slice(-6).map((turn) => `<article class="conversation-turn ${turn.role}">
    <span>${turn.role === 'assistant' ? 'IC' : 'You'}</span><p>${escapeHtml(turn.text)}</p>
  </article>`).join('');
  target.scrollTop = target.scrollHeight;
}

function beginConversation(message) {
  conversation.push({ role: 'user', text: message }, { role: 'assistant', text: 'Checking the building file…' });
  pendingAssistant = conversation.length - 1;
  const stateLabel = document.querySelector('.conversation-state');
  if (stateLabel) stateLabel.innerHTML = '<i></i> Working';
  renderConversation();
}

function setAgentMessage(message, specialist = '', targetIndex = pendingAssistant) {
  if (targetIndex === null) {
    conversation.push({ role: 'assistant', text: message });
    targetIndex = conversation.length - 1;
    pendingAssistant = targetIndex;
  } else {
    conversation[targetIndex] = { role: 'assistant', text: message };
  }
  renderConversation();
  document.querySelectorAll('[data-specialist]').forEach((item) => item.classList.toggle('active', item.dataset.specialist === specialist));
  return targetIndex;
}

async function callTool(name, input = {}) {
  const tool = toolDefinitions.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  const specialist = specialistForTool[name];
  const ownsConversationTurn = Boolean(specialist && !managerBusy);
  let targetIndex = pendingAssistant;
  if (specialist && !managerBusy) targetIndex = setAgentMessage(`Routing to ${specialist}. Running ${name.replaceAll('_', ' ')}…`, specialist, targetIndex);
  const activityStart = state.activity.length;
  const startedAt = performance.now();
  document.body.classList.add('tool-working');
  renderOperation();
  try {
    const result = await tool.execute(input);
    if (name === 'start_drill') elapsed = 0;
    if (name === 'send_inject' && input.inject_id === 'stair') elapsed = Math.max(elapsed, 120);
    if (name === 'send_inject' && input.inject_id === 'roster') elapsed = Math.max(elapsed, 240);
    const durationMs = Math.max(1, Math.round(performance.now() - startedAt));
    attachTraceEvidence(name, input, result, durationMs, activityStart);
    maybeAdvanceGuide(name, input);
    persistState();
    if (name === 'record_action' && input.action_id === 'assist') {
      try {
        MusterPeopleData.assignResponder('responder-s-tan', 'office-studio-07', 'task-assistance-handoff');
        MusterPeopleData.movePerson('responder-s-tan', 'office-studio-07', MusterPeopleData.PERSON_STATUSES.ASSISTING);
        peopleState = MusterPeopleData.getPeopleState();
      } catch { /* deterministic fixture can already be assigned */ }
    }
    showToolResult(result);
    if (specialist && !managerBusy) setAgentMessage(summariseToolResult(name, result), specialist, targetIndex);
    render();
    return result;
  } catch (error) {
    showToolResult({ error: error instanceof Error ? error.message : 'Unknown tool error' });
    setAgentMessage('That request could not be completed. The page state was left unchanged.', specialist, targetIndex);
    throw error;
  } finally {
    document.body.classList.remove('tool-working');
    if (ownsConversationTurn && pendingAssistant === targetIndex) pendingAssistant = null;
  }
}

function summariseToolResult(name, result) {
  if (name === 'run_drill_manager') return `Routed “${String(result.intent || 'request').replaceAll('_', ' ')}” through the Incident Commander. Named specialist calls remain visible below.`;
  if (name === 'read_plan') return `${result.occupants} people, ${result.exits.length} exits, and ${result.assisted_occupants} people needing an assigned assistance owner.`;
  if (name === 'start_drill') return 'The drill is live. A scripted smoke signal is now shown beside room 7-E. Record the team response, then advance the scenario.';
  if (name === 'send_inject') return state.injectIds.includes('roster') ? 'The final event is live: two people need assistance, but no owner is assigned. Record who takes responsibility.' : 'Stair B is now unavailable in the exercise. Record the alternate route before continuing.';
  if (name === 'record_action') return `Recorded: ${result.recorded_action?.label || 'team action'}. The facilitator remains responsible for confirming what actually happened.`;
  if (name === 'check_coverage') return result.unresolved.length ? `${result.unresolved.length} active responsibility gap${result.unresolved.length === 1 ? '' : 's'} still need an owner.` : 'Every active exercise problem has a recorded owner.';
  if (name === 'stage_report') return 'The after-action draft is ready. A human Fire Safety Manager must approve it.';
  if (name === 'inspect_zone') return `${result.zone}: ${result.fixture_occupants} fixture occupants, ${result.plan_distance_metres} m to ${result.nearest_plan_exit}.`;
  if (name === 'analyze_route_sketch') return `${result.estimated_plan_metres} m drawn route. ${result.review}`;
  if (name === 'read_floor_register') return `${BUILDING.occupants} people are listed in this fictional exercise register. It is not a live sensor count.`;
  if (name === 'read_equipment') return `${result.equipment.length} planned items are listed. Open the Equipment desk to see locations and inspection fixtures.`;
  if (name === 'read_status_board') return 'The exercise status is based only on facilitator-recorded actions; Muster does not infer real clearance.';
  return `${name.replaceAll('_', ' ')} completed. The result is visible in the live trace.`;
}

async function runManagerIntent(intent, zoneId = 'studio') {
  if (managerBusy) return { status: 'busy', training_only: true, external_effects: false };
  managerBusy = true;
  try {
    if (intent === 'orient') {
      setAgentMessage('Plan specialist is reading the floor and occupancy register…', 'plan');
      const plan = await callTool('read_plan');
      const register = await callTool('read_floor_register');
      setAgentMessage(`${plan.occupants} people are on the fixture. Two exits are shown; ${register.assistance_owner ? 'assistance has an owner' : 'the assistance role is still unassigned'}.`, 'plan');
      return { intent, plan, register, manager: 'incident_commander', training_only: true, external_effects: false };
    }
    if (intent === 'find_gaps') {
      setAgentMessage('People specialist is checking roles against the active exercise…', 'people');
      const register = await callTool('read_floor_register');
      const coverage = await callTool('check_coverage');
      const gapCount = coverage.unresolved.length + (register.assistance_owner ? 0 : 1);
      setAgentMessage(gapCount ? `${gapCount} visible coverage gap${gapCount === 1 ? ' needs' : 's need'} a named owner. I will not infer intent or competence.` : 'No visible ownership gaps remain in this exercise.', 'people');
      return { intent, visible_gap_count: gapCount, register, coverage, manager: 'incident_commander', training_only: true, external_effects: false };
    }
    if (intent === 'inspect_equipment') {
      setAgentMessage('Equipment specialist is checking the plan inventory…', 'equipment');
      const result = await callTool('read_equipment');
      setAgentMessage(`${result.equipment.length} items are shown on the fictional plan. Their presence does not certify serviceability or adequacy.`, 'equipment');
      if (!$('#dossierDialog').open) $('#dossierDialog').showModal();
      return { intent, result, manager: 'incident_commander', training_only: true, external_effects: false };
    }
    if (intent === 'read_history') {
      setAgentMessage('Review specialist is reading the dated exercise lessons…', 'review');
      const result = await callTool('read_lessons');
      setAgentMessage(`${result.lessons.length} fictional learning records are in the file. The latest lesson is: ${result.lessons[0].finding}`, 'review');
      if (!$('#dossierDialog').open) $('#dossierDialog').showModal();
      return { intent, result, manager: 'incident_commander', training_only: true, external_effects: false };
    }
    if (intent === 'read_status') {
      setAgentMessage('People specialist is reconciling the facilitator records…', 'people');
      const result = await callTool('read_status_board');
      const recorded = [result.fixture_accounting_recorded, result.alternate_route_recorded, result.assistance_owner_recorded].filter(Boolean).length;
      setAgentMessage(`${recorded} of 3 exercise records are complete. Muster never claims real floor clearance.`, 'people');
      return { intent, result, manager: 'incident_commander', training_only: true, external_effects: false };
    }
    if (intent === 'inspect_zone') {
      const safeZone = ['west', 'east', 'meeting', 'studio', 'lobby', 'electrical'].includes(zoneId) ? zoneId : 'studio';
      setAgentMessage(`Plan specialist is inspecting ${safeZone}…`, 'plan');
      const result = await callTool('inspect_zone', { zone_id: safeZone });
      setAgentMessage(`${result.zone} has ${result.fixture_occupants} fixture occupants and is ${result.plan_distance_metres} m from ${result.nearest_plan_exit}.`, 'plan');
      return { intent, result, manager: 'incident_commander', training_only: true, external_effects: false };
    }
    if (intent === 'rehearse') {
      setAgentMessage('Opening guided mode. Each tool waits for your next decision.', 'plan');
      await runGuidedRehearsal();
      return { intent, status: 'guided-mode-ready', next_tool: 'read_plan', manager: 'incident_commander', human_approval_required: true, external_effects: false };
    }
    if (intent === 'prepare_review') {
      setAgentMessage('Review specialist is checking the recorded actions…', 'review');
      const coverage = await callTool('check_coverage');
      if (coverage.unresolved.length) {
        setAgentMessage(`${coverage.unresolved.length} responsibility gap${coverage.unresolved.length === 1 ? '' : 's'} block review. Assign them in the exercise first.`, 'review');
        return { intent, staged: false, coverage, manager: 'incident_commander', external_effects: false };
      }
      const report = await callTool('stage_report');
      setAgentMessage('Review draft prepared. Human approval is still required.', 'review');
      return { intent, staged: true, report, manager: 'incident_commander', human_approval_required: true, external_effects: false };
    }
    throw new Error('Unknown manager intent');
  } finally {
    managerBusy = false;
    pendingAssistant = null;
    renderRuntime();
    renderStatus();
  }
}

function renderTimeline() {
  const ordered = ['smoke', 'stair', 'roster'];
  $('#timeline').innerHTML = ordered.map((id) => {
    const inject = INJECTS[id];
    const active = state.injectIds.includes(id);
    return `<li class="${active ? 'active' : ''} ${active && inject.severity === 'critical' ? 'critical' : ''}">
      <time>${inject.at}</time><strong>${inject.title}</strong><p>${inject.detail}</p>
    </li>`;
  }).join('');
}

function renderScenarioSequence() {
  const container = $('#scenarioSequence');
  if (!container) return;
  container.hidden = selectedFloor !== 7;
  if (container.hidden) return;

  const stairBlocked = state.injectIds.includes('stair');
  const rosterGap = state.injectIds.includes('roster');
  const routeRecorded = state.decisions.some((item) => item.actionId === 'reroute');
  const assistanceAssigned = state.decisions.some((item) => item.actionId === 'assist');
  const reportStaged = Boolean(state.report);
  const approved = Boolean(state.approved);
  const currentIndex = approved ? 5
    : !planRead ? 0
      : state.status === 'ready' ? 1
        : !stairBlocked || !routeRecorded ? 2
          : !rosterGap || !assistanceAssigned ? 3 : 4;
  const stages = [
    { key: 'plan', label: 'Plan read', detail: 'F07 · revision 04', tone: 'observe' },
    { key: 'signal', label: 'Signal at 7-E', detail: state.status === 'ready' ? 'Waiting for facilitator' : 'Authored scenario only', tone: 'signal' },
    { key: 'route', label: stairBlocked ? 'Stair B unavailable' : 'Route decision', detail: routeRecorded ? 'Stair A recorded' : stairBlocked ? 'Compare both exits' : 'Condition not introduced', tone: stairBlocked && !routeRecorded ? 'alert' : 'route' },
    { key: 'people', label: rosterGap ? 'Assistance owner' : 'People check', detail: assistanceAssigned ? 'Responder pair assigned' : rosterGap ? '2 people need an owner' : 'Register not challenged', tone: rosterGap && !assistanceAssigned ? 'warning' : 'people' },
    { key: 'review', label: reportStaged ? 'Review draft' : 'Human review', detail: approved ? 'Approved by FSM' : reportStaged ? 'Waiting for human' : 'Evidence not staged', tone: 'review' },
  ];

  container.innerHTML = `<header><span>Scenario state</span><strong>${approved ? 'Human-approved record' : `Stage ${Math.min(currentIndex + 1, stages.length)} of ${stages.length}`}</strong></header><ol>${stages.map((stage, index) => {
    const isDone = approved || index < currentIndex;
    const isCurrent = !approved && index === currentIndex;
    return `<li class="${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''} tone-${stage.tone}" data-sequence-stage="${stage.key}" ${isCurrent ? 'aria-current="step"' : ''}><i>${isDone ? '✓' : index + 1}</i><div><strong>${stage.label}</strong><span>${stage.detail}</span></div></li>`;
  }).join('')}</ol>`;
}

const personUi = {
  'responder-a-rahman': { initials: 'AR', role: 'Exercise coordinator', start: [300, 402], portrait: '0% 0%', zone: 'meeting' },
  'responder-mei-lin': { initials: 'ML', role: 'Accounting lead', start: [338, 232], portrait: '100% 0%', zone: 'lobby' },
  'responder-d-kumar': { initials: 'DK', role: 'East room-check lead', start: [618, 322], portrait: '0% 100%', zone: 'east' },
  'responder-s-tan': { initials: 'ST', role: 'West room-check lead', start: [276, 326], portrait: '100% 100%', zone: 'west' },
};

const occupantUi = [
  { id: 'group-west', label: 'West workplace', count: 29, assisted: 0, point: [156, 282], zone: 'west' },
  { id: 'group-east', label: 'East workplace', count: 39, assisted: 0, point: [744, 282], zone: 'east' },
  { id: 'group-meeting', label: 'Meeting suite', count: 8, assisted: 0, point: [174, 418], zone: 'meeting' },
  { id: 'group-studio', label: 'Studio', count: 6, assisted: 2, point: [700, 404], zone: 'studio' },
  { id: 'group-lobby', label: 'Lift lobby', count: 2, assisted: 0, point: [450, 164], zone: 'lobby' },
];

function renderPeopleLayer() {
  const layer = $('#peopleLayer');
  if (!layer) return;
  if (selectedFloor !== 7) {
    layer.innerHTML = '';
    return;
  }
  const responders = MusterPeopleData.FICTIONAL_RESPONDERS.map((base) => peopleState.find((person) => person.id === base.id) || base);
  const assistanceAssigned = state.decisions.some((item) => item.actionId === 'assist');
  const responderMarkup = responders.map((person) => {
    const ui = personUi[person.id];
    const point = assistanceAssigned && person.id === 'responder-s-tan' ? [665, 420] : ui.start;
    return `<g class="person-marker ${person.status === MusterPeopleData.PERSON_STATUSES.ASSISTING ? 'active' : ''}" data-person-id="${person.id}" tabindex="0" role="button" aria-label="Open ${person.displayName}, ${ui.role}" transform="translate(${point[0]} ${point[1]})">
      <circle r="13"></circle><circle r="8"></circle><text y="2.5">${ui.initials}</text><title>${person.displayName} · ${ui.role}</title>
    </g>`;
  }).join('');
  const occupants = occupantUi.map((group) => `<g class="occupant-marker ${group.assisted ? 'assisted' : ''}" data-occupant-group="${group.id}" tabindex="0" role="button" aria-label="Open ${group.label} group" transform="translate(${group.point[0]} ${group.point[1]})">
    <circle r="12"></circle><text y="3">${group.count}</text><title>${group.label} · ${group.count} fictional occupants</title>
  </g>`).join('');
  layer.innerHTML = occupants + responderMarkup;
  layer.querySelectorAll('[data-person-id]').forEach((marker) => {
    const open = () => openPerson(marker.dataset.personId);
    marker.addEventListener('click', open);
    marker.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') open(); });
  });
  layer.querySelectorAll('[data-occupant-group]').forEach((marker) => {
    const open = () => openOccupantGroup(marker.dataset.occupantGroup);
    marker.addEventListener('click', open);
    marker.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') open(); });
  });
}

function openPerson(personId) {
  const person = peopleState.find((candidate) => candidate.id === personId) || MusterPeopleData.FICTIONAL_RESPONDERS.find((candidate) => candidate.id === personId);
  const ui = personUi[personId];
  if (!person || !ui) return;
  const task = MusterPeopleData.RESPONSE_TASKS.find((candidate) => candidate.id === person.taskId);
  const roomName = MusterPeopleData.FLOOR_ARCHETYPES.flatMap((floor) => floor.rooms).find((room) => room.id === person.roomId)?.name || 'Transition point';
  $('#personCard').innerHTML = `<div class="person-card-hero"><div class="person-portrait" style="--portrait-url:url('assets/people/fictional-response-team.png');--portrait-position:${ui.portrait}"></div><div><span>Fictional exercise profile</span><strong>${person.displayName}</strong><small>${ui.role}</small></div></div>
    <div class="person-card-body"><div class="person-facts"><div><span>Current position</span><strong>${roomName}</strong></div><div><span>Status</span><strong>${person.status.replaceAll('-', ' ')}</strong></div><div><span>Assigned task</span><strong>${task?.label || 'Room-check rehearsal'}</strong></div><div><span>Authority</span><strong>Facilitator-confirmed actions only</strong></div></div>
    <div class="person-actions"><button class="secondary-button" type="button" data-person-focus="${ui.zone}">Focus on room</button><button class="primary-button" type="button" data-person-move="${person.id}">Move to Studio</button></div><p class="person-boundary">This is a fictional rehearsal identity. Moving the marker changes only this page; it does not dispatch or track a real person.</p></div>`;
  $('#personDialog').showModal();
  $('#personCard').querySelector('[data-person-focus]').addEventListener('click', () => {
    $('#personDialog').close();
    setSpatialMode('floor');
    focusFloorZone(ui.zone);
  });
  $('#personCard').querySelector('[data-person-move]').addEventListener('click', () => {
    try {
      MusterPeopleData.movePerson(person.id, 'office-studio-07', MusterPeopleData.PERSON_STATUSES.MOVING);
      peopleState = MusterPeopleData.getPeopleState();
      state = { ...state, activity: [...state.activity, { type: 'human', title: 'Facilitator moved responder', detail: `${person.displayName} marker moved to Studio`, input: { person_id: person.id, room_id: 'office-studio-07' }, output: { status: 'moving', external_effects: false }, durationMs: 0, at: `T+${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}` }] };
      saveAndRender();
      $('#personDialog').close();
    } catch (error) { showToolResult({ error: error.message }); }
  });
}

function openOccupantGroup(groupId) {
  const group = occupantUi.find((candidate) => candidate.id === groupId);
  if (!group) return;
  $('#personCard').innerHTML = `<div class="person-card-hero"><div class="crew-member-avatar" aria-hidden="true">${group.count}</div><div><span>Aggregate training fixture</span><strong>${group.label}</strong><small>${group.count} fictional occupants</small></div></div>
    <div class="person-card-body"><div class="person-facts"><div><span>Zone count</span><strong>${group.count} fixture occupants</strong></div><div><span>Assistance register</span><strong>${group.assisted ? `${group.assisted} people need an owner` : 'No assistance flag in fixture'}</strong></div><div><span>Nearest plan exit</span><strong>${ZONES[group.zone].nearestExit}</strong></div><div><span>Plan distance</span><strong>${ZONES[group.zone].distanceM} m</strong></div></div>
    <div class="person-actions"><button class="primary-button" type="button" data-group-inspect="${group.zone}">Inspect this zone</button></div><p class="person-boundary">Aggregate fictional data only. Muster does not identify, locate, or infer the status of real occupants.</p></div>`;
  $('#personDialog').showModal();
  $('#personCard').querySelector('[data-group-inspect]').addEventListener('click', () => {
    $('#personDialog').close();
    beginConversation(`Inspect ${group.label}`);
    callTool('inspect_zone', { zone_id: group.zone }).catch(() => {});
  });
}

function renderCrew() {
  const assistanceAssigned = state.decisions.some((item) => item.actionId === 'assist');
  $('#crewStrip').innerHTML = BUILDING.roles.map((role) => {
    const resolved = role.id === 'mobility' && assistanceAssigned;
    const person = resolved ? ACTIONS.assist.owner : role.person;
    const personId = { fsm: 'responder-a-rahman', security: 'responder-mei-lin', 'warden-east': 'responder-d-kumar', 'warden-west': 'responder-s-tan', mobility: 'responder-s-tan' }[role.id];
    const ui = personUi[personId];
    const photo = person ? `has-photo` : '';
    return `<button type="button" class="crew-member ${person ? '' : 'missing'}" ${personId ? `data-person-id="${personId}"` : ''}><span class="crew-member-avatar ${photo}" style="--portrait-url:url('assets/people/fictional-response-team.png');--portrait-position:${ui?.portrait || '0% 0%'}">${ui?.initials || '?'}</span><span class="crew-member-copy"><span>${role.label}</span><strong>${person || 'Unassigned'}</strong><small>${person ? (resolved ? 'Assigned during exercise' : 'Ready') : 'Gap in roster'}</small></span></button>`;
  }).join('');
  $('#crewStrip').querySelectorAll('[data-person-id]').forEach((button) => button.addEventListener('click', () => openPerson(button.dataset.personId)));
  renderPeopleLayer();
}

function renderDossier() {
  document.querySelectorAll('[data-dossier-view]').forEach((button) => {
    button.classList.toggle('active', button.dataset.dossierView === dossierView);
  });
  const panel = $('#dossierContent');
  if (dossierView === 'context') {
    panel.innerHTML = `<div class="site-context-grid">
      <div class="site-sketch" aria-label="Fictional site context sketch">
        <div class="site-road north-road">North civic court · assembly A</div>
        <div class="site-building"><span>Meridian Exchange</span><strong>18 storeys</strong><i></i></div>
        <div class="site-neighbour retail">Retail podium</div><div class="site-neighbour office">Adjacent office</div>
        <div class="site-road south-road">South service road · appliance access to verify</div>
        <svg viewBox="0 0 420 210" aria-hidden="true"><path d="M210 172C210 145 214 126 212 104"/><circle cx="210" cy="176" r="4"/><circle cx="212" cy="100" r="4"/></svg>
      </div>
      <div class="context-ledger">
        <article><span>Observed in scenario</span><strong>Detector signal beside room 7-E</strong><p>Scripted exercise input, not a sensor event.</p></article>
        <article><span>Cause status</span><strong>Unknown</strong><p>The agent does not convert proximity into a cause.</p></article>
        <article><span>Operational constraint</span><strong>Stair B may be removed by inject</strong><p>The facilitator records the team’s response.</p></article>
        <article><span>Location boundary</span><strong>No live map or station availability</strong><p>Use an approved site plan before operational use.</p></article>
      </div>
    </div>`;
  } else if (dossierView === 'rooms') {
    panel.innerHTML = `<div class="room-grid">${Object.entries(ROOM_PROFILES).map(([id, room]) => {
      const zone = ZONES[id];
      return `<button type="button" class="room-profile ${state.focusZone === id ? 'active' : ''}" data-room-profile="${id}"><span>${zone.label}</span><strong>${room.use}</strong><small>${zone.occupants} fixture occupants · ${zone.distanceM} m plan distance</small><p>${room.fuelNote}</p></button>`;
    }).join('')}</div>`;
    panel.querySelectorAll('[data-room-profile]').forEach((button) => button.addEventListener('click', () => callTool('read_room_profile', { room_id: button.dataset.roomProfile })));
  } else if (dossierView === 'equipment') {
    panel.innerHTML = `<div class="equipment-head"><p>Plan symbols are inventory context, not evidence of serviceability or adequacy.</p><strong>Professional review required</strong></div><div class="equipment-table">${EQUIPMENT.map((item) => `<article><code>${item.id}</code><div><strong>${item.type}</strong><span>${item.room}</span></div><div><span>Plan</span><strong>${item.planStatus}</strong></div><div><span>Inspection</span><strong>${item.inspection}</strong></div></article>`).join('')}</div>`;
  } else if (dossierView === 'people') {
    const signals = state.humanSignals.length
      ? state.humanSignals.map((item) => `<li><time>${item.recordedAt}</time><strong>${item.role}</strong><span>${item.signal}</span></li>`).join('')
      : '<li class="empty-signal">No participant signal recorded. Silence is not agreement.</li>';
    panel.innerHTML = `<div class="people-layout"><div class="role-matrix">${BUILDING.roles.map((role) => `<article><span>${role.label}</span><strong>${role.person || 'Unassigned'}</strong><small>${role.person ? 'Named exercise role' : 'Coverage gap'}</small></article>`).join('')}</div><div class="signal-console"><span class="eyebrow">Facilitator observation</span><h3>Record what happened—not why.</h3><div class="signal-controls"><select id="signalRole" aria-label="Participant role">${BUILDING.roles.map((role) => `<option value="${role.id}">${role.label}</option>`).join('')}</select><select id="signalType" aria-label="Observed signal"><option value="confirms">Confirms</option><option value="uncertain">Uncertain</option><option value="disagrees">Disagrees</option><option value="delayed">Delayed response</option></select><button class="secondary-button" id="signalButton" type="button">Record observation</button></div><ul class="signal-list">${signals}</ul><p class="privacy-line">No personality, emotion, intention or competence inference.</p></div></div>`;
    $('#signalButton').addEventListener('click', () => callTool('record_human_signal', { role_id: $('#signalRole').value, signal: $('#signalType').value }));
  } else {
    panel.innerHTML = `<div class="lesson-timeline">${LESSONS.map((lesson, index) => `<article><time>${lesson.date}</time><div><span>${lesson.source}</span><strong>${lesson.finding}</strong><p>${lesson.change}</p></div><b>0${index + 1}</b></article>`).join('')}</div>`;
  }
}

function renderActions() {
  $('#actionsPanel').hidden = state.status === 'ready';
  const available = [];
  if (state.injectIds.includes('smoke')) available.push('account');
  if (state.injectIds.includes('stair')) available.push('reroute');
  if (state.injectIds.includes('roster')) available.push('assist');
  $('#actionList').innerHTML = available.map((id) => {
    const action = ACTIONS[id];
    const recorded = state.decisions.some((item) => item.actionId === id);
    return `<button class="action-button ${recorded ? 'recorded' : ''}" type="button" data-action-id="${id}" ${recorded || state.status !== 'running' ? 'disabled' : ''}>
      <span><strong>${action.label}</strong><small>${action.owner}</small></span><span>${recorded ? 'Recorded' : 'Add'}</span>
    </button>`;
  }).join('');
  document.querySelectorAll('[data-action-id]').forEach((button) => {
    button.addEventListener('click', () => callTool('record_action', { action_id: button.dataset.actionId }));
  });
}

function renderCoverage() {
  const coverage = checkCoverage(state);
  const panel = $('#coveragePanel');
  const shouldShow = state.injectIds.length > 1 || state.status === 'review' || state.status === 'complete';
  panel.hidden = !shouldShow;
  if (!shouldShow) return;
  panel.className = `coverage-panel ${coverage.unresolved.length ? 'gap' : 'clear'}`;
  panel.innerHTML = coverage.unresolved.length
    ? `<strong>${coverage.unresolved.length} responsibility gap${coverage.unresolved.length > 1 ? 's' : ''}</strong><p>${coverage.unresolved.map((gap) => gap.label).join(' ')}</p>`
    : '<strong>Every active inject has an owner</strong><p>The facilitator can now prepare the after-action draft.</p>';
}

function renderReport() {
  const panel = $('#reportPanel');
  panel.hidden = !state.report;
  if (!state.report) return;
  const ready = state.report.unresolved.length === 0;
  const decisionRows = state.decisions.length
    ? state.decisions.map((decision) => `<li><i>✓</i><div><strong>${ACTIONS[decision.actionId].label}</strong><span>${decision.owner} · ${decision.recordedAt}</span></div></li>`).join('')
    : '<li><i>!</i><div><strong>No response recorded</strong><span>Return to the exercise before approval.</span></div></li>';
  const coveredCount = Math.max(0, state.report.injects - state.report.unresolved.length);
  const routeEvidence = lastRouteResult
    ? `${lastRouteResult.estimated_plan_metres} m sketch · ${lastRouteResult.endpoint_reaches_exit ? 'reaches' : 'stops before'} ${lastRouteResult.endpoint_nearest_exit} · ${lastRouteResult.endpoint_exit_available ? 'available in scenario' : 'unavailable in scenario'}`
    : 'No facilitator sketch attached';
  panel.innerHTML = `<div class="report-sheet ${state.approved ? 'approved' : ''}">
    <header class="report-head"><div><span class="eyebrow">${state.report.id}</span><h3>${state.report.title}</h3></div><span class="report-status">${state.approved ? 'Human approved' : ready ? 'Ready for human review' : 'Action required'}</span></header>
    <div class="report-hero"><div class="readiness-dial" style="--score:${Math.round((coveredCount / Math.max(1, state.report.injects)) * 360)}deg"><strong>${coveredCount}/${state.report.injects}</strong><span>owned</span></div><div><strong>${ready ? 'Every active exercise problem has an owner.' : `${state.report.unresolved.length} responsibility gap remains.`}</strong><p>${ready ? 'This is ownership coverage, not a safety or readiness score. A Fire Safety Manager still evaluates the evidence.' : 'The unresolved item is preserved instead of being hidden or auto-completed.'}</p></div></div>
    <div class="report-context"><div><span>Evaluator</span><strong>${escapeHtml(state.report.evaluator)}</strong></div><div><span>Objective</span><strong>${escapeHtml(state.report.objective)}</strong></div><div><span>Plan basis</span><strong>F07 · revision 04</strong></div><div><span>Route evidence</span><strong>${escapeHtml(routeEvidence)}</strong></div></div>
    <div class="report-comparison"><section><span>Expected</span>${state.report.expected.map((item) => `<p>${escapeHtml(item)}</p>`).join('')}</section><section><span>Observed</span>${state.report.observed.length ? state.report.observed.map((item) => `<p><b>${escapeHtml(item.recordedAt)}</b> ${escapeHtml(ACTIONS[item.actionId].label)} · ${escapeHtml(item.owner)}</p>`).join('') : '<p>No facilitator-confirmed actions recorded.</p>'}</section></div>
    <ul class="report-decisions">${decisionRows}</ul>
    <div class="report-stats"><div><strong>${state.report.injects}</strong><span>events</span></div><div><strong>${state.report.decisions}</strong><span>responses</span></div><div><strong>${state.report.observedParticipantSignals}</strong><span>observations</span></div><div><strong>${state.report.unresolved.length}</strong><span>open gaps</span></div></div>
    <div class="approval-row">
      <button class="secondary-button" id="returnButton" type="button">Return to exercise</button>
      <button class="primary-button" id="approveButton" type="button" ${ready && !state.approved ? '' : 'disabled'}>${state.approved ? 'Approved by FSM' : 'Approve report'}</button>
    </div><div class="improvement-plan"><span>Improvement plan</span>${state.report.improvements.map((item) => `<article><strong>${escapeHtml(item.finding)}</strong><p>${escapeHtml(item.owner)} · ${escapeHtml(item.due)} · ${escapeHtml(item.status)}</p><small>Closure evidence: ${escapeHtml(item.closureEvidence)}</small></article>`).join('')}</div>${state.approved ? '<div class="approval-seal"><span>Accepted by</span><strong>Fire Safety Manager</strong><small>human page action · training record</small></div>' : ''}</div>`;
  $('#returnButton').addEventListener('click', () => { state = returnToDrill(state); saveAndRender(); });
  $('#approveButton').addEventListener('click', () => {
    try { state = approveReport(state); saveAndRender(); }
    catch (error) { showToolResult({ error: error.message }); }
  });
}

function renderPrompt() {
  const card = $('#promptCard');
  if (state.status === 'ready') {
    card.innerHTML = `<span class="prompt-number">01</span><div><small>Before the clock starts</small><h2>${planRead ? 'The plan is in context.' : 'Let the agent read this plan.'}</h2><p>${planRead ? 'Floor 7 has two exits, two registered occupants needing assistance, and one unassigned role.' : 'It will return only the visible training context: floor, exits, roles, occupants, and plan version.'}</p></div><button class="secondary-button" id="readPlanButton" type="button">${planRead ? 'Read again' : 'Read plan context'}</button>`;
    $('#readPlanButton').addEventListener('click', () => callTool('read_plan'));
  } else if (state.status === 'running') {
    const gap = checkCoverage(state).unresolved.length;
    const promptNumber = String(state.injectIds.length + 1).padStart(2, '0');
    card.innerHTML = `<span class="prompt-number">${promptNumber}</span><div><small>Exercise in progress</small><h2>${gap ? 'A responsibility has no owner.' : 'The team response is being recorded.'}</h2><p>${gap ? 'The agent found a gap in the visible floor register. The facilitator must assign a real exercise role before review.' : 'Send the next scripted inject or record the team action that occurred.'}</p></div><button class="secondary-button" id="coverageButton" type="button">Check action coverage</button>`;
    $('#coverageButton').addEventListener('click', () => callTool('check_coverage'));
  } else {
    card.hidden = true;
    return;
  }
  card.hidden = false;
}

function renderMap() {
  const actionableFloor = selectedFloor === 7;
  const selectedPreset = FLOOR_PRESETS[selectedFloor];
  const hasSmoke = state.injectIds.includes('smoke');
  const stairBlocked = state.injectIds.includes('stair');
  const rosterGap = state.injectIds.includes('roster');
  const assistResolved = state.decisions.some((item) => item.actionId === 'assist');
  const routeRecorded = state.decisions.some((item) => item.actionId === 'reroute');
  $('#hazard').classList.toggle('active', actionableFloor && hasSmoke);
  $('#routeA').classList.toggle('active', actionableFloor && state.status !== 'ready');
  $('#routeB').classList.toggle('active', actionableFloor && state.status !== 'ready');
  $('#routeB').classList.toggle('blocked', actionableFloor && stairBlocked);
  $('#stairB').classList.toggle('blocked', stairBlocked);
  $('#assistance').classList.toggle('active', rosterGap);
  $('#assistance').classList.toggle('resolved', assistResolved);
  const floor = document.querySelector('.floor-wrap');
  floor.classList.toggle('simulation-running', state.status === 'running');
  floor.classList.toggle('simulation-review', state.status === 'review' || state.status === 'complete');
  floor.classList.toggle('story-signal', hasSmoke);
  floor.classList.toggle('story-spread', stairBlocked);
  floor.classList.toggle('story-critical', rosterGap && !assistResolved);
  $('#buildingView').classList.toggle('drill-live', hasSmoke);
  buildingScene?.setSignal(actionableFloor && hasSmoke);
  buildingScene?.setRoutes({ active: actionableFloor && state.status !== 'ready', stairBlocked, resolved: routeRecorded });
  const buildingRouteState = $('#buildingRouteState');
  buildingRouteState.classList.toggle('active', actionableFloor && state.status !== 'ready');
  buildingRouteState.classList.toggle('resolved', routeRecorded);
  buildingRouteState.innerHTML = `<span>Floor 07 paths</span><strong><i></i>Stair A ${routeRecorded ? 'recorded' : 'available'}</strong><strong class="route-state-b ${stairBlocked ? 'blocked' : ''}"><i></i>Stair B ${stairBlocked ? 'unavailable' : 'candidate'}</strong>`;
  const narrative = $('#narrativeCaption');
  narrative.innerHTML = !selectedPreset
    ? `<span>Building context</span><strong>No training plan is loaded for Floor ${String(selectedFloor).padStart(2, '0')}.</strong>`
    : !actionableFloor
    ? `<span>Reference training plan</span><strong>${selectedPreset.code} is available for spatial inspection only.</strong>`
    : rosterGap && !assistResolved
    ? '<span>T+04:00 · authored exercise story</span><strong>Two people still need a named assistance owner.</strong>'
    : stairBlocked
      ? '<span>T+02:00 · authored exercise story</span><strong>Scripted smoke removes Stair B. Compare another path.</strong>'
      : hasSmoke
        ? '<span>T+00:00 · authored exercise story</span><strong>Detector signal appears beside room 7-E.</strong>'
        : '<span>Authored exercise story</span><strong>Plan ready · no active signal</strong>';
  const callout = $('#mapCallout');
  const receipt = $('#routeReceipt');
  receipt.hidden = !actionableFloor || !lastRouteResult;
  if (!receipt.hidden) receipt.innerHTML = `<header><span>Route analysis receipt</span><strong>${lastRouteResult.estimated_plan_metres} m</strong></header><dl><div><dt>Nearest exit</dt><dd>${lastRouteResult.endpoint_nearest_exit}</dd></div><div><dt>Endpoint</dt><dd>${lastRouteResult.endpoint_reaches_exit ? 'Reaches exit' : 'Stops before exit'}</dd></div><div><dt>Availability</dt><dd>${lastRouteResult.endpoint_exit_available ? 'Available in scenario' : 'Unavailable in scenario'}</dd></div><div><dt>Waypoints</dt><dd>${lastRouteResult.waypoint_count}</dd></div></dl><p>${escapeHtml(lastRouteResult.review)} Qualified human review remains required.</p>`;
  const zoneButton = document.querySelector(`[data-zone="${state.focusZone}"]`);
  document.querySelectorAll('[data-zone]').forEach((button) => button.classList.toggle('active', button === zoneButton));
  if (!selectedPreset) {
    callout.innerHTML = `<span>Building context</span><strong>Floor ${String(selectedFloor).padStart(2, '0')}</strong><p>No authored training file is loaded for this floor.</p>`;
  } else if (!actionableFloor) {
    callout.innerHTML = `<span>Reference plan</span><strong>${selectedPreset.code} · ${selectedPreset.label}</strong><p>${selectedPreset.occupants} fictional occupants · ${selectedPreset.assisted} assistance flags. Return to F07 to run the guided drill.</p>`;
  } else if (state.focusZone) {
    const snapshot = inspectZone({ ...state, activity: [] }, state.focusZone).result;
    callout.innerHTML = `<span>Zone fixture</span><strong>${snapshot.zone} · ${snapshot.fixture_occupants} people</strong><p>${snapshot.assisted_occupants ? `${snapshot.assisted_occupants} people need an assigned assistance owner. ` : ''}${snapshot.plan_distance_metres} m to ${snapshot.nearest_plan_exit}. ${snapshot.nearest_exit_blocked_in_scenario ? 'That exit is unavailable in this exercise.' : 'Available in this exercise.'}</p>`;
  } else if (rosterGap && !assistResolved) callout.innerHTML = '<span>Coverage gap</span><strong>Assistance has no owner</strong><p>Two people are listed on the floor register. The facilitator must assign an exercise role.</p>';
  else if (stairBlocked) callout.innerHTML = '<span>Route change</span><strong>Stair B is unavailable</strong><p>Record the team’s alternate route. The exercise does not control doors or alarms.</p>';
  else if (hasSmoke) callout.innerHTML = '<span>Exercise signal</span><strong>Detector at room 7-E</strong><p>This is a fictional inject. The site has not received a live alarm.</p>';
  else callout.innerHTML = '<span>Plan intelligence</span><strong>Two exits available</strong><p>The agent can read routes, roles, and plan revision. It cannot control building systems.</p>';
  renderRouteSketch();
}

function renderControls() {
  const ordered = ['stair', 'roster'];
  const nextId = ordered.find((id) => !state.injectIds.includes(id));
  $('#startButton').disabled = state.status !== 'ready';
  $('#startButton').textContent = !planRead ? '1 · Read the plan' : state.status === 'ready' ? '2 · Start smoke scenario' : 'Scenario started';
  $('#startButton').onclick = state.status === 'ready' ? () => {
    const toolName = planRead ? 'start_drill' : 'read_plan';
    beginConversation(planRead ? 'Start the smoke scenario' : 'Read the Floor 7 plan');
    callTool(toolName).catch(() => {});
  } : null;
  $('#nextInjectButton').disabled = state.status !== 'running' || !nextId;
  $('#nextInjectButton').textContent = nextId ? `Next · ${INJECTS[nextId].title}` : 'All events delivered';
  $('#nextInjectButton').onclick = nextId ? () => {
    beginConversation(`Advance scenario: ${INJECTS[nextId].title}`);
    callTool('send_inject', { inject_id: nextId }).catch(() => {});
  } : null;
  const coverage = checkCoverage(state);
  $('#reportButton').hidden = state.status !== 'running';
  $('#reportButton').disabled = state.status !== 'running' || state.injectIds.length < 2;
  $('#reportButton').textContent = coverage.unresolved.length ? `Prepare report · ${coverage.unresolved.length} gap` : 'Prepare after-action report';
}

function renderPhaseGuide() {
  const coverage = checkCoverage(state);
  const actionCount = state.decisions.length;
  const phase = !planRead ? 0
    : state.status === 'ready' ? 1
      : state.status === 'running' && state.injectIds.length < 2 ? 2
        : state.status === 'running' && (coverage.unresolved.length || actionCount < 3) ? 3 : 4;
  const steps = [
    ['Read the building', 'The agent reads the visible Floor 7 plan and fixture register.'],
    ['Start the scenario', 'A fictional smoke signal appears beside room 7-E.'],
    ['Change one condition', 'Remove an exit or reveal a missing assistance owner.'],
    ['Record the team', 'The facilitator records routes, accounting, and ownership.'],
    ['Review the drill', 'The agent checks gaps; a human approves the final report.'],
  ];
  $('#phaseGuide').innerHTML = `<div class="phase-intro"><span>Mission stage ${Math.min(phase + 1, 5)} of 5</span><strong>${steps[phase][0]}</strong><p>${steps[phase][1]}</p></div><ol>${steps.map(([title], index) => `<li class="${index < phase ? 'done' : index === phase ? 'current' : ''}"><i>${index < phase ? '✓' : index + 1}</i><span>${title}</span></li>`).join('')}</ol>`;
}

function renderGuidedBrief() {
  const container = $('#guidedBrief');
  const step = GUIDED_SEQUENCE[guidedStep];
  const latest = state.activity.at(-1);
  const completed = !step;
  container.classList.toggle('complete', completed);
  container.setAttribute('aria-label', completed ? 'Guided rehearsal complete' : `Guided action ${guidedStep + 1} of ${GUIDED_SEQUENCE.length}`);
  $('#guidedStepIndex').textContent = String(Math.min(guidedStep + 1, GUIDED_SEQUENCE.length)).padStart(2, '0');
  $('#guidedStepTotal').textContent = `of ${GUIDED_SEQUENCE.length}`;
  $('#guidedEyebrow').textContent = completed ? 'Guided rehearsal complete' : `Next page-tool action · ${traceMeta[step.tool]?.phase || 'Next'}`;
  $('#guidedTitle').textContent = completed ? 'The draft is ready for a human' : step.title;
  $('#guidedDescription').textContent = completed
    ? 'Review the evidence below. The agent cannot approve its own report.'
    : `${step.description} Muster stops after this visible change.`;
  $('#guidedChange').innerHTML = latest && latest.title !== 'Exercise loaded'
    ? `<span>Last visible change</span><strong>${escapeHtml(traceDetails(latest).change)}</strong>`
    : `<span>What this step changes</span><strong>${escapeHtml(step?.change || 'No further agent action is required.')}</strong>`;
  const button = $('#guidedNextButton');
  button.textContent = completed ? (state.approved ? 'Approved by a human ✓' : 'Review and approve →') : `${step.button} →`;
  button.disabled = state.approved;
}

async function runGuidedStep() {
  const step = GUIDED_SEQUENCE[guidedStep];
  if (!step) {
    $('#reportPanel').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if (selectedFloor !== 7) selectFloor(7, true);
  beginConversation(step.button);
  try {
    await callTool(step.tool, step.input);
  } catch {
    renderGuidedBrief();
  }
}

function renderStatus() {
  document.body.classList.toggle('scenario-unstarted', state.status === 'ready' && !planRead);
  $('#resumeScenarioButton').textContent = state.status === 'ready' ? 'Start scenario →'
    : state.status === 'review' || state.approved ? 'Review scenario →' : 'Resume scenario →';
  $('#launchScenarioButton').textContent = $('#resumeScenarioButton').textContent;
  const status = $('#statusDot');
  status.className = `status-dot ${state.status}`;
  status.textContent = state.status === 'ready' ? 'Ready' : state.status === 'running' ? 'In exercise' : state.status === 'review' ? 'Review' : 'Complete';
  const latest = state.activity.at(-1);
  $('#lastActivity').textContent = latest ? `${latest.title} · ${latest.detail}` : 'No activity';
  const conversationState = document.querySelector('.conversation-state');
  if (conversationState && !managerBusy) conversationState.innerHTML = `<i></i> ${state.status === 'ready' ? 'Ready' : state.status === 'running' ? 'Drill live' : state.status === 'review' ? 'Review' : 'Complete'}`;
  $('#simulationLabel').textContent = state.status === 'ready' ? 'Simulation idle'
    : state.status === 'running' ? `Scenario live · ${state.injectIds.length} inject${state.injectIds.length === 1 ? '' : 's'}`
      : state.status === 'review' ? 'Simulation paused for review' : 'Exercise complete';
}

function renderOperation() {
  const latest = state.activity.at(-1);
  const details = traceDetails(latest);
  const activePhase = managerBusy ? 'Thinking' : details.phase;
  $('#operationCard').innerHTML = `<div class="operation-signal ${managerBusy ? 'working' : ''}"><i></i><span>${activePhase}</span></div><div><strong>${details.owner}</strong><p>${details.outcome}</p></div><small>${details.boundary}</small>`;
}

function renderRuntime() {
  const panel = $('#runtimeEvents');
  if (!panel) return;
  const visible = state.activity.slice(-7).reverse();
  if (selectedTraceOffset >= visible.length) selectedTraceOffset = 0;
  panel.innerHTML = visible.map((event, index) => `<button type="button" class="runtime-event ${event.type === 'human' ? 'human' : ''} ${index === selectedTraceOffset ? 'selected' : ''}" data-trace-offset="${index}">
    <i></i><div><strong>${friendlyToolNames[event.title] || event.title.replaceAll('_', ' ')}</strong><span>${event.detail}</span></div><time>${event.durationMs === undefined ? traceDetails(event).phase : `${event.durationMs} ms`}</time>
  </button>`).join('');
  panel.querySelectorAll('[data-trace-offset]').forEach((button) => button.addEventListener('click', () => {
    selectedTraceOffset = Number(button.dataset.traceOffset);
    renderRuntime();
  }));
  const selected = visible[selectedTraceOffset] || state.activity.at(-1);
  const details = traceDetails(selected);
  const timings = state.activity.filter((event) => Number.isFinite(event.durationMs)).slice(-8);
  const maxDuration = Math.max(1, ...timings.map((event) => event.durationMs));
  const bars = timings.length ? timings.map((event) => `<i title="${event.title} · ${event.durationMs} ms" style="height:${Math.max(4, Math.round((event.durationMs / maxDuration) * 26))}px"></i>`).join('') : '<i style="height:4px"></i>';
  const input = selected?.input === undefined ? {} : selected.input;
  const output = selected?.output === undefined ? { summary: selected?.detail || 'No output yet.' } : selected.output;
  const selectedLabel = friendlyToolNames[selected?.title] || selected?.title?.replaceAll('_', ' ') || 'Exercise state';
  const traceNodes = selected?.type === 'human'
    ? ['Human authority', 'Approval gate', selectedLabel, 'Visible record']
    : selected?.title === 'run_drill_manager'
      ? ['Human request', 'Incident Commander', 'Named specialist calls', 'Visible page']
      : ['Human request', 'Incident Commander', `${details.owner} · ${selectedLabel}`, 'Visible page'];
  const traceGraph = `<div class="trace-orchestration" aria-label="Delegation path for selected call">${traceNodes.map((node, index) => `<span class="${index === traceNodes.length - 1 ? 'output' : ''}">${escapeHtml(node)}</span>`).join('')}</div>`;
  $('#traceInspector').innerHTML = `${traceGraph}<div><span>Why this call</span><strong>${details.why}</strong></div><div><span>Visible change</span><strong>${details.change}</strong></div><div class="trace-payload"><div><span>Input</span><pre>${escapeHtml(JSON.stringify(input, null, 2))}</pre></div><div><span>Output</span><pre>${escapeHtml(JSON.stringify(output, null, 2))}</pre></div></div><div class="trace-bars" aria-label="Recent tool duration chart">${bars}</div><p>${details.boundary}</p>`;
}

function render() {
  renderTimeline();
  renderCrew();
  renderDossier();
  renderActions();
  renderCoverage();
  renderReport();
  renderPrompt();
  renderMap();
  renderControls();
  renderScenarioSequence();
  renderPhaseGuide();
  renderGuidedBrief();
  renderStatus();
  renderOperation();
  renderRuntime();
  renderConversation();
  if ($('#toolDialog')?.open) renderToolList();
}

function startClock() {
  if (timer || state.status === 'ready') return;
  $('#exerciseClock').textContent = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  timer = setInterval(() => {
    elapsed += 1;
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    $('#exerciseClock').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    if (elapsed % 5 === 0) persistState();
    if (state.status === 'complete') { clearInterval(timer); timer = null; }
  }, 1000);
}

async function registerWebMCP() {
  $('#toolCount').textContent = String(toolDefinitions.length);
  if (!document.modelContext || typeof document.modelContext.registerTool !== 'function') {
    $('#toolCount').title = 'WebMCP is unavailable in this browser; manual rehearsal remains available.';
    $('#runtimeConnection').innerHTML = '<i></i> Manual mode';
    return;
  }
  for (const tool of toolDefinitions) {
    await document.modelContext.registerTool({
      ...tool,
      execute: async (input) => callTool(tool.name, normaliseToolInput(input)),
    });
  }
  $('#runtimeConnection').classList.add('live');
  $('#runtimeConnection').innerHTML = '<i></i> WebMCP live';
  logTool('WebMCP ready', `${toolDefinitions.length} tools registered in this tab`);
  render();
}

async function runGuidedRehearsal() {
  localStorage.removeItem(STORAGE_KEY);
  state = createInitialState();
  peopleState = MusterPeopleData.resetPeopleState();
  planRead = false;
  guidedStep = 0;
  elapsed = 0;
  if (timer) { clearInterval(timer); timer = null; }
  $('#exerciseClock').textContent = '00:00';
  $('#toolDialog').close();
  selectFloor(7);
  setSpatialMode('building');
  conversation = [{ role: 'assistant', text: 'We will rehearse one decision at a time. First, let me read the visible Floor 7 plan.' }];
  render();
  $('#guidedBrief').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toolPreset(toolName) {
  const nextInject = ['stair', 'roster'].find((id) => !state.injectIds.includes(id)) || 'roster';
  const nextAction = state.injectIds.includes('roster') && !state.decisions.some((item) => item.actionId === 'assist') ? 'assist'
    : state.injectIds.includes('stair') && !state.decisions.some((item) => item.actionId === 'reroute') ? 'reroute' : 'account';
  return {
    run_drill_manager: { intent: 'orient' }, read_plan: {}, start_drill: {}, send_inject: { inject_id: nextInject }, record_action: { action_id: nextAction }, check_coverage: {}, stage_report: {},
    inspect_zone: { zone_id: 'studio' }, compare_routes: { zone_id: 'studio' }, analyze_route_sketch: { zone_id: 'studio', points: [{ x: 704, y: 397 }, { x: 704, y: 330 }, { x: 637, y: 330 }, { x: 520, y: 420 }, { x: 205, y: 479 }] },
    read_drill_guide: { phase: 'before' }, read_hazard: {}, read_floor_register: {}, read_status_board: {}, read_site_context: {}, read_room_profile: { room_id: 'studio' }, read_equipment: {}, read_lessons: {}, record_human_signal: { role_id: 'security', signal: 'uncertain' },
  }[toolName] || {};
}

function toolCanRun(toolName) {
  if (toolName === 'start_drill') return state.status === 'ready';
  if (toolName === 'send_inject' || toolName === 'record_action') return state.status === 'running';
  if (toolName === 'stage_report') return state.status === 'running' && state.injectIds.length > 1;
  return true;
}

function renderToolList() {
  $('#toolList').innerHTML = toolDefinitions.map((tool) => {
    const specialist = specialistForTool[tool.name] || 'manager';
    const mode = tool.annotations?.readOnlyHint ? 'read only' : 'changes page fixture';
    return `<article class="tool-item ${tool.name === selectedToolName ? 'selected' : ''}" data-tool-card="${tool.name}" tabindex="0"><code>${tool.name}</code><p>${tool.description}</p><div class="tool-meta"><span>${specialist} · ${mode}</span><button type="button" data-tool-run="${tool.name}" ${toolCanRun(tool.name) ? '' : 'disabled'}>Run on fixture</button></div></article>`;
  }).join('');
  $('#toolList').querySelectorAll('[data-tool-card]').forEach((card) => {
    const inspect = (event) => {
      if (event.target.closest('[data-tool-run]')) return;
      selectedToolName = card.dataset.toolCard;
      const tool = toolDefinitions.find((candidate) => candidate.name === selectedToolName);
      showToolResult({ tool: tool.name, purpose: tool.description, example_input: toolPreset(tool.name), visible_effect: traceMeta[tool.name]?.change || 'Returns visible page context.', boundary: traceMeta[tool.name]?.boundary || 'Training fixture only.' });
      renderToolList();
    };
    card.addEventListener('click', inspect);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); inspect(event); }
    });
  });
  $('#toolList').querySelectorAll('[data-tool-run]').forEach((button) => button.addEventListener('click', () => {
    selectedToolName = button.dataset.toolRun;
    beginConversation(`Run ${friendlyToolNames[selectedToolName] || selectedToolName}`);
    callTool(selectedToolName, toolPreset(selectedToolName)).catch(() => {});
  }));
}

function setupSpatialInteractions() {
  renderTower();
  buildingScene = initBuildingScene($('#buildingCanvas'), {
    onFloorSelect: (floor) => selectFloor(floor),
    onSiteSelect: (pointId) => selectSitePoint(pointId),
  });
  $('#buildingViewport').classList.toggle('webgl-ready', Boolean(buildingScene));
  selectFloor(7);
  applyOrbit();
  applyFloorView();

  const openFloor = () => {
    if (!FLOOR_PRESETS[selectedFloor]) return;
    setSpatialMode('floor');
    if (selectedFloor === 7 && !planRead) {
      beginConversation('Read the Floor 7 plan');
      callTool('read_plan').catch(() => {});
    }
  };
  $('#enterFloorButton').addEventListener('click', openFloor);
  let scenarioOpening = false;
  $('#launchScenarioButton').addEventListener('click', () => $('#resumeScenarioButton').click());
  $('#resumeScenarioButton').addEventListener('click', async () => {
    if (scenarioOpening) return;
    scenarioOpening = true;
    $('#resumeScenarioButton').disabled = true;
    $('#launchScenarioButton').disabled = true;
    try {
      selectFloor(7, true);
      if (state.status === 'ready') {
        beginConversation('Start the Floor 07 scenario');
        if (!planRead) await callTool('read_plan');
        await callTool('start_drill');
      }
      setSpatialMode('floor');
      render();
      const target = state.status === 'review' || state.approved ? $('#reportPanel') : $('#floorView');
      target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    } catch (error) {
      $('#buildingStatus').textContent = `Could not open the scenario: ${error.message}. Your progress is kept.`;
    } finally {
      scenarioOpening = false;
      $('#resumeScenarioButton').disabled = false;
      $('#launchScenarioButton').disabled = false;
    }
  });
  $('#floorMode').addEventListener('click', openFloor);
  $('#buildingMode').addEventListener('click', () => setSpatialMode('building'));
  $('#backToBuilding').addEventListener('click', () => setSpatialMode('building'));
  $('#orbitLeft').addEventListener('click', () => { orbit.z -= 12; applyOrbit(); });
  $('#orbitRight').addEventListener('click', () => { orbit.z += 12; applyOrbit(); });
  $('#orbitReset').addEventListener('click', resetOrbit);

  const building = $('#buildingViewport');
  building.addEventListener('click', (event) => {
    const point = event.target.closest('[data-site-point]');
    if (point) selectSitePoint(point.dataset.sitePoint);
  });
  let orbitDrag = null;
  building.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button')) return;
    orbitDrag = { x: event.clientX, y: event.clientY, startX: orbit.x, startZ: orbit.z };
    building.setPointerCapture(event.pointerId);
    building.classList.add('dragging');
  });
  building.addEventListener('pointermove', (event) => {
    if (!orbitDrag) return;
    orbit.z = orbitDrag.startZ + (event.clientX - orbitDrag.x) * .22;
    orbit.x = Math.max(42, Math.min(76, orbitDrag.startX - (event.clientY - orbitDrag.y) * .12));
    applyOrbit();
  });
  const endOrbit = (event) => {
    if (orbitDrag && Math.hypot(event.clientX - orbitDrag.x, event.clientY - orbitDrag.y) < 5) {
      buildingScene?.pick(event.clientX, event.clientY);
    }
    orbitDrag = null;
    building.classList.remove('dragging');
  };
  building.addEventListener('pointerup', endOrbit);
  building.addEventListener('pointercancel', endOrbit);
  building.addEventListener('wheel', (event) => {
    event.preventDefault();
    orbit.scale = Math.max(.72, Math.min(1.32, orbit.scale - Math.sign(event.deltaY) * .08));
    applyOrbit();
  }, { passive: false });

  const floor = $('#floorViewport');
  let panDrag = null;
  floor.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    if (routeDrawMode) {
      routeDrawing = true;
      routePoints = [svgPoint(event)];
      floor.setPointerCapture(event.pointerId);
      floor.classList.add('drawing');
      renderRouteSketch();
      return;
    }
    if (event.target.closest('[data-floor-zone]')) return;
    panDrag = { x: event.clientX, y: event.clientY, startX: floorView.x, startY: floorView.y };
    floor.setPointerCapture(event.pointerId);
    floor.classList.add('dragging');
  });
  floor.addEventListener('pointermove', (event) => {
    if (routeDrawing) {
      const point = svgPoint(event);
      const previous = routePoints.at(-1);
      if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) > 8) {
        routePoints.push(point);
        renderRouteSketch();
      }
      return;
    }
    if (!panDrag) return;
    floorView.x = panDrag.startX + event.clientX - panDrag.x;
    floorView.y = panDrag.startY + event.clientY - panDrag.y;
    applyFloorView();
  });
  const endFloorGesture = (event) => {
    if (routeDrawing) {
      routeDrawing = false;
      floor.classList.remove('drawing');
      if (routePoints.length > 1) {
        const first = routePoints[0];
        const zone = first.x > 568 ? (first.y > 350 ? 'studio' : 'east') : first.x < 330 ? (first.y > 350 ? 'meeting' : 'west') : 'lobby';
        routeDrawMode = false;
        $('#drawRouteButton').classList.remove('active');
        $('#drawRouteButton').textContent = 'Draw another route';
        $('#planGesture').textContent = 'Analyzing the drawn route against the exercise plan…';
        beginConversation(`Analyze my ${zone} route sketch`);
        callTool('analyze_route_sketch', { zone_id: zone, points: routePoints }).then((result) => {
          $('#planGesture').textContent = result.review;
        }).catch(() => { $('#planGesture').textContent = 'The route could not be analyzed.'; });
      }
    }
    panDrag = null;
    window.getSelection()?.removeAllRanges();
    floor.classList.remove('dragging');
    if (event?.pointerId && floor.hasPointerCapture(event.pointerId)) floor.releasePointerCapture(event.pointerId);
  };
  floor.addEventListener('pointerup', endFloorGesture);
  floor.addEventListener('pointercancel', endFloorGesture);
  floor.addEventListener('wheel', (event) => {
    event.preventDefault();
    floorView.scale = Math.max(1, Math.min(2.2, floorView.scale - Math.sign(event.deltaY) * .12));
    applyFloorView();
  }, { passive: false });

  $('#resetPlanView').addEventListener('click', resetFloorView);
  $('#drawRouteButton').addEventListener('click', () => {
    routeDrawMode = !routeDrawMode;
    routePoints = [];
    lastRouteResult = null;
    renderRouteSketch();
    floor.classList.toggle('drawing', routeDrawMode);
    $('#drawRouteButton').classList.toggle('active', routeDrawMode);
    $('#drawRouteButton').textContent = routeDrawMode ? 'Drawing… release to analyze' : 'Draw a route';
    $('#planGesture').textContent = routeDrawMode ? 'Draw from a room to an exit. Release to run the route tool.' : 'Click a room · drag to pan · scroll to zoom';
  });

  document.querySelectorAll('[data-floor-zone]').forEach((hotspot) => hotspot.addEventListener('click', () => {
    if (routeDrawMode) return;
    if (selectedFloor !== 7) return;
    const zone = hotspot.dataset.floorZone;
    beginConversation(`Inspect ${zone}`);
    callTool('inspect_zone', { zone_id: zone }).catch(() => {});
  }));
}

$('#reportButton').addEventListener('click', () => callTool('stage_report'));
$('#resetButton').addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  state = createInitialState(); planRead = false; elapsed = 0;
  if (timer) { clearInterval(timer); timer = null; }
  $('#exerciseClock').textContent = '00:00';
  peopleState = MusterPeopleData.resetPeopleState();
  guidedStep = 0;
  conversation = [{ role: 'assistant', text: 'The exercise is reset. Start with Read the plan; I will wait after every step.' }];
  pendingAssistant = null;
  routePoints = [];
  lastRouteResult = null;
  resetFloorView();
  resetOrbit();
  selectFloor(7);
  setSpatialMode('building');
  showToolResult('No tool called yet.');
  render();
});
$('#toolButton').addEventListener('click', () => $('#toolDialog').showModal());
$('#closeTools').addEventListener('click', () => $('#toolDialog').close());
$('#dossierButton').addEventListener('click', () => $('#dossierDialog').showModal());
$('#closeDossier').addEventListener('click', () => $('#dossierDialog').close());
$('#closePerson').addEventListener('click', () => $('#personDialog').close());
$('#conversationToggle').addEventListener('click', () => {
  const dock = document.querySelector('.conversation-dock');
  const collapsed = dock.classList.toggle('collapsed');
  $('#conversationToggle').textContent = collapsed ? 'Open chat' : 'Collapse';
  $('#conversationToggle').setAttribute('aria-expanded', String(!collapsed));
});
$('#personDialog').addEventListener('click', (event) => { if (event.target === $('#personDialog')) $('#personDialog').close(); });
$('#rehearsalButton').addEventListener('click', runGuidedRehearsal);
$('#guidedNextButton').addEventListener('click', () => runGuidedStep().catch(() => {}));
$('#toolDialog').addEventListener('click', (event) => { if (event.target === $('#toolDialog')) $('#toolDialog').close(); });
$('#dossierDialog').addEventListener('click', (event) => { if (event.target === $('#dossierDialog')) $('#dossierDialog').close(); });
document.querySelectorAll('[data-zone]').forEach((button) => button.addEventListener('click', () => callTool('inspect_zone', { zone_id: button.dataset.zone })));
document.querySelectorAll('[data-dossier-view]').forEach((button) => button.addEventListener('click', () => { dossierView = button.dataset.dossierView; renderDossier(); }));
document.querySelectorAll('[data-agent-prompt]').forEach((button) => button.addEventListener('click', () => {
  if (button.dataset.agentPrompt === 'rehearse') {
    runGuidedRehearsal().catch(() => {});
    return;
  }
  const intent = { plan: 'orient', people: state.status === 'ready' ? 'orient' : 'read_status', equipment: 'inspect_equipment', roles: 'find_gaps', rehearse: 'rehearse' }[button.dataset.agentPrompt];
  const messages = { plan: 'Show me the Floor 7 plan', people: 'Who is on this floor?', equipment: 'Show planned safety equipment', roles: 'Which role has no owner?', rehearse: 'Run the complete demonstration' };
  beginConversation(messages[button.dataset.agentPrompt]);
  callTool('run_drill_manager', { intent }).catch(() => {});
}));
$('#agentForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const rawPrompt = $('#agentPrompt').value.trim();
  if (!rawPrompt) return;
  const prompt = rawPrompt.toLowerCase();
  $('#agentPrompt').value = '';
  beginConversation(rawPrompt);
  const zone = ['west', 'east', 'meeting', 'studio', 'lobby', 'electrical'].find((candidate) => prompt.includes(candidate));
  const intent = /run|rehears|simulate|stress/.test(prompt) ? 'rehearse'
    : /report|prepare review|after.action/.test(prompt) ? 'prepare_review'
      : /equipment|extinguisher|hose|call point|serviceability/.test(prompt) ? 'inspect_equipment'
        : /history|previous|lesson|last drill/.test(prompt) ? 'read_history'
          : /status|accounted|clearance|complete/.test(prompt) ? 'read_status'
            : zone ? 'inspect_zone'
              : /gap|missing|risk|owner|people|role/.test(prompt) ? 'find_gaps' : 'orient';
  callTool('run_drill_manager', { intent, ...(zone ? { zone_id: zone } : {}) }).catch(() => {});
});

setupSpatialInteractions();
renderToolList();
render();
startClock();
registerWebMCP().catch((error) => showToolResult({ registration_error: error.message }));
