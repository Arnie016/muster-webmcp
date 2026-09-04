import { FICTIONAL_RESPONDERS } from './people-data.js';
import { ROOMS, routeWalkthrough } from './spatial-data.js';

export const TEAM_ROOMS = ['west', 'east', 'meeting', 'studio', 'lobby'];
export const TEAM_TASKS = { room_check: 'Room check', assistance_brief: 'Assistance handoff', equipment_check: 'Equipment review' };
const initialRooms = ['meeting', 'lobby', 'east', 'west'];
const pointFor = (roomId, index) => {
  const room = ROOMS.find(r => r.id === roomId);
  return [room.center[0] + (index % 2 ? 17 : -17), room.center[1] + 10];
};
export function handoffRecords(state) {
  return (Array.isArray(state.teamHandoffs) ? state.teamHandoffs : []).filter(h =>
    h && FICTIONAL_RESPONDERS.some(p => p.id === h.person_id) && TEAM_ROOMS.includes(h.to_room)
    && TEAM_ROOMS.includes(h.from_room) && Object.hasOwn(TEAM_TASKS,h.task) && h.confirmed === true);
}
export function teamRoster(state) {
  return FICTIONAL_RESPONDERS.map((p,i) => {
    const assignment = handoffRecords(state).filter(h => h.person_id === p.id).at(-1);
    const assistance = p.id === 'responder-s-tan' && state.decisions?.some(d => d.actionId === 'assist');
    const room_id = assignment?.to_room || (assistance ? 'studio' : initialRooms[i]);
    return { id:p.id, name:p.displayName, role:p.role, initials:['AR','ML','DK','ST'][i], room_id,
      room:ROOMS.find(r=>r.id===room_id).label, point:pointFor(room_id,i),
      task:assignment ? TEAM_TASKS[assignment.task] : assistance ? 'Assistance handoff' : 'Initial exercise position',
      status:assignment ? 'assignment confirmed' : assistance ? 'assistance recorded' : 'ready',
      fictional:true, live_location:false };
  });
}
export const handoffRevision = state => JSON.stringify([state.status,state.injectIds,state.decisions?.map(d=>d.actionId),handoffRecords(state).length,teamRoster(state).map(p=>p.room_id)]);

export function prepareHandoff(state, personId, toRoom, task='room_check') {
  const person=teamRoster(state).find(p=>p.id===personId);
  if(!person) throw new Error('Choose a known exercise responder.');
  if(!TEAM_ROOMS.includes(toRoom)) throw new Error('Choose a room with an authored walkway. Electrical-room entry is not supported.');
  if(!Object.hasOwn(TEAM_TASKS,task)) throw new Error('Choose a supported rehearsal task.');
  if(['review','complete'].includes(state.status)) throw new Error('Return to the drill before preparing another assignment.');
  if(person.room_id===toRoom) throw new Error(`${person.name} is already assigned to ${person.room}. Choose another room.`);
  const from=routeWalkthrough(person.room_id,'A').points;
  const to=routeWalkthrough(toRoom,'A').points;
  // Join the two authored room paths at their earliest shared corridor vertex.
  let best=null;
  from.forEach((p,i)=>to.forEach((q,j)=>{if(p[0]===q[0]&&p[1]===q[1]&&(!best||i+j<best.i+best.j))best={i,j};}));
  if(!best)throw new Error('No authored room connection exists.');
  const points=[person.point,...from.slice(0,best.i+1),...to.slice(0,best.j).reverse(),pointFor(toRoom,FICTIONAL_RESPONDERS.findIndex(p=>p.id===personId))];
  const distance=points.slice(1).reduce((n,p,i)=>n+Math.hypot(p[0]-points[i][0],p[1]-points[i][1])/20,0);
  return { person_id:person.id, person:person.name, from_room:person.room_id, from_label:person.room, to_room:toRoom,
    to_label:ROOMS.find(r=>r.id===toRoom).label, task, task_label:TEAM_TASKS[task], points,
    diagram_metres:Number(distance.toFixed(1)), revision:handoffRevision(state), requires_human_confirmation:true,
    status:'proposed', arrived:false, clearance_claimed:false, training_only:true, external_effects:false,
    checks:[`${person.name} starts from the ${person.room} exercise marker.`,
      `${TEAM_TASKS[task]} is proposed for ${ROOMS.find(r=>r.id===toRoom).label}.`,
      state.injectIds?.includes('stair')?'Stair B is unavailable; this room-to-room sketch does not use either stair.':'This sketch connects rooms only, not a verified exit or place of safety.',
      'The facilitator confirms the assignment. Arrival, clearance and assistance completion are not inferred.'] };
}

export function confirmHandoff(state, proposal, timestamp) {
  if(state.status!=='running')throw new Error('Start or return to the drill before confirming an assignment.');
  if(!proposal || proposal.revision!==handoffRevision(state))throw new Error('The exercise changed. Preview the assignment again before confirming.');
  const fresh=prepareHandoff(state,proposal.person_id,proposal.to_room,proposal.task);
  const records=handoffRecords(state);
  if(records.length>=100)throw new Error('This exercise has 100 assignment records. Review or reset it before adding more.');
  const record={id:`handoff-${records.length+1}`,person_id:fresh.person_id,person:fresh.person,
    from_room:fresh.from_room,to_room:fresh.to_room,task:fresh.task,confirmed:true,confirmed_at:timestamp,
    status:'assignment confirmed',arrived:false,clearance_claimed:false,external_effects:false};
  return {...state,teamHandoffs:[...records,record]};
}
