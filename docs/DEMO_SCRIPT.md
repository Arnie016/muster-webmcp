# Muster demo video · legacy 75-second cut

This original shot sheet is retained for provenance. The current judge-facing cut is the 132.544-second film described in [`FILM_V2_TREATMENT.md`](FILM_V2_TREATMENT.md) and built from the editable package in `trailer/`.

Original target: 75 seconds, 1920×1080, 30 fps. The cut remains understandable without audio; the approved AI narration reinforces the visible proof.

## Narrative promise

Muster is a shared command surface for rehearsing a fictional building incident. The facilitator introduces controlled changes, the agent reads and updates only the visible exercise state, and a human keeps final authority.

## Shot and narration script

| Time | Picture | On-screen copy | Optional narration |
| --- | --- | --- | --- |
| 00:00–00:06 | Generated documentary context: a commander and workplace wardens prepare around a real-looking floor plan. | **The fire is not rehearsal time.** | A fire drill changes when an exit fails and two people need help. |
| 00:06–00:13 | Show the real command-room capture at a readable scale. | **A plan is more than a map.** | Muster brings the building, people, equipment, and decisions onto one visible command surface. |
| 00:13–00:24 | Reconstruct the real runtime contract: type “Stair B is blocked. Check the Studio route.” Then reveal `inspect_zone`, `compare_routes`, and `analyze_route_sketch` as the floor changes. | **Ask once. Watch the plan change.** | Open Floor Seven, inspect a room, and draw a route. The agent reads the fictional occupants, exits, assistance needs, and assigned roles. |
| 00:24–00:35 | Hold on the real Floor 07 capture with the Studio, authored fire trail, drawn path, and blocked Stair B route. | **Stair B is unavailable.** | The facilitator introduces a controlled change: six people are in the studio, two need assistance, and Stair B is blocked. The drawn path is checked against that state. |
| 00:35–00:43 | Animate the causal architecture: facilitator request → manager → named tools → changed shared state → human decision. | **A request becomes a visible plan.** | An incident commander routes work to bounded plan, people, equipment, and review tools, all sharing the visible drill state. |
| 00:43–00:49 | Show a large, reconstructed trace table. Select each call to reveal its reason, visible change, and guardrail. | **Every call explains itself.** | Each call explains what happened, why it was allowed, and what visibly changed. |
| 00:49–01:00 | Show the designed after-action report and the deliberately absent agent approval tool. | **Agent prepares. Human approves.** | The agent compares routes, records confirmed actions, and stages the report. It cannot infer intent, contact responders, or approve the outcome. |
| 01:00–01:09 | Proof ledger: working public interface, 500 workflows, 19 contracts, and native Chrome execution. | **Proof, with boundaries.** | Five hundred shuffled workflows test the state transitions and human approval gate. Chrome separately discovers and executes the page tools. |
| 01:09–01:15 | Final frame with the live URL and one action. | **Try the live drill.** | Muster is fictional training software. Try the live drill. |

## Architecture shown in the film

```text
Human facilitator: “Stair B is blocked. Check the Studio route.”
       │
       ▼
Incident Commander
       ├── inspect_zone → Studio · 6 people · 2 assisted
       ├── compare_routes → Stair B unavailable
       ├── analyze_route_sketch → 30.1 m · endpoint Stair A
       └── check_coverage → 1 assistance owner missing
                         │
                         ▼
Same visible floor: zone · exit · route · owner
                         │
                         ▼
Human assigns responsibility and approves
```

The architecture scene must not imply autonomous emergency control. Page tools inspect or update a fictional rehearsal; they do not call responders, trigger alarms, control doors, infer intent, certify equipment, or approve the report.

## Capture refresh contract

The editable package expects two proof roles, not hard-coded filenames:

- `command-room`: the opening state with the blueprint, guided path, runtime trace, and conversation surface visible.
- `review`: the completed rehearsal with a changed route, visible trace, and staged review state.

Replace either source image, then run `npm run proof:sync` inside `trailer/`. The composition reads the stable destinations in `trailer/public/proof/`, so no timeline code needs to change.

## Audio production

- Keep narration at a calm incident-brief pace. Use only natural sentence and scene-transition pauses.
- Never include task instructions, rehearsal chatter, or a spoken preamble in the final audio.
- Captions carry the full story; narration should never be required to understand a safety boundary.
- The final narration is generated from this approved script with GPT Realtime 2.1. It is an AI voice, not a human firefighter recording. The repair script removes the unwanted 0–5.65 second preamble from the retained raw take.

## Required honesty

- Fictional training data, not live occupancy or sensor data.
- Human-only final approval.
- No emergency calls, dispatch, alarms, door control, or live evacuation guidance.
- Tool contracts and local tests are current proof.
- Native WebMCP discovery and `read_plan` execution were observed in Chrome 152 with WebMCP testing enabled; this does not prove support in every browser.
