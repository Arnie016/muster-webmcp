# Muster: The Agentic Fire Drill

**Tagline:** A WebMCP command room where a facilitator and an agent rehearse a changing building incident on the same visible plan.

## Hook

Muster turns a tabletop fire drill into one shared, inspectable sequence. A Fire Safety Manager can read a fictional building plan, introduce a scripted condition such as an unavailable stair, record the response the team actually chose, find responsibilities without owners, and prepare an after-action draft. The agent works on the same page and leaves a visible receipt for every call, while the final decision remains with the human facilitator.

## The problem

Tabletop drills often split the plan, occupant register, team roles, scenario notes, decisions, and review across separate files and conversations. When a condition changes, the team can lose track of what changed, who owns the response, and what evidence belongs in the review.

## What it does

- Guides a facilitator through five steps: read the plan, start the fictional scenario, change one condition, record the team response, and review the evidence.
- Shows an orbitable 18-floor training twin, an inspectable Floor 07 plan, fictional people and roles, two route options, planned equipment, and a facilitator-drawn route receipt.
- Keeps every tool call in a live trace with its input, result, purpose, visible page change, and boundary.
- Checks whether each active exercise problem has a recorded owner, then stages an after-action draft for human approval.
- Includes three loaded plan fixtures. Only the Floor 07 office rehearsal is currently executable; the retail and care-suite plans are reference views.

## How it works

A deterministic JavaScript state machine holds the fictional drill state in the browser. One manager routes requests to plan, people, equipment, and review specialists, which use 18 bounded page tools. Those tools read or update the same interface the facilitator sees. The current demo stores its state locally and has no server connection to building systems, responders, or emergency services.

## Why WebMCP matters

Without WebMCP, the visible controls still run the rehearsal manually. When `document.modelContext` is available, Muster attempts to register the same 19 contracts so an agent can discover named actions, receive structured results, and make its work visible on the page. This makes the website a shared work surface rather than a chat window beside a disconnected plan.

The proof has two distinct layers. The source contains the registration code, and the test suite verifies one manager plus 18 page tools. Those checks do not prove browser discovery. Separately, a current Chrome 152 capture with WebMCP testing enabled shows all 19 tools discovered through `document.modelContext`; Chrome then invoked `read_plan` with `document.modelContext.executeTool`, and the result appeared in the page's Live trace. That is native compatible-browser discovery and execution proof for the tested tab. It is not proof that every judge browser exposes the API.

## Human and agent boundary

The agent can read fictional plan context, focus a room, compare scripted route availability, measure a drawn path, add an authored exercise change when asked, record a facilitator-confirmed action, check ownership gaps, and stage a report. It cannot approve that report. The human chooses when to run or advance the exercise, supplies observations, confirms actions and owners, and uses the separate approval control.

All names, people, counts, locations, dimensions, equipment records, timestamps, and incidents in this demo are fictional training fixtures. Muster does not monitor a real building, infer real clearance, certify equipment or routes, trigger alarms, control doors, dispatch responders, or provide instructions for a live emergency. Real operational use is not demonstrated by this submission.

## Challenge and build notes

The first design exposed many useful controls but left a new user unsure where to begin or what a route change meant. We rebuilt the experience around one step-at-a-time rehearsal, made the building and floor plan directly inspectable, added fictional responder profiles and assistance ownership, and made route state visible in both the 3D twin and plan. We also made each tool contract readable before use and each runtime call inspectable afterward.

The product is static HTML, CSS, and JavaScript with a vendored Three.js runtime and a CSS fallback. The trailer package is driven by an editable manifest. Its local replacement master validates at 135 seconds, 1920 by 1080, 30 fps, with 17 contiguous scenes and product proof beginning at 11.5 seconds.

## Accomplishments

- Built a complete fictional rehearsal from plan read through staged review and human approval.
- Kept 19 page-tool contracts visible and aligned with the current source.
- Passed the current local test suite, including six people-data tests and 500 shuffled workflows covering repeat-safe actions, invalid transitions, route boundaries, and approval gates.
- Preserved one visible trail from human request to manager, specialist, tool result, page change, and open gap.
- Produced desktop and mobile evidence captures plus a validated 135-second replacement film master.

## What we learned

WebMCP is most useful when an agent changes a visible, reviewable work surface and the person can inspect the consequence. We also learned that operational-looking data needs precise labels: a fictional count is not occupancy, a drawn path is not an approved evacuation route, and a prepared report is not a human decision.

## Future work

Next, repeat the native-browser check against the public deployment and add an agent-driven end-to-end evaluation set for the manager intent router. Any move beyond fictional training would be a separate, permissioned project requiring approved plan imports, authentication, access controls, professional review, and evidence from real users. It is not part of the current proof.

## Links and proof status

- **Live demo:** https://muster-fire-drill.vercel.app/

  Verified reachable on 4 September 2026. Its `index.html` and `app.js` match public `main` at commit `1113b882cb967bd9679c4109a08a67cf1649d85a`, not the newer local UI revisions.

- **Public source:** https://github.com/Arnie016/muster-webmcp

  Verified public. Exact published commit: https://github.com/Arnie016/muster-webmcp/commit/1113b882cb967bd9679c4109a08a67cf1649d85a

- **WebMCP registration source:** https://github.com/Arnie016/muster-webmcp/blob/1113b882cb967bd9679c4109a08a67cf1649d85a/app.js#L946-L951
- **Tool-count test:** https://github.com/Arnie016/muster-webmcp/blob/1113b882cb967bd9679c4109a08a67cf1649d85a/tests.mjs#L57-L60

- **Current public video:** https://youtu.be/FOoBfOHPIho

  Verified public. This is the earlier short cut, not the 135-second local replacement.

- **Devpost project:** https://devpost.com/software/muster-the-agentic-fire-drill

  Exact URL recorded in the submission receipt. **RECHECK REQUIRED:** the unauthenticated audit received HTTP 403, so public page access was not independently confirmed.

- **Replacement 135-second video:** `[PENDING PUBLIC URL]`

  Local validated master: `trailer/out/muster-demo.mp4`.

- **Latest local UI and source:** `[PENDING PUSH AND REDEPLOY]`

- **Native WebMCP local evidence:** `[PENDING COMMIT AND PUBLIC LINK]`

  Current capture: `docs/screenshots/muster-native-webmcp.png`. It shows `WebMCP live`, 19 registered tools, and a native `read_plan` result in the visible trace. The public deployment still needs the same post-deploy check.

## 30-second judge path

1. Open the live demo and click **Inspect Floor 07**.
2. In the Incident Commander dock, click **Run demo**.
3. Watch the authored signal appear, Stair B become unavailable, and the missing assistance owner become explicit.
4. Open a **Live trace** row to inspect why the tool ran and what changed on the page.
5. Find the staged after-action draft and the separate human approval control. Treat every person and count shown as fictional training data.
