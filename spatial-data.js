import { ZONES, EQUIPMENT } from './drill-core.js';

// Horizontal coordinates follow the authored F07 SVG, 20 drawing units = 1 metre.
// Elevation, doors and furniture are inferred for this fictional cutaway only.
export const FLOOR_MODEL = { floor: 7, revision: '04', width: 38, depth: 23.15, height: 3,
  provenance: 'Fictional MX-FS-07-004 plan. 3 m elevation, door openings and props are inferred; not a surveyed or approved building model.' };
export const ROOMS = [
  { id: 'west', bounds: [70, 72, 330, 350], center: [200, 215], color: '#285b60', use: 'Open office', owner: 'West Fire Warden', furniture: 'office' },
  { id: 'east', bounds: [568, 72, 830, 350], center: [700, 215], color: '#285b60', use: 'Open office', owner: 'East Fire Warden', furniture: 'office' },
  { id: 'meeting', bounds: [70, 350, 330, 535], center: [220, 395], color: '#425567', use: 'Meeting suite', owner: 'West Fire Warden', furniture: 'meeting' },
  { id: 'studio', bounds: [568, 350, 830, 535], center: [704, 397], color: '#504763', use: 'Production studio', owner: 'East Fire Warden', furniture: 'studio' },
  { id: 'lobby', bounds: [330, 72, 568, 210], center: [449, 158], color: '#36595b', use: 'Lift lobby', owner: 'Chief Security', furniture: 'lobby' },
  { id: 'electrical', bounds: [478, 210, 568, 350], center: [525, 275], color: '#69452f', use: 'Electrical switch room', owner: 'Authorised personnel', furniture: 'electrical' },
].map((room) => ({ ...room, ...ZONES[room.id], width: (room.bounds[2] - room.bounds[0]) / 20, depth: (room.bounds[3] - room.bounds[1]) / 20 }));

// Each segment ends at a doorway, avoiding visually drawn paths through walls.
export const WALLS = [
  [70,72,830,72], [830,72,830,535], [830,535,70,535], [70,535,70,72],
  [70,350,260,350], [300,350,330,350], [568,350,605,350], [645,350,830,350],
  [330,72,330,210], [330,210,429,210], [469,210,568,210], [568,72,568,210],
  [330,210,330,410], [330,450,330,535], [568,210,568,295], [568,325,568,410], [568,450,568,535],
  [420,210,420,350], [478,210,478,350], [330,350,420,350], [478,350,568,350],
  [105,448,184,448], [224,448,237,448], [105,448,105,510], [105,510,237,510], [237,510,237,448],
  [676,448,720,448], [760,448,808,448], [676,448,676,510], [676,510,808,510], [808,510,808,448],
];
const EQUIPMENT_POINTS = {
  'EX-07-W1': { point: [309,395], symbol: 'E', why: 'Locate the listed extinguisher and check its inspection record with the responsible person. Placement does not establish suitability.', color: '#ff754c' },
  'HR-07-E1': { point: [591,333], symbol: 'H', why: 'Identify the hose-reel cabinet in the plan. This demo does not teach its operation or certify it is serviceable.', color: '#ff754c' },
  'MCP-07-L1': { point: [324,227], symbol: 'M', why: 'Identify the manual call-point location before the rehearsal. It is a plan marker; clicking it never activates an alarm.', color: '#ff754c' },
  'PWD-07-S1': { point: [657,440], symbol: 'P', why: 'Discuss the two registered assistance needs and a named primary and backup owner. This location is not a certified refuge.', color: '#e7bd58' },
};
export const SPATIAL_EQUIPMENT = EQUIPMENT.map((item) => ({ ...item, ...EQUIPMENT_POINTS[item.id], position_basis: 'Approximate authored diagram location; no live equipment connection' }));
export const DETECTOR = { id: 'signal-7e', type: 'Scripted detector signal', point: [526,296], symbol: 'D', color: '#fca456', why: 'The exercise reports a detector signal near 7-E. Origin, device specification and fire spread are not measured.' };
export const toWorld = ([u,v], y = 0) => [(u - 450) / 20, y, (v - 303.5) / 20];
export function roomSpatialProfile(id) {
  const room = ROOMS.find((r) => r.id === id);
  if (!room) throw new Error('Unknown room');
  return { ...room, floor: 7, dimensions_m: { width: room.width, depth: room.depth, inferred_height: 3 }, equipment: SPATIAL_EQUIPMENT.filter((e) => e.zone === id), geometry_basis: FLOOR_MODEL.provenance };
}

export function routeWalkthrough(zoneId = 'studio', exit = 'A', blocked = false) {
  if (!['west','east','meeting','studio','lobby'].includes(zoneId)) throw new Error('No walkthrough for this room');
  if (!['A','B'].includes(exit)) throw new Error('Unknown exit');
  const zone = ZONES[zoneId];
  const starts = {
    studio: [[704,397],[610,430],[550,430]],
    east: [[700,215],[625,320],[625,365],[610,430],[550,430]],
    west: [[200,215],[280,320],[280,365],[280,430],[350,430]],
    meeting: [[220,395],[280,430],[350,430]],
    lobby: [[449,158],[449,230],[449,360],[449,430]],
  };
  let points = [...starts[zoneId]];
  if (exit === 'A') {
    if (['west','meeting'].includes(zoneId)) points = points.slice(0,-1);
    points.push([350,430],[280,430],[205,430],[205,447],[205,479]);
  } else {
    if (['east','studio'].includes(zoneId)) points = points.slice(0,-1);
    points.push([550,430],[610,430],[742,430],[742,447],[742,479]);
  }
  // Drop revisits introduced by choosing the near-side exit, and adjacent duplicates.
  const cleaned = [];
  for (const p of points) {
    const previous = cleaned.findIndex((q) => q[0] === p[0] && q[1] === p[1]);
    if (previous >= 0) cleaned.splice(previous + 1);
    else cleaned.push(p);
  }
  const available = !(exit === 'B' && blocked);
  const length = cleaned.slice(1).reduce((n,p,i) => n + Math.hypot(p[0]-cleaned[i][0],p[1]-cleaned[i][1])/20,0);
  const steps = [
    { label: `Locate ${zone.label}`, detail: `${zone.occupants} registered in this zone; ${zone.assisted} assistance flags. These are fixture counts, not live occupancy.`, point: cleaned[0] },
    { label: 'Check the doorway', detail: 'The opening is inferred from the training drawing. Confirm the actual approved layout before using any real plan.', point: cleaned[1] },
    { label: 'Review the corridor', detail: 'This line illustrates a corridor connection, not smoke tenability, congestion or a validated accessible path.', point: cleaned[cleaned.length-3] },
    { label: `${available ? 'Review' : 'Stop: unavailable'} Stair ${exit}`, detail: available ? 'Available in the authored scenario only. A qualified person still decides whether a real route is usable.' : 'The Stair B inject removes this candidate. Playback stops; compare Stair A without treating it as a safety guarantee.', point: cleaned[cleaned.length-2] },
    { label: 'Hand off and account', detail: 'The model ends at this stair landing, not a place of safety. Confirm onward movement, assistance ownership and assembly accounting in the approved plan.', point: cleaned[cleaned.length-1] },
  ];
  return { zone_id: zoneId, zone: zone.label, exit: `Stair ${exit}`, available, points: cleaned, steps,
    diagram_metres: Number(length.toFixed(1)), fixture_metres: zone.nearestExit === `Stair ${exit}` ? zone.distanceM : zone.alternateDistanceM,
    maxStep: available ? 4 : 3, training_only: true, recorded_action: false,
    logic: [
      { label: 'Observe', text: `${zone.label}: ${zone.occupants} fixture occupants${zone.assisted ? `, ${zone.assisted} need assistance` : ''}.` },
      { label: 'Constraint', text: blocked ? 'Stair B is unavailable because the facilitator introduced that condition.' : 'Both exits are present in the scenario; no live route conditions are known.' },
      { label: 'Compare', text: `${available ? 'Preview' : 'Reject'} ${`Stair ${exit}`} in this exercise. The drawn line is ${Number(length.toFixed(1))} m; the separate authored distance is ${zone.nearestExit === `Stair ${exit}` ? zone.distanceM : zone.alternateDistanceM} m.` },
      { label: 'Human check', text: 'Verify the approved route, who helps whom and assembly accounting. A preview records no team action.' },
    ],
  };
}
