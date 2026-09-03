const clone = (value) => JSON.parse(JSON.stringify(value));

const deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
};

export const TRAINING_BOUNDARY = deepFreeze({
  fiction: true,
  trainingOnly: true,
  liveOccupancy: false,
  emergencyDispatch: false,
  note: 'Fictional rehearsal fixture only. It contains no real identities and cannot contact emergency services.',
});

export const PERSON_STATUSES = deepFreeze({
  READY: 'ready',
  ASSIGNED: 'assigned',
  IN_ROOM: 'in-room',
  MOVING: 'moving',
  WAITING: 'waiting',
  ASSISTANCE_REQUIRED: 'assistance-required',
  ASSISTING: 'assisting',
  ACCOUNTED_FOR: 'accounted-for',
});

export const FLOOR_ARCHETYPES = deepFreeze([
  {
    id: 'meridian-office-07',
    name: 'Meridian Office Floor 07',
    archetype: 'high-rise-office',
    fiction: true,
    rooms: [
      { id: 'office-command-07', name: 'Exercise command room', use: 'rehearsal coordination' },
      { id: 'office-west-07', name: 'West workplace', use: 'open office' },
      { id: 'office-east-07', name: 'East workplace', use: 'open office' },
      { id: 'office-studio-07', name: 'Project studio', use: 'shared studio' },
      { id: 'office-lobby-07', name: 'Lift lobby', use: 'circulation' },
    ],
  },
  {
    id: 'harbor-learning-02',
    name: 'Harbor Learning Floor 02',
    archetype: 'classrooms-and-practical-lab',
    fiction: true,
    rooms: [
      { id: 'learning-classroom-02', name: 'Seminar room', use: 'classroom' },
      { id: 'learning-lab-02', name: 'Practice lab', use: 'supervised practical work' },
      { id: 'learning-commons-02', name: 'Learning commons', use: 'shared study' },
    ],
  },
  {
    id: 'lantern-community-03',
    name: 'Lantern Community Floor 03',
    archetype: 'community-event-floor',
    fiction: true,
    rooms: [
      { id: 'community-hall-03', name: 'Community hall', use: 'flexible event space' },
      { id: 'community-workshop-03', name: 'Workshop room', use: 'small group activity' },
      { id: 'community-quiet-03', name: 'Quiet room', use: 'low-stimulation waiting area' },
    ],
  },
]);

export const RESPONSE_TASKS = deepFreeze([
  { id: 'task-floor-coordination', floorId: 'meridian-office-07', label: 'Coordinate the fictional office rehearsal' },
  { id: 'task-occupant-accounting', floorId: 'meridian-office-07', label: 'Reconcile fictional room groups' },
  { id: 'task-east-room-check', floorId: 'meridian-office-07', label: 'Check the east workplace during the rehearsal' },
  { id: 'task-assistance-handoff', floorId: 'meridian-office-07', label: 'Lead the fictional Studio assistance handoff' },
  { id: 'task-learning-room-check', floorId: 'harbor-learning-02', label: 'Record completion of learning-room checks' },
  { id: 'task-community-assistance', floorId: 'lantern-community-03', label: 'Rehearse a mobility-assistance handoff' },
]);

export const FICTIONAL_RESPONDERS = deepFreeze([
  {
    id: 'responder-a-rahman',
    displayName: 'A. Rahman',
    kind: 'responder',
    role: 'exercise coordinator',
    fictional: true,
    floorId: 'meridian-office-07',
    roomId: 'office-command-07',
    assignedFloorId: 'meridian-office-07',
    assignedRoomId: 'office-command-07',
    taskId: 'task-floor-coordination',
    status: PERSON_STATUSES.ASSIGNED,
  },
  {
    id: 'responder-mei-lin',
    displayName: 'Mei Lin',
    kind: 'responder',
    role: 'accounting lead',
    fictional: true,
    floorId: 'meridian-office-07',
    roomId: 'office-lobby-07',
    assignedFloorId: 'meridian-office-07',
    assignedRoomId: 'office-lobby-07',
    taskId: 'task-occupant-accounting',
    status: PERSON_STATUSES.ASSIGNED,
  },
  {
    id: 'responder-d-kumar',
    displayName: 'D. Kumar',
    kind: 'responder',
    role: 'room-check lead',
    fictional: true,
    floorId: 'meridian-office-07',
    roomId: 'office-east-07',
    assignedFloorId: 'meridian-office-07',
    assignedRoomId: 'office-east-07',
    taskId: 'task-east-room-check',
    status: PERSON_STATUSES.ASSIGNED,
  },
  {
    id: 'responder-s-tan',
    displayName: 'S. Tan',
    kind: 'responder',
    role: 'assistance rehearsal lead',
    fictional: true,
    floorId: 'meridian-office-07',
    roomId: 'office-west-07',
    assignedFloorId: 'meridian-office-07',
    assignedRoomId: 'office-west-07',
    taskId: 'task-assistance-handoff',
    status: PERSON_STATUSES.ASSIGNED,
  },
]);

export const FICTIONAL_OCCUPANTS = deepFreeze([
  { id: 'occupant-o7-w01', displayName: 'Occupant O7-W01', kind: 'occupant', fictional: true, floorId: 'meridian-office-07', roomId: 'office-west-07', assignedRoomId: 'office-west-07', status: PERSON_STATUSES.IN_ROOM },
  { id: 'occupant-o7-w02', displayName: 'Occupant O7-W02', kind: 'occupant', fictional: true, floorId: 'meridian-office-07', roomId: 'office-west-07', assignedRoomId: 'office-west-07', status: PERSON_STATUSES.IN_ROOM },
  { id: 'occupant-o7-e01', displayName: 'Occupant O7-E01', kind: 'occupant', fictional: true, floorId: 'meridian-office-07', roomId: 'office-east-07', assignedRoomId: 'office-east-07', status: PERSON_STATUSES.IN_ROOM },
  { id: 'occupant-o7-s01', displayName: 'Occupant O7-S01', kind: 'occupant', fictional: true, floorId: 'meridian-office-07', roomId: 'office-studio-07', assignedRoomId: 'office-studio-07', status: PERSON_STATUSES.ASSISTANCE_REQUIRED },
  { id: 'occupant-l2-c01', displayName: 'Occupant L2-C01', kind: 'occupant', fictional: true, floorId: 'harbor-learning-02', roomId: 'learning-classroom-02', assignedRoomId: 'learning-classroom-02', status: PERSON_STATUSES.IN_ROOM },
  { id: 'occupant-l2-l01', displayName: 'Occupant L2-L01', kind: 'occupant', fictional: true, floorId: 'harbor-learning-02', roomId: 'learning-lab-02', assignedRoomId: 'learning-lab-02', status: PERSON_STATUSES.IN_ROOM },
  { id: 'occupant-c3-h01', displayName: 'Occupant C3-H01', kind: 'occupant', fictional: true, floorId: 'lantern-community-03', roomId: 'community-hall-03', assignedRoomId: 'community-hall-03', status: PERSON_STATUSES.IN_ROOM },
  { id: 'occupant-c3-q01', displayName: 'Occupant C3-Q01', kind: 'occupant', fictional: true, floorId: 'lantern-community-03', roomId: 'community-quiet-03', assignedRoomId: 'community-quiet-03', status: PERSON_STATUSES.ASSISTANCE_REQUIRED },
]);

export const OCCUPANT_GROUPS = deepFreeze([
  { id: 'group-office-west', floorId: 'meridian-office-07', roomId: 'office-west-07', label: 'West workplace group', memberIds: ['occupant-o7-w01', 'occupant-o7-w02'] },
  { id: 'group-office-east', floorId: 'meridian-office-07', roomId: 'office-east-07', label: 'East workplace group', memberIds: ['occupant-o7-e01'] },
  { id: 'group-office-studio', floorId: 'meridian-office-07', roomId: 'office-studio-07', label: 'Project studio group', memberIds: ['occupant-o7-s01'] },
  { id: 'group-learning-classroom', floorId: 'harbor-learning-02', roomId: 'learning-classroom-02', label: 'Seminar group', memberIds: ['occupant-l2-c01'] },
  { id: 'group-learning-lab', floorId: 'harbor-learning-02', roomId: 'learning-lab-02', label: 'Practice lab group', memberIds: ['occupant-l2-l01'] },
  { id: 'group-community-hall', floorId: 'lantern-community-03', roomId: 'community-hall-03', label: 'Community hall group', memberIds: ['occupant-c3-h01'] },
  { id: 'group-community-quiet', floorId: 'lantern-community-03', roomId: 'community-quiet-03', label: 'Quiet room group', memberIds: ['occupant-c3-q01'] },
]);

export const MOBILITY_ASSISTANCE_RELATIONSHIPS = deepFreeze([
  {
    id: 'assistance-office-studio',
    personId: 'occupant-o7-s01',
    responderId: 'responder-s-tan',
    rehearsalRoomId: 'office-studio-07',
    status: 'planned',
    fictional: true,
  },
  {
    id: 'assistance-community-quiet',
    personId: 'occupant-c3-q01',
    responderId: 'responder-s-tan',
    rehearsalRoomId: 'community-quiet-03',
    status: 'planned',
    fictional: true,
  },
]);

export const REHEARSAL_SCENARIOS = deepFreeze([
  {
    id: 'scenario-office-route-change',
    name: 'Office route-change rehearsal',
    floorId: 'meridian-office-07',
    injects: ['A fictional corridor marker is unavailable.', 'Teams record which room groups have moved.'],
    trainingOnly: true,
    externalEffects: false,
  },
  {
    id: 'scenario-learning-accounting-gap',
    name: 'Learning-floor accounting rehearsal',
    floorId: 'harbor-learning-02',
    injects: ['One fictional room group is not yet reconciled.', 'The room-check lead records the unresolved count.'],
    trainingOnly: true,
    externalEffects: false,
  },
  {
    id: 'scenario-community-assistance-handoff',
    name: 'Community-floor assistance handoff',
    floorId: 'lantern-community-03',
    injects: ['A planned fictional assistance partner changes.', 'The replacement pairing is acknowledged in the rehearsal.'],
    trainingOnly: true,
    externalEffects: false,
  },
]);

const roomsById = new Map(
  FLOOR_ARCHETYPES.flatMap((floor) => floor.rooms.map((room) => [room.id, { ...room, floorId: floor.id }])),
);
const floorsById = new Map(FLOOR_ARCHETYPES.map((floor) => [floor.id, floor]));
const tasksById = new Map(RESPONSE_TASKS.map((task) => [task.id, task]));
const allowedStatuses = new Set(Object.values(PERSON_STATUSES));
const responderStatuses = new Set([
  PERSON_STATUSES.READY,
  PERSON_STATUSES.ASSIGNED,
  PERSON_STATUSES.MOVING,
  PERSON_STATUSES.ASSISTING,
  PERSON_STATUSES.ACCOUNTED_FOR,
]);
const occupantStatuses = new Set([
  PERSON_STATUSES.IN_ROOM,
  PERSON_STATUSES.MOVING,
  PERSON_STATUSES.WAITING,
  PERSON_STATUSES.ASSISTANCE_REQUIRED,
  PERSON_STATUSES.ACCOUNTED_FOR,
]);

const INITIAL_PEOPLE_STATE = deepFreeze([...clone(FICTIONAL_RESPONDERS), ...clone(FICTIONAL_OCCUPANTS)]);
let peopleState = clone(INITIAL_PEOPLE_STATE);

const requireId = (value, label) => {
  if (typeof value !== 'string' || value.length === 0 || value.trim() !== value) {
    throw new TypeError(`${label} must be a non-empty exact string ID.`);
  }
  return value;
};

const requirePerson = (personId) => {
  requireId(personId, 'personId');
  const person = peopleState.find((candidate) => candidate.id === personId);
  if (!person) throw new Error('Unknown fictional person.');
  return person;
};

const requireRoom = (roomId) => {
  requireId(roomId, 'roomId');
  const room = roomsById.get(roomId);
  if (!room) throw new Error('Unknown fictional room.');
  return room;
};

const requireTask = (taskId) => {
  requireId(taskId, 'taskId');
  const task = tasksById.get(taskId);
  if (!task) throw new Error('Unknown rehearsal task.');
  return task;
};

const replacePerson = (personId, nextPerson) => {
  peopleState = peopleState.map((person) => (person.id === personId ? nextPerson : person));
  return clone(nextPerson);
};

/** Assigns a fictional responder after the complete room/task combination is validated. */
export function assignResponder(responderId, roomId, taskId) {
  const responder = requirePerson(responderId);
  if (responder.kind !== 'responder') throw new Error('Only a fictional responder can receive a response task.');
  const room = requireRoom(roomId);
  const task = requireTask(taskId);
  if (task.floorId !== room.floorId) throw new Error('Task and room must belong to the same fictional floor.');

  return replacePerson(responderId, {
    ...responder,
    floorId: room.floorId,
    roomId: room.id,
    assignedFloorId: room.floorId,
    assignedRoomId: room.id,
    taskId: task.id,
    status: PERSON_STATUSES.ASSIGNED,
  });
}

/** Moves one fictional person; the destination floor is derived from the validated room. */
export function movePerson(personId, roomId, status = PERSON_STATUSES.MOVING) {
  const person = requirePerson(personId);
  const room = requireRoom(roomId);
  if (typeof status !== 'string' || !allowedStatuses.has(status)) throw new Error('Unknown fictional person status.');
  const permittedStatuses = person.kind === 'responder' ? responderStatuses : occupantStatuses;
  if (!permittedStatuses.has(status)) throw new Error(`Status is not valid for a fictional ${person.kind}.`);

  return replacePerson(personId, {
    ...person,
    floorId: room.floorId,
    roomId: room.id,
    status,
  });
}

/** Returns detached records so callers cannot mutate module state. */
export function getPeopleForFloor(floorId) {
  requireId(floorId, 'floorId');
  if (!floorsById.has(floorId)) throw new Error('Unknown fictional floor.');
  return clone(peopleState.filter((person) => person.floorId === floorId));
}

/** Returns a detached snapshot of all current fictional people. */
export function getPeopleState() {
  return clone(peopleState);
}

/** Restores the deterministic initial fixture and returns a detached snapshot. */
export function resetPeopleState() {
  peopleState = clone(INITIAL_PEOPLE_STATE);
  return getPeopleState();
}

const MusterPeopleData = Object.freeze({
  TRAINING_BOUNDARY,
  PERSON_STATUSES,
  FLOOR_ARCHETYPES,
  RESPONSE_TASKS,
  FICTIONAL_RESPONDERS,
  FICTIONAL_OCCUPANTS,
  OCCUPANT_GROUPS,
  MOBILITY_ASSISTANCE_RELATIONSHIPS,
  REHEARSAL_SCENARIOS,
  assignResponder,
  movePerson,
  getPeopleForFloor,
  getPeopleState,
  resetPeopleState,
});

if (typeof globalThis !== 'undefined') {
  globalThis.MusterPeopleData = MusterPeopleData;
}

export default MusterPeopleData;
