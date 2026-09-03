# Muster operator guide

This guide is the detailed companion to [`SKILL.md`](../SKILL.md). It describes the tool contract currently implemented in `app.js` and the deterministic exercise state in `drill-core.js`.

## What the operator controls

Muster is a shared tabletop-exercise surface. WebMCP calls update the same page state and visible trace used by the facilitator. State is stored locally in the browser for the fictional demo; the current product does not provide multiplayer synchronization, live occupancy, alarms, calls, dispatch, door control, or emergency-service connectivity.

The implemented sequence is:

`ready` → `running` → `review` → human approval → `complete`

- `start_drill` moves `ready` to `running` and adds the authored smoke signal.
- `send_inject`, `record_action`, and `record_human_signal` add exercise records while running.
- `stage_report` moves the exercise to `review`, even if its draft still reports unresolved gaps.
- Approval is a human-only page action. No tool can call it.
- Invalid transitions fail closed; do not retry by inventing state.

## Manager routing

Use `run_drill_manager` when the human gives a high-level intent and wants the page to choose the bounded specialist sequence.

| Intent | Current behavior |
|---|---|
| `orient` | Calls `read_plan` and `read_floor_register`. |
| `find_gaps` | Calls `read_floor_register` and `check_coverage`. |
| `inspect_equipment` | Calls `read_equipment` and opens the equipment view. |
| `read_history` | Calls `read_lessons` and opens the lessons view. |
| `read_status` | Calls `read_status_board`. |
| `inspect_zone` | Calls `inspect_zone`; `zone_id` is optional and currently defaults to `studio`. |
| `prepare_review` | Calls `check_coverage`; it stages the report only when no active gaps remain. |
| `rehearse` | Runs the complete scripted demonstration and stages the report. This is a broad state-changing action, so obtain explicit human intent first. |

The manager is not an emergency commander, autonomous safety authority, or independent model. It is a deterministic router over the page tools.

## Mutation and confirmation rules

Read tools may still change the visible focus or trace. Treat the following as state-changing from the operator's perspective:

- `run_drill_manager`
- `start_drill`
- `send_inject`
- `record_action`
- `stage_report`
- `inspect_zone`
- `analyze_route_sketch` (read-only for drill decisions, but it changes the visible sketch and trace)
- `read_room_profile`
- `record_human_signal`

Before `record_action`, repeat the action label and owner to the facilitator and obtain confirmation. The only available records are:

| `action_id` | Recorded action | Recorded owner | Addresses |
|---|---|---|---|
| `reroute` | Route east and west zones to Stair A | East and West Fire Wardens | Stair B unavailable inject |
| `account` | Recheck Floor 7 register at assembly area | Chief Security | Initial smoke inject |
| `assist` | Assign mobility assistance pair | CERT Lead | Missing assistance-owner inject |

Before `record_human_signal`, confirm both the role and directly observed signal. “No response” is not consent; silence must not be converted to `confirms`.

## Example workflows

### 1. Read-only orientation

Use when a facilitator asks, “What does this drill know?”

1. `read_plan`
2. `read_site_context`
3. `read_floor_register`
4. Optionally `read_equipment` and `read_lessons`

Return: the fictional plan revision, aggregate register, missing role, and data limitations. Do not start the drill.

### 2. Inspect the blocked-route problem

Use after the human asks to run the route scenario.

1. Confirm that starting or changing the exercise is intended.
2. `start_drill` if the page is still ready.
3. `send_inject({"inject_id":"stair"})`
4. `inspect_zone({"zone_id":"studio"})`
5. `compare_routes({"zone_id":"studio"})`
6. If the facilitator has drawn a path, call `analyze_route_sketch` with 2–80 plan coordinates. Report its measured fixture length, endpoint, and scripted availability exactly as returned.
7. Explain the fictional distances and scripted availability without recommending a real evacuation route.
8. Ask what the team chose. If confirmed, `record_action({"action_id":"reroute"})`.
9. `check_coverage`

### 3. Resolve the assistance-owner gap

1. `read_floor_register`
2. `send_inject({"inject_id":"roster"})` only while the drill is running and with facilitator intent.
3. `check_coverage`
4. Ask who took responsibility in the exercise.
5. If the facilitator confirms the predefined record, `record_action({"action_id":"assist"})`.
6. If directly observed, optionally record a role signal with `record_human_signal`.
7. `read_status_board`, then `check_coverage` again.

Do not create personal records, infer why someone was delayed, or claim the assisted occupants are real people.

### 4. Prepare the after-action draft

1. `read_status_board`
2. `check_coverage`
3. If gaps remain, report them and stop. The facilitator must decide what to record.
4. If no gaps remain and the facilitator wants a draft, use `stage_report` or `run_drill_manager({"intent":"prepare_review"})`.
5. Report the draft ID, counts, status, and unresolved items exactly as returned.
6. End with: “The draft is staged; a human Fire Safety Manager must review and approve it in the page.”

### 5. Full judge demonstration

Use `run_drill_manager({"intent":"rehearse"})` only when the human explicitly asks for the complete scripted demo. It performs multiple state changes and stages a report. After it finishes, show the visible trace, call `read_status_board`, and leave approval to the human.

## Failure handling

- If a tool reports that the exercise must be started, do not fabricate progress. Ask whether to call `start_drill`.
- If `check_coverage` returns unresolved items, do not bypass them or stage a “complete” claim.
- If an input is outside the declared enum, show the allowed options and ask for a valid choice.
- If a route sketch has fewer than 2 or more than 80 points, leaves the 900×610 fictional plan, stops before an exit, or reaches a scripted unavailable exit, report that result for facilitator review; do not reinterpret it as an approved route.
- If native WebMCP tools are not discoverable, use the visible manual interface or stop. The repository contains registration code, but that alone is not proof of successful discovery in the current browser.
- If the situation is real rather than a tabletop exercise, stop operating Muster and direct the user to the official local emergency process.

## Truthful output pattern

Use this compact structure after a tool sequence:

```text
Observed: [what the returned fictional state says]
Recorded: [facilitator-confirmed action or signal, if any]
Open gap: [exact unresolved item, or none]
Boundary: Training fixture; no live clearance, equipment certification, or emergency action.
Human next step: [one decision or approval]
```

## Installation and discovery boundary

For a local Codex installation, place this repository folder—or a copy containing `SKILL.md` and `docs/OPERATOR_GUIDE.md`—in the configured skills directory. Loading this skill teaches the operator the contract; it does not itself connect the browser or register tools.

Muster's source attempts registration through `document.modelContext.registerTool` only when that API exists. Confirm the compatible browser reports successful registration before claiming live native WebMCP use. Otherwise, describe the code contract and manual page behavior separately.
