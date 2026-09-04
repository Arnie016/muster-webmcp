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
- Provides a single Start/Resume scenario action. Exploring a model-only floor never resets the rehearsal: the action returns to Floor 07 and preserves the recorded progress.

## How it works

A deterministic JavaScript state machine holds the fictional drill state in the browser. One manager routes requests to plan, people, equipment, and review specialists, which use 18 bounded page tools. Those tools read or update the same interface the facilitator sees. The current demo stores its state locally and has no server connection to building systems, responders, or emergency services.

## Why WebMCP matters

Without WebMCP, the visible controls still run the rehearsal manually. When `document.modelContext` is available, Muster attempts to register the same 19 contracts so an agent can discover named actions, receive structured results, and make its work visible on the page. This makes the website a shared work surface rather than a chat window beside a disconnected plan.

The proof has two distinct layers. The source contains the registration code, and the test suite verifies one manager plus 18 page tools. Those checks do not prove browser discovery. Separately, a current Chrome 152 capture with WebMCP testing enabled shows all 19 tools discovered through `document.modelContext`. Chrome invoked `read_plan`, routed the manager's `orient` intent, and then executed the declared fictional rehearsal through native page-tool calls: start, inspect, change one exit, compare, record three confirmed actions, check coverage, and prepare review. The page reached “Ready for human review” and stopped before approval. That is native compatible-browser discovery and consequential execution proof for the tested tab. It is not proof of autonomous planning or that every judge browser exposes the API.

## Human and agent boundary

The agent can read fictional plan context, focus a room, compare scripted route availability, measure a drawn path, add an authored exercise change when asked, record a facilitator-confirmed action, check ownership gaps, and stage a report. It cannot approve that report. The human chooses when to run or advance the exercise, supplies observations, confirms actions and owners, and uses the separate approval control.

All names, people, counts, locations, dimensions, equipment records, timestamps, and incidents in this demo are fictional training fixtures. Muster does not monitor a real building, infer real clearance, certify equipment or routes, trigger alarms, control doors, dispatch responders, or provide instructions for a live emergency. Real operational use is not demonstrated by this submission.

## Challenge and build notes

The first design exposed many useful controls but left a new user unsure where to begin or what a route change meant. We rebuilt the experience around one step-at-a-time rehearsal, made the building and floor plan directly inspectable, added fictional responder profiles and assistance ownership, and made route state visible in both the 3D twin and plan. We also made each tool contract readable before use and each runtime call inspectable afterward.

The product is static HTML, CSS, and JavaScript with a vendored Three.js runtime and a CSS fallback. The demo combines an AI-generated planning-room opening and narration with real app captures, a live page walkthrough, architecture, and inspectable tool receipts.

## Accomplishments

- Built a complete fictional rehearsal from plan read through staged review and human approval.
- Kept 19 page-tool contracts visible and aligned with the current source.
- Passed the current local test suite, including six people-data tests and 500 shuffled workflows covering repeat-safe actions, invalid transitions, route boundaries, and approval gates.
- Preserved one visible trail from human request to manager, specialist, tool result, page change, and open gap.
- Produced desktop and mobile evidence captures plus a public 2:13 demo with English captions.

## What we learned

WebMCP is most useful when an agent changes a visible, reviewable work surface and the person can inspect the consequence. We also learned that operational-looking data needs precise labels: a fictional count is not occupancy, a drawn path is not an approved evacuation route, and a prepared report is not a human decision.

## Future work

Next, add an agent-driven end-to-end evaluation set for the manager intent router and test the rehearsal with Fire Safety Managers. Any move beyond fictional training would be a separate, permissioned project requiring approved plan imports, authentication, access controls, professional review, and evidence from real users. It is not part of the current proof.

## Links and proof status

- **Live demo:** https://muster-fire-drill.vercel.app/

  No login required. The desktop and 390 by 844 mobile walkthroughs cover the 18-floor WebGL model, Floor 07 route inspection, visible tool receipts, and human-approved report.

- **Public source:** https://github.com/Arnie016/muster-webmcp

  Public repository with source, setup instructions, before/after WebMCP scope, and MIT license.

- **WebMCP registration source:** https://github.com/Arnie016/muster-webmcp/blob/2fa51ebba8b9b7bf813afddbc156433b0c9897ee/app.js#L1377-L1393
- **Tool-count test:** https://github.com/Arnie016/muster-webmcp/blob/2fa51ebba8b9b7bf813afddbc156433b0c9897ee/tests.mjs#L60-L66
- **Native WebMCP test harness:** https://github.com/Arnie016/muster-webmcp/blob/ece50066d5b15be37fc7598aaed5dff9e90ea58b/scripts/webmcp-native-smoke.cjs#L49-L127
- **Agent-readable project index:** https://muster-fire-drill.vercel.app/llms.txt
- **Full agent context and boundaries:** https://muster-fire-drill.vercel.app/llms-full.txt
- **Downloadable operator skill:** https://muster-fire-drill.vercel.app/SKILL.md

- **Public demo video:** https://youtu.be/BARCGYvzk78

  2:13, with narration and English subtitles.

- **Devpost project:** https://devpost.com/software/muster-the-agentic-fire-drill

  Existing submitted entry, updated in place.

- **Native WebMCP production evidence:** https://github.com/Arnie016/muster-webmcp/blob/main/docs/screenshots/muster-native-webmcp.png

  The production test launches Chrome 152 with WebMCP testing enabled, discovers 19 tools through `document.modelContext.getTools()`, and runs the declared fictional rehearsal through `document.modelContext.executeTool`. It verifies the manager route, named page calls, mission completion, staged report, visible receipts, and untouched human approval control. This proves the tested Chrome tab and deterministic fixture sequence, not autonomous planning, every browser, or every ChatGPT surface.

## 30-second judge path

1. Open the live demo and click **Start scenario** (or **Resume scenario** if you have already started).
2. In the Incident Commander dock, use the next guided action, or choose **Run demo** to open the guided sequence.
3. Watch the authored signal appear, Stair B become unavailable, and the missing assistance owner become explicit.
4. Open a **Live trace** row to inspect why the tool ran and what changed on the page.
5. Find the staged after-action draft and the separate human approval control. Treat every person and count shown as fictional training data.
