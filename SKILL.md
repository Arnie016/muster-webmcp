---
name: muster-fire-drill
description: Operate Muster's fictional tabletop fire-drill page through its bounded WebMCP tools, including plan inspection, scripted injects, facilitator-confirmed records, coverage checks, and human-approved review. Use only for training scenarios, never live emergencies or building control.
---

# Muster operator

Operate the same visible exercise state as the human facilitator. Keep every claim tied to a returned tool result. Before an unfamiliar or multi-step run, read [docs/OPERATOR_GUIDE.md](docs/OPERATOR_GUIDE.md).

## Non-negotiable boundaries

- Treat every site, person, count, dimension, date, route, hazard, equipment record, and lesson as a fictional training fixture.
- Do not present Muster as a live sensor, fire-spread model, evacuation authority, compliance check, or emergency-service integration.
- Never infer floor clearance, equipment adequacy, human intent, emotion, personality, or competence.
- Do not record an action or participant signal until the human facilitator confirms what was observed.
- The agent may stage a report; only the human Fire Safety Manager may approve it in the page. Approval is not a WebMCP tool.
- Stop using Muster during a real emergency and follow the official local emergency process.
- A normal browser may expose only the manual interface. Do not claim native WebMCP discovery unless `document.modelContext` registration is observed in a compatible browser.

## Tool surface

Muster defines one manager and eighteen specialist tools:

| Tool | Input | Operator use |
|---|---|---|
| `run_drill_manager` | `intent`: `orient`, `find_gaps`, `inspect_equipment`, `read_history`, `read_status`, `inspect_zone`, `rehearse`, or `prepare_review`; optional `zone_id` | Route a high-level request. `rehearse` runs the scripted sequence and stages a report; use it only when the human explicitly asks for the full demo. |
| `read_plan` | none | Read the selected fictional building, floor, plan revision, aggregate occupants, exits, and missing role. |
| `start_drill` | none | Start the fictional scenario and add the initial smoke inject. No alarm, call, dispatch, or building control occurs. |
| `send_inject` | `inject_id`: `stair` or `roster` | Add one authored complication after the exercise has started. |
| `record_action` | `action_id`: `reroute`, `account`, or `assist` | Preserve a facilitator-confirmed team action and named owner. |
| `check_coverage` | none | Find active injects without the required recorded response; this does not judge a real response. |
| `stage_report` | none | Create an after-action draft from the exercise log. Human approval remains required. |
| `inspect_zone` | `zone_id`: `west`, `east`, `meeting`, `studio`, `lobby`, or `electrical` | Focus a zone and return fictional occupancy, assistance, nearest exit, and plan distance. |
| `compare_routes` | `zone_id`: `west`, `east`, `meeting`, `studio`, or `lobby` | Compare fictional plan distances and scripted route availability, never direct a live evacuation. |
| `analyze_route_sketch` | `zone_id`: any declared zone; `points`: 2–80 `{x, y}` points inside the fictional 900×610 plan | Measure a facilitator-drawn path, identify its nearest endpoint exit, and flag scripted availability. A qualified human must approve any real route. |
| `read_drill_guide` | `phase`: `before`, `during`, or `after` | Read an exercise checklist, not emergency instructions. |
| `read_hazard` | none | Read the current authored scenario phase; it is not a fire-spread prediction or sensor feed. |
| `read_floor_register` | none | Read aggregate fictional zone counts and assistance ownership; no personal data is returned. |
| `read_status_board` | none | Read facilitator-recorded exercise status without claiming floor clearance. |
| `read_site_context` | none | Read fictional setting, assembly areas, access notes, and explicit live-data limits. |
| `read_room_profile` | `room_id`: `west`, `east`, `meeting`, `studio`, `lobby`, or `electrical` | Focus a room and read its fictional use, protection fixtures, and operating context without inferring cause. |
| `read_equipment` | none | Read equipment shown on the plan; presence, serviceability, adequacy, and compliance are not certified. |
| `read_lessons` | none | Read dated fictional exercise findings and their recorded changes. |
| `record_human_signal` | `role_id`: `fsm`, `security`, `warden-east`, `warden-west`, or `mobility`; `signal`: `confirms`, `uncertain`, `disagrees`, or `delayed` | Record only a facilitator-observed signal, with no psychological or competence inference. |

## Safe operating loop

1. Orient with `read_plan`, `read_site_context`, and `read_floor_register`.
2. Ask the facilitator before changing exercise state.
3. Use `start_drill`, then add at most the requested scripted inject with `send_inject`.
4. Inspect relevant zones, rooms, hazards, routes, or equipment before proposing a training response. Use `analyze_route_sketch` only for a facilitator-drawn path on the fictional plan.
5. Ask what the team actually did; only then call `record_action` or `record_human_signal`.
6. Call `check_coverage`. If gaps remain, name them and return control to the facilitator.
7. Call `stage_report` only when asked or after the facilitator accepts the recorded actions. State that approval is still human-only.

Keep summaries short: observation, source tool, unresolved gap, and next human decision. Never turn fictional proximity or history into a cause claim.
