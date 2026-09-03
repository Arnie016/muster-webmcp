import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import MusterPeopleData, {
  FICTIONAL_RESPONDERS,
  FLOOR_ARCHETYPES,
  MOBILITY_ASSISTANCE_RELATIONSHIPS,
  OCCUPANT_GROUPS,
  PERSON_STATUSES,
  REHEARSAL_SCENARIOS,
  RESPONSE_TASKS,
  TRAINING_BOUNDARY,
  assignResponder,
  getPeopleForFloor,
  getPeopleState,
  movePerson,
  resetPeopleState,
} from '../people-data.js';

beforeEach(() => resetPeopleState());

describe('fictional people fixture', () => {
  it('publishes deterministic, training-only catalogs through ESM and the browser global', () => {
    assert.deepEqual(
      FICTIONAL_RESPONDERS.map((person) => person.displayName),
      ['A. Rahman', 'Mei Lin', 'D. Kumar', 'S. Tan'],
    );
    assert.equal(FLOOR_ARCHETYPES.length, 3);
    assert.equal(new Set(FLOOR_ARCHETYPES.map((floor) => floor.archetype)).size, 3);
    assert.equal(REHEARSAL_SCENARIOS.length, 3);
    assert.ok(REHEARSAL_SCENARIOS.every((scenario) => scenario.trainingOnly && !scenario.externalEffects));
    assert.equal(TRAINING_BOUNDARY.emergencyDispatch, false);
    assert.strictEqual(globalThis.MusterPeopleData, MusterPeopleData);
    assert.strictEqual(globalThis.MusterPeopleData.assignResponder, assignResponder);
  });

  it('keeps room groups, tasks, and assistance relationships referentially complete', () => {
    const floorIds = new Set(FLOOR_ARCHETYPES.map((floor) => floor.id));
    const roomIds = new Set(FLOOR_ARCHETYPES.flatMap((floor) => floor.rooms.map((room) => room.id)));
    const peopleIds = new Set(getPeopleState().map((person) => person.id));
    const responderIds = new Set(FICTIONAL_RESPONDERS.map((person) => person.id));

    assert.ok(OCCUPANT_GROUPS.every((group) => floorIds.has(group.floorId) && roomIds.has(group.roomId)));
    assert.ok(OCCUPANT_GROUPS.flatMap((group) => group.memberIds).every((id) => peopleIds.has(id)));
    assert.ok(RESPONSE_TASKS.every((task) => floorIds.has(task.floorId)));
    assert.ok(MOBILITY_ASSISTANCE_RELATIONSHIPS.every((link) => (
      peopleIds.has(link.personId) && responderIds.has(link.responderId) && roomIds.has(link.rehearsalRoomId)
    )));
  });
});

describe('state helpers', () => {
  it('assigns a responder only after validating the entire assignment', () => {
    const assigned = assignResponder(
      'responder-a-rahman',
      'office-east-07',
      'task-occupant-accounting',
    );

    assert.equal(assigned.assignedRoomId, 'office-east-07');
    assert.equal(assigned.taskId, 'task-occupant-accounting');
    assert.equal(assigned.status, PERSON_STATUSES.ASSIGNED);

    const beforeRejectedAssignment = getPeopleState();
    assert.throws(
      () => assignResponder('responder-a-rahman', 'learning-lab-02', 'task-floor-coordination'),
      /same fictional floor/,
    );
    assert.deepEqual(getPeopleState(), beforeRejectedAssignment);
    assert.throws(
      () => assignResponder('occupant-o7-w01', 'office-east-07', 'task-occupant-accounting'),
      /Only a fictional responder/,
    );
  });

  it('moves known people to known rooms with role-appropriate statuses', () => {
    const moved = movePerson('occupant-o7-w01', 'office-lobby-07');
    assert.equal(moved.roomId, 'office-lobby-07');
    assert.equal(moved.floorId, 'meridian-office-07');
    assert.equal(moved.status, PERSON_STATUSES.MOVING);

    const beforeRejectedMove = getPeopleState();
    assert.throws(
      () => movePerson('occupant-o7-w01', 'office-west-07', PERSON_STATUSES.ASSISTING),
      /not valid for a fictional occupant/,
    );
    assert.deepEqual(getPeopleState(), beforeRejectedMove);
    assert.throws(() => movePerson('unknown-person', 'office-west-07'), /Unknown fictional person/);
    assert.throws(() => movePerson('occupant-o7-w01', 'unknown-room'), /Unknown fictional room/);
  });

  it('returns detached floor records and fails closed for unknown floor IDs', () => {
    const officePeople = getPeopleForFloor('meridian-office-07');
    assert.ok(officePeople.length > 0);
    assert.ok(officePeople.every((person) => person.floorId === 'meridian-office-07'));

    officePeople[0].displayName = 'Caller mutation';
    assert.notEqual(getPeopleForFloor('meridian-office-07')[0].displayName, 'Caller mutation');
    assert.throws(() => getPeopleForFloor('meridian-office-99'), /Unknown fictional floor/);
    assert.throws(() => getPeopleForFloor(' meridian-office-07'), /exact string ID/);
  });

  it('restores the exact initial state', () => {
    const initial = getPeopleState();
    movePerson('occupant-c3-h01', 'community-workshop-03', PERSON_STATUSES.WAITING);
    assignResponder('responder-s-tan', 'community-hall-03', 'task-community-assistance');

    assert.notDeepEqual(getPeopleState(), initial);
    assert.deepEqual(resetPeopleState(), initial);
    assert.deepEqual(getPeopleState(), initial);
  });
});
