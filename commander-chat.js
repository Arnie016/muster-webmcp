// Deterministic, read-only question routing. Not an LLM or hidden reasoning.
const call = (name, input = {}) => ({ name, input });
const route = (kind, intent, calls, extra = {}) => ({ kind, intent, calls, ...extra });

export function routeQuestion(raw, context = {}) {
  const q = raw.toLowerCase().replace(/[’']/g, '').replace(/\b(swaht|waht|wat)\b/g, 'what').replace(/\b(floo|flor)\b/g, 'floor');
  const zone = ['studio', 'meeting', 'west', 'east', 'lobby', 'electrical'].find((name) => q.includes(name)) || (/7.?e/.test(q) ? 'electrical' : null);
  const floor = q.match(/\b(?:floor|level|f)\s*0?(\d{1,2})\b/);
  const requestedFloor = floor ? Number(floor[1]) : context.selectedFloor || 7;
  const meta = { zone: zone || context.zone || 'studio', requestedFloor, query: q };
  if (/\b(real fire|actual fire|on fire|trapped|call 995|dispatch|emergency now)\b/.test(q)) return route('emergency', 'Outside this training app', [], meta);
  if (/\b(approve|delete|reset|restart|assign|record|block|unblock|start|resume|continue|next|begin|run|simulate)\b/.test(q) && !/\b(why|when|where|who|what|which|how many)\b/.test(q)) return route('next', 'Show the next action for your confirmation', [call('read_status_board')], meta);
  if (/\b(next|progress|stuck|help|guide|how.*(?:play|use|work|proceed|continue|start)|what.*(?:do|now))\b/.test(q)) return route('next', 'Find your next step without restarting', [call('read_status_board')], meta);
  if (/\b(webmcp|mcp|llm|model|real ai|chatgpt|thinking|runtime|what can you)\b/.test(q)) return route('capability', 'Explain how this session works', [], meta);
  if (requestedFloor !== 7 && !/\b(history|previous|site|assembly|storeys|floors)\b/.test(q)) return route(/\b(dimensions|size|width|length|scale)\b/.test(q) ? 'dimensions' : 'floor', 'Read this floor without borrowing another floor’s data', [call('read_plan')], meta);
  if (/\b(extinguisher|extinguishers|hose|equipment|call point|holding point|sprinkler|where.*alarm|alarm.*location)\b/.test(q)) return route('equipment', 'Find equipment and its recorded location', [call('read_equipment')], meta);
  if (zone && /\b(dimension|dimensions|size|width|length|3d|interior|furniture|room profile)\b/.test(q)) return route('room', 'Read the room geometry and equipment', [call('read_room_profile', { room_id: zone })], meta);
  if (/\b(history|previous|lesson|last drill|prehistory)\b/.test(q)) return route('history', 'Read the dated exercise lessons', [call('read_lessons')], meta);
  if (/\b(report|review|coverage|gap|gaps|missing|unassigned|owner|assistance|assist|medical)\b/.test(q)) return route('gaps', 'Check responsibilities against recorded actions', [call('read_floor_register'), call('check_coverage')], meta);
  if (/\b(fire|smoke|hazard|spread|burn|cause|alarm|signal)\b/.test(q) && !/fire safety manager/.test(q)) return route('hazard', 'Read the current scripted condition', [call('read_hazard')], meta);
  if (/\b(exit|exits|stair|stairs|route|routes|distance|nearest|escape)\b/.test(q)) return route('routes', 'Compare the recorded exit options', [call('compare_routes', { zone_id: meta.zone === 'electrical' ? 'lobby' : meta.zone })], meta);
  if (/\b(dimensions|dimension|size|wide|width|length|area|scale)\b/.test(q)) return route('dimensions', 'Read the schematic dimensions', [call('read_plan')], meta);
  if (/\b(where.*(?:building|located)|address|assembly|site|storeys|stories|floors|singapore)\b/.test(q)) return route('site', 'Read the building and assembly context', [call('read_site_context')], meta);
  if (/\b(rahman|mei|kumar|tan|commander|warden|wardens|security|roles|role|in charge|who)\b/.test(q) && !/who.*(?:floor|studio|room)/.test(q)) return route('roles', 'Look up the named exercise roles', [call('read_plan'), call('read_floor_register')], meta);
  if (/\b(people|person|occupants|occupancy|count|headcount|how many|who.*floor)\b/.test(q) && !zone) return route('people', 'Read the people register', [call('read_floor_register')], meta);
  if (/\b(status|accounted|clearance|complete|happened|done)\b/.test(q)) return route('status', 'Read what has actually been recorded', [call('read_status_board')], meta);
  if (zone) return route('zone', `Inspect ${zone} on the plan`, [call('inspect_zone', { zone_id: zone })], meta);
  if (/\b(floor|level|plan|schematic|drawing|where am i|building)\b/.test(q)) return route('floor', 'Read the selected floor and available schematics', [call('read_plan')], meta);
  return route('unknown', 'Clarification needed', [], meta);
}

export function answerQuestion(request, results, context = {}) {
  const get = (name) => results.find((r) => r.name === name)?.result;
  const register = get('read_floor_register');
  const status = get('read_status_board');
  const plan = get('read_plan');
  const next = context.nextLabel ? `Next: ${context.nextLabel}. Use the orange button when you are ready.` : 'The draft is ready. Open the report for the separate human review.';
  if (request.kind === 'emergency') return 'This is a fictional drill, not an emergency service. For a real emergency, stop using this app and contact your local emergency services. No calls or dispatches were made.';
  if (request.kind === 'unknown') return 'I did not match that to a supported drill question. I can read floors, people, roles, exits, equipment, the current condition, and recorded actions. Try “Where is the extinguisher?” or “What do I do next?” No tool was called and nothing was changed.';
  if (request.kind === 'capability') return 'This chat is a local, deterministic tool router, not a hosted language model. It matches supported drill questions, calls named tools, and displays their real input and output here.\nWebMCP lets a compatible browser agent discover and call those same page tools. An external agent can supply language-model planning; this demo does not pretend that one is connected. Changes and final approval remain human-controlled.';
  if (request.kind === 'next') return `${status.status === 'ready' ? 'The scenario has not started.' : `Your scenario is ${status.status}. Your recorded progress is kept.`}\n${next}\nTyping here will not reset, assign a person, or approve a report.`;
  if (request.kind === 'floor' || request.kind === 'dimensions') {
    const f = plan.floor_catalog.find((item) => item.floor === request.requestedFloor);
    if (!f) return `Floor ${request.requestedFloor} is part of the 18-floor 3D model, but no schematic is loaded for it. Floor 07 contains the drill. Floors 03 and 12 are reference plans. Use Resume scenario to return to Floor 07 without losing progress.`;
    if (request.kind === 'dimensions') return `Floor ${String(f.floor).padStart(2, '0')}: ${f.width_m} m × ${f.depth_m} m, drawing scale 1:200. These are fictional schematic dimensions, not a surveyed building. Route measurements are shown separately.`;
    return `Floor ${String(f.floor).padStart(2, '0')} · ${f.label}. ${f.actionable ? 'This is the active drill floor.' : 'This is a reference plan, not an executable drill.'}\n${f.occupants} fictional occupants; ${f.assisted} need assistance. Drawing ${f.drawing}, revision ${f.revision}. ${f.actionable ? next : 'Resume scenario returns to Floor 07.'}`;
  }
  if (request.kind === 'people') return `${register.zones.reduce((sum, z) => sum + z.occupants, 0)} people are listed on Floor 07.\n${register.zones.map((z) => `${z.zone}: ${z.occupants}`).join(' · ')}.\n${register.assisted_total} need assistance. ${register.assistance_owner ? `Recorded owner: ${register.assistance_owner}.` : 'No assistance owner has been recorded yet.'} These are exercise counts, not live occupancy.`;
  if (request.kind === 'roles') {
    const names = plan.roles.filter((r) => request.query.includes(r.person?.toLowerCase().split(' ').at(-1) || '___') || request.query.includes(r.label.toLowerCase()));
    return `${(names.length ? names : plan.roles).map((r) => `${r.label}: ${r.person || register.assistance_owner || 'not assigned'}`).join('\n')}\nThese are fictional exercise roles. Only a human can approve the final report.`;
  }
  if (request.kind === 'equipment') {
    const items = get('read_equipment').equipment;
    const matched = items.filter((i) => request.query.includes(i.type.toLowerCase()) || (request.query.includes('hose') && i.type === 'Hose reel') || (request.query.includes('extinguisher') && i.type === 'Extinguisher'));
    return `${(matched.length ? matched : items).map((i) => `${i.type} (${i.id}) — ${i.room}.`).join('\n')}${/alarm|detector/.test(request.query) ? '\nScripted detector signal: beside electrical room 7-E. No physical alarm is connected.' : ''}\nThese are plan locations, not confirmation that equipment is serviceable. Sprinklers have no individual inventory positions in this demo.`;
  }
  if (request.kind === 'routes') {
    const result = get('compare_routes');
    return `From ${result.zone}:\n${result.alternatives.map((a) => `${a.exit}: ${a.distance_m} m, ${a.scenario_status} in this exercise.`).join('\n')}\nThis compares fictional distances; it is not a real evacuation instruction.`;
  }
  if (request.kind === 'room') {
    const r = get('read_room_profile').spatial_profile;
    return `${r.label}, Floor 07: ${r.width} × ${r.depth} m in the authored drawing. ${r.occupants} fixture occupants, ${r.assisted} assistance flags.\n${r.equipment.length ? r.equipment.map(e=>`${e.type}: ${e.room}`).join('\n') : 'No individually located equipment item is in this room’s register.'}\nThe 3 m height, door openings and furniture are illustrative, not a surveyed model. Use 3D rooms to inspect the cutaway.`;
  }
  if (request.kind === 'hazard') {
    const h = get('read_hazard');
    return `${h.source_zone ? `The scripted signal is beside ${h.source_zone}, at ${h.scripted_phase}.` : 'No smoke signal is active yet.'} ${h.unavailable_route ? `${h.unavailable_route} is unavailable in this exercise.` : 'Neither stair has been removed by the scenario.'}\nThere is no measured fire-spread rate, live alarm, or verified cause. The orange trail is a storytelling layer. ${next}`;
  }
  if (request.kind === 'gaps') {
    const gaps = get('check_coverage').unresolved;
    return `Coverage means checking whether each scenario event has a recorded team response and owner.\n${gaps.length ? `Unfinished records:\n${gaps.map((g) => `• ${g.label}`).join('\n')}` : 'Every currently active event has a recorded response.'}\n${register.assistance_owner ? `Assistance owner: ${register.assistance_owner}.` : `${register.assisted_total} people need assistance; that owner is still unassigned.`}\n${next}`;
  }
  if (request.kind === 'status') return `Scenario: ${status.status}.\nAccounting: ${status.fixture_accounting_recorded ? 'recorded' : 'not recorded'}. Alternate route: ${status.alternate_route_recorded ? 'recorded' : 'not recorded'}. Assistance owner: ${status.assistance_owner_recorded ? 'recorded' : 'not recorded'}.\n${next} No real floor clearance is claimed.`;
  if (request.kind === 'zone') {
    const z = get('inspect_zone');
    return `${z.zone}: ${z.fixture_occupants} people, ${z.assisted_occupants} needing assistance. ${z.plan_distance_metres} m to ${z.nearest_plan_exit}; ${z.nearest_exit_blocked_in_scenario ? 'that stair is unavailable' : 'available'} in this exercise. The plan highlights this group.\n${next}`;
  }
  if (request.kind === 'history') return get('read_lessons').lessons.map((l) => `${l.date}: ${l.finding} Change: ${l.change}`).join('\n') + '\nThese are fictional training records, not real incidents.';
  if (request.kind === 'site') {
    const site = get('read_site_context');
    return `${site.storeys} storeys · ${site.setting}.\nAssembly: ${site.primaryAssembly}. Alternate: ${site.alternateAssembly}.\nAccess: ${site.applianceAccess}. No live map or fire-station availability is connected.`;
  }
  return 'No supported answer was returned. Nothing was changed.';
}
