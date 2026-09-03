# Muster demo video

Target: 90 seconds, 1920×1080, 30 fps. The cut remains understandable without audio; the approved AI narration reinforces the visible proof.

## Narrative promise

Muster is a shared command surface for rehearsing a fictional building incident. The facilitator introduces controlled changes, the agent reads and updates only the visible exercise state, and a human keeps final authority.

## Shot and narration script

| Time | Picture | On-screen copy | Optional narration |
| --- | --- | --- | --- |
| 00:00–00:05 | Start on the real blueprint in its changed-condition state. A restrained red route resolves into view. | **A blocked exit changes everything.** | A fire drill changes when an exit fails and two people need help. |
| 00:05–00:15 | Pull back to the real orbitable building and command-room capture. Hold long enough to read the floor selector, workflow, live trace, and conversation bar. | **One shared rehearsal surface.** | Muster brings the building, people, equipment, and decisions onto one visible command surface. |
| 00:15–00:27 | Open Floor 07, inspect a room, and reveal the fixture facts. | **Read the plan first.** | Open Floor Seven, inspect a room, and draw a route. The agent reads the fictional occupants, exits, assistance needs, and assigned roles. |
| 00:27–00:39 | Focus the Studio, authored fire trail, drawn path, and blocked Stair B route. | **Stair B is unavailable.** | The facilitator introduces a controlled change: six people are in the studio, two need assistance, and Stair B is blocked. The drawn path is checked against that state. |
| 00:39–00:52 | Replace the screenshot with the editable architecture scene. The Incident Commander fans out to four specialists, which call bounded page tools against one shared state. | **One manager. Bounded specialists.** | An incident commander routes work to bounded plan, people, equipment, and review tools, all sharing the visible drill state. |
| 00:52–01:04 | Return to the review capture and isolate the visible WebMCP call trace. Tool receipts enter one at a time. | **Every call leaves a trace.** | Each call explains what happened, why it was allowed, and what visibly changed. |
| 01:04–01:15 | Show the designed after-action report: scenario changes, recorded actions, observations, open gaps, and the approval boundary. | **Agent prepares. Human approves.** | The agent compares routes, records confirmed actions, and stages the report. It cannot infer intent, contact responders, or approve the outcome. |
| 01:15–01:23 | Proof ledger. Separate what is observed from what remains to be captured. | **Proof, with boundaries.** | Five hundred shuffled workflows test the state transitions and human approval gate. Native WebMCP capture remains pending. |
| 01:23–01:30 | Quiet final frame with the live URL and one button-shaped lockup. | **Try the live drill.** | Muster is fictional training software. Try the live drill. |

## Architecture shown in the film

```text
Human facilitator
       │ confirms observations and final approval
       ▼
Incident Commander
       ├── Plan specialist
       ├── People specialist
       ├── Equipment specialist
       └── Review specialist
                  │
                  ▼
       18 bounded page tools
                  │
                  ▼
       Same visible drill state
```

The architecture scene must not imply autonomous emergency control. Page tools inspect or update a fictional rehearsal; they do not call responders, trigger alarms, control doors, infer intent, certify equipment, or approve the report.

## Capture refresh contract

The editable package expects two proof roles, not hard-coded filenames:

- `command-room`: the opening state with the blueprint, guided path, runtime trace, and conversation surface visible.
- `review`: the completed rehearsal with a changed route, visible trace, and staged review state.

Replace either source image, then run `npm run proof:sync` inside `trailer/`. The composition reads the stable destinations in `trailer/public/proof/`, so no timeline code needs to change.

## Audio production

- Keep narration at a calm incident-brief pace, approximately 125–135 words per minute.
- Leave short pauses after “Stair B is unavailable” and “Human approves.”
- Captions carry the full story; narration should never be required to understand a safety boundary.
- The final narration is generated from this approved script with GPT Realtime 2.1. It is an AI voice, not a human firefighter recording.

## Required honesty

- Fictional training data, not live occupancy or sensor data.
- Human-only final approval.
- No emergency calls, dispatch, alarms, door control, or live evacuation guidance.
- Tool contracts and local tests are current proof.
- Native WebMCP discovery has not been observed in the available test browser; a compatible-browser capture remains pending.
