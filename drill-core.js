export const BUILDING = {
  id: 'meridian-exchange',
  name: 'Meridian Exchange',
  fiction: true,
  address: 'Fictional site · Singapore',
  floor: '07',
  planVersion: 'FS-07 · rev 4',
  reviewedOn: '18 Aug 2026',
  occupants: 84,
  assistedOccupants: 2,
  exits: ['Stair A', 'Stair B'],
  systems: ['Smoke detection', 'Sprinklers', 'Emergency voice communication'],
  roles: [
    { id: 'fsm', label: 'Fire Safety Manager', person: 'A. Rahman', status: 'present' },
    { id: 'security', label: 'Chief Security', person: 'Mei Lin', status: 'present' },
    { id: 'warden-east', label: 'East Fire Warden', person: 'D. Kumar', status: 'present' },
    { id: 'warden-west', label: 'West Fire Warden', person: 'S. Tan', status: 'present' },
    { id: 'mobility', label: 'Mobility assistance', person: null, status: 'missing' },
  ],
};

export const INJECTS = {
  smoke: {
    id: 'smoke',
    at: '00:00',
    title: 'Detector activation',
    detail: 'Training inject: smoke reported beside Electrical Room 7-E.',
    severity: 'signal',
  },
  stair: {
    id: 'stair',
    at: '02:00',
    title: 'Stair B unavailable',
    detail: 'Training inject: simulated smoke makes Stair B unavailable from Floor 7.',
    severity: 'warning',
  },
  roster: {
    id: 'roster',
    at: '04:00',
    title: 'Assistance owner missing',
    detail: 'The floor register lists two people needing assistance, but no owner is assigned.',
    severity: 'critical',
  },
};

export const ACTIONS = {
  reroute: {
    id: 'reroute',
    label: 'Route east and west zones to Stair A',
    owner: 'East and West Fire Wardens',
    addresses: ['stair'],
  },
  account: {
    id: 'account',
    label: 'Recheck Floor 7 register at assembly area',
    owner: 'Chief Security',
    addresses: ['smoke'],
  },
  assist: {
    id: 'assist',
    label: 'Assign mobility assistance pair',
    owner: 'CERT Lead',
    addresses: ['roster'],
  },
};

export const ZONES = {
  west: { id: 'west', label: 'West workplace', occupants: 29, assisted: 0, nearestExit: 'Stair A', distanceM: 24 },
  east: { id: 'east', label: 'East workplace', occupants: 39, assisted: 0, nearestExit: 'Stair B', distanceM: 21 },
  meeting: { id: 'meeting', label: 'Meeting suite', occupants: 8, assisted: 0, nearestExit: 'Stair A', distanceM: 14 },
  studio: { id: 'studio', label: 'Studio', occupants: 6, assisted: 2, nearestExit: 'Stair B', distanceM: 18 },
  lobby: { id: 'lobby', label: 'Lift lobby', occupants: 2, assisted: 0, nearestExit: 'Stair A', distanceM: 31 },
  electrical: { id: 'electrical', label: 'Electrical room 7-E', occupants: 0, assisted: 0, nearestExit: 'Stair A', distanceM: 37 },
};

export const SITE_CONTEXT = {
  setting: 'Fictional downtown commercial block · Singapore',
  storeys: 18,
  heightClass: 'high-rise training fixture',
  primaryAssembly: 'North civic court · fixture only',
  alternateAssembly: 'West service square · fixture only',
  applianceAccess: 'South service road · verify with approved site plan',
  adjacentUses: ['office tower', 'retail podium', 'service lane'],
  liveMap: false,
  liveStationAvailability: false,
};

export const ROOM_PROFILES = {
  west: { use: 'open office', fuelNote: 'ordinary office contents', protections: ['detector coverage', 'sprinkler coverage'], afterHours: 'low fixture occupancy' },
  east: { use: 'open office', fuelNote: 'ordinary office contents', protections: ['detector coverage', 'sprinkler coverage'], afterHours: 'cleaning team fixture' },
  meeting: { use: 'meeting suite', fuelNote: 'movable furniture', protections: ['detector coverage', 'visual alarm fixture'], afterHours: 'bookings vary' },
  studio: { use: 'production studio', fuelNote: 'portable equipment cases', protections: ['detector coverage', 'PWD holding point nearby'], afterHours: 'two-person close-down fixture' },
  lobby: { use: 'lift and smoke-stop lobby', fuelNote: 'keep escape approach clear', protections: ['manual call point', 'voice communication fixture'], afterHours: 'security rounds fixture' },
  electrical: { use: 'electrical switch room', fuelNote: 'higher-hazard exercise origin', protections: ['detector coverage', 'restricted access'], afterHours: 'authorised personnel only' },
};

export const EQUIPMENT = [
  { id: 'EX-07-W1', type: 'Extinguisher', room: 'Meeting suite threshold', zone: 'meeting', planStatus: 'shown', inspection: '18 Aug 2026 fixture' },
  { id: 'HR-07-E1', type: 'Hose reel', room: 'East corridor', zone: 'east', planStatus: 'shown', inspection: '18 Aug 2026 fixture' },
  { id: 'MCP-07-L1', type: 'Manual call point', room: 'Lift lobby west', zone: 'lobby', planStatus: 'shown', inspection: '18 Aug 2026 fixture' },
  { id: 'PWD-07-S1', type: 'PWD holding point', room: 'Studio smoke-stop approach', zone: 'studio', planStatus: 'shown', inspection: 'owner assignment open' },
];

export const LESSONS = [
  { date: '14 May 2026', source: 'tabletop exercise fixture', finding: 'Assistance role had no deputy.', change: 'Add primary and alternate assistance owners by shift.' },
  { date: '20 Feb 2026', source: 'evacuation drill fixture', finding: 'Contractor register reached the assembly board late.', change: 'Reconcile temporary badges before reporting floor status.' },
  { date: '19 Nov 2025', source: 'tabletop exercise fixture', finding: 'A blocked-stair inject caused route ambiguity.', change: 'Brief both remote exits and record who authorises route changes.' },
];

export const CHECKLISTS = {
  before: [
    'Confirm the approved plan revision and exercise scope.',
    'Confirm the facilitator, wardens, security lead, CERT lead, and assistance owners.',
    'Confirm observers know this is a drill and know how to stop the exercise.',
  ],
  during: [
    'Timestamp each inject and facilitator-confirmed team action.',
    'Track occupant accounting and assistance ownership by zone.',
    'Record uncertainty and disagreements instead of inventing a resolution.',
  ],
  after: [
    'Separate observed actions from assumptions and recommendations.',
    'Assign an owner and due date to every accepted improvement.',
    'Have the Fire Safety Manager review the draft before it becomes a record.',
  ],
};

export function createInitialState() {
  return {
    status: 'ready',
    drillCode: 'MST-0742',
    startedAt: null,
    injectIds: [],
    decisions: [],
    humanSignals: [],
    report: null,
    approved: false,
    focusZone: null,
    activity: [
      {
        type: 'system',
        title: 'Exercise loaded',
        detail: 'Fictional building data · no emergency connection',
      },
    ],
  };
}

export function recordHumanSignal(state, roleId, signal) {
  const role = BUILDING.roles.find((candidate) => candidate.id === roleId);
  const allowed = ['confirms', 'uncertain', 'disagrees', 'delayed'];
  if (!role) throw new Error('Unknown exercise role.');
  if (!allowed.includes(signal)) throw new Error('Unknown observed signal.');
  const entry = { roleId, role: role.label, signal, recordedAt: `T+${String(state.humanSignals.length + 1).padStart(2, '0')}:30` };
  return {
    ...state,
    humanSignals: [...state.humanSignals, entry],
    activity: [...state.activity, { type: 'human', title: 'Observed participant signal', detail: `${role.label} · ${signal}` }],
  };
}

export function inspectZone(state, zoneId) {
  const zone = ZONES[zoneId];
  if (!zone) throw new Error('Unknown floor zone.');
  const stairBlocked = state.injectIds.includes('stair');
  const nearestBlocked = stairBlocked && zone.nearestExit === 'Stair B';
  return {
    state: {
      ...state,
      focusZone: zoneId,
      activity: [...state.activity, { type: 'tool', title: 'inspect_zone', detail: `${zone.label} · ${zone.occupants} people in fixture` }],
    },
    result: {
      training_only: true,
      zone: zone.label,
      fixture_occupants: zone.occupants,
      assisted_occupants: zone.assisted,
      nearest_plan_exit: zone.nearestExit,
      plan_distance_metres: zone.distanceM,
      nearest_exit_blocked_in_scenario: nearestBlocked,
      note: 'Counts and distances are fictional exercise fixtures, not live occupancy data.',
      external_effects: false,
    },
  };
}

export function compareRoutes(state, zoneId) {
  const zone = ZONES[zoneId];
  if (!zone) throw new Error('Unknown floor zone.');
  const stairBBlocked = state.injectIds.includes('stair');
  const alternatives = zoneId === 'west' || zoneId === 'meeting'
    ? [
        { exit: 'Stair A', distance_m: zone.distanceM, scenario_status: 'available' },
        { exit: 'Stair B', distance_m: zone.distanceM + 38, scenario_status: stairBBlocked ? 'unavailable' : 'available' },
      ]
    : [
        { exit: 'Stair B', distance_m: zone.distanceM, scenario_status: stairBBlocked ? 'unavailable' : 'available' },
        { exit: 'Stair A', distance_m: zone.distanceM + 24, scenario_status: 'available' },
      ];
  return {
    training_only: true,
    zone: zone.label,
    fixture_occupants: zone.occupants,
    assisted_occupants: zone.assisted,
    alternatives,
    decision_boundary: 'The tool compares the fictional plan. It does not direct a real evacuation or rescue.',
    external_effects: false,
  };
}

export function hazardSnapshot(state) {
  const phase = state.injectIds.includes('roster') ? 'T+04:00' : state.injectIds.includes('stair') ? 'T+02:00' : state.injectIds.includes('smoke') ? 'T+00:00' : 'READY';
  return {
    training_only: true,
    scripted_phase: phase,
    source_zone: state.injectIds.includes('smoke') ? 'Electrical room 7-E' : null,
    unavailable_route: state.injectIds.includes('stair') ? 'Stair B' : null,
    model_type: 'authored exercise injects, not a physical fire-spread model',
    live_sensor_data: false,
    external_effects: false,
  };
}

export function startDrill(state) {
  if (state.status !== 'ready') return state;
  return {
    ...state,
    status: 'running',
    startedAt: '19:42 SGT',
    injectIds: ['smoke'],
    report: null,
    approved: false,
    activity: [
      ...state.activity,
      { type: 'tool', title: 'start_drill', detail: 'Scenario started at 19:42 SGT' },
    ],
  };
}

export function addInject(state, injectId) {
  if (state.status !== 'running') throw new Error('Start the exercise before sending an inject.');
  if (!INJECTS[injectId]) throw new Error('Unknown exercise inject.');
  if (state.injectIds.includes(injectId)) return state;
  return {
    ...state,
    injectIds: [...state.injectIds, injectId],
    report: null,
    approved: false,
    activity: [
      ...state.activity,
      { type: 'tool', title: 'send_inject', detail: INJECTS[injectId].title },
    ],
  };
}

export function recordAction(state, actionId) {
  if (state.status !== 'running') throw new Error('Start the exercise before recording an action.');
  const action = ACTIONS[actionId];
  if (!action) throw new Error('Unknown team action.');
  if (state.decisions.some((decision) => decision.actionId === actionId)) return state;
  return {
    ...state,
    decisions: [
      ...state.decisions,
      { actionId, owner: action.owner, recordedAt: `T+${String(state.decisions.length * 2 + 1).padStart(2, '0')}:00` },
    ],
    report: null,
    approved: false,
    activity: [
      ...state.activity,
      { type: 'tool', title: 'record_action', detail: `${action.owner} · ${action.label}` },
    ],
  };
}

export function checkCoverage(state) {
  const unresolved = [];
  if (state.injectIds.includes('stair') && !state.decisions.some((item) => item.actionId === 'reroute')) {
    unresolved.push({ id: 'stair', label: 'No alternate route recorded for Stair B.' });
  }
  if (state.injectIds.includes('roster') && !state.decisions.some((item) => item.actionId === 'assist')) {
    unresolved.push({ id: 'roster', label: 'Mobility assistance has no named owner.' });
  }
  return {
    checked: state.injectIds.length,
    resolved: state.injectIds.length - unresolved.length,
    unresolved,
  };
}

export function stageReport(state) {
  if (state.status !== 'running') throw new Error('Run the exercise before staging a report.');
  const coverage = checkCoverage(state);
  const report = {
    id: 'AAR-MST-0742',
    title: 'Floor 7 after-action draft',
    createdAt: '19:51 SGT',
    decisions: state.decisions.length,
    observedParticipantSignals: state.humanSignals.length,
    injects: state.injectIds.length,
    unresolved: coverage.unresolved,
    status: coverage.unresolved.length ? 'needs-action' : 'ready-for-review',
  };
  return {
    ...state,
    status: 'review',
    report,
    approved: false,
    activity: [
      ...state.activity,
      {
        type: 'tool',
        title: 'stage_report',
        detail: coverage.unresolved.length
          ? `${coverage.unresolved.length} gap remains`
          : 'Draft ready for human review',
      },
    ],
  };
}

export function returnToDrill(state) {
  if (state.status !== 'review') return state;
  return { ...state, status: 'running', report: null, approved: false };
}

export function approveReport(state) {
  if (state.status !== 'review' || !state.report) throw new Error('Stage the report before approval.');
  if (state.report.unresolved.length) throw new Error('Resolve the visible gap before approval.');
  return {
    ...state,
    approved: true,
    status: 'complete',
    activity: [
      ...state.activity,
      { type: 'human', title: 'Human approval', detail: 'Fire Safety Manager accepted the training report' },
    ],
  };
}

export function publicSnapshot(state) {
  const coverage = checkCoverage(state);
  return {
    exercise_code: state.drillCode,
    training_only: true,
    building: BUILDING.name,
    floor: BUILDING.floor,
    plan_version: BUILDING.planVersion,
    status: state.status,
    active_injects: state.injectIds.map((id) => INJECTS[id].title),
    recorded_actions: state.decisions.length,
    unresolved_gaps: coverage.unresolved.map((gap) => gap.label),
    requires_human_approval: state.status === 'review',
    external_effects: false,
  };
}
