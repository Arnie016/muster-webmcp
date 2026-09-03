# Muster Film V2 Treatment

## Production lock

- **Runtime:** 02:12.544, within the required 02:05–02:20 window. The final pacing pass removed a rejected 2.5-second silent hold without dropping product proof or safety context.
- **Master:** 1920×1080, 16:9, 30 fps, stereo, with a clean-captioned version and a textless product-capture master.
- **Audience:** WebMCP judges first; fire-drill facilitators second.
- **Promise:** A person and a browser agent can rehearse a changing fictional floor scenario on the same visible plan while the human retains final authority.
- **Tone:** Calm operational confidence. Tension comes from a changing condition and an unowned responsibility, not from disaster imagery.
- **Speaker:** One human presenter. They appear for the opening, then lead the film in voice-over. The script starts on the idea, not with a greeting, biography, or demo preamble.
- **Proof rule:** A cursor appears only when its click, drag, or tool call visibly changes the page. Native WebMCP activity must be captured from a compatible browser, not recreated in motion graphics.
- **Safety rail:** Keep the app's **Training only** and **No sensors or emergency connection** language readable whenever the scenario is live.

## Direction and emotional arc

The concrete analogy is a flight simulator for coordination: a team should encounter a route failure and a responsibility gap while the consequences are still fictional and reviewable. The film moves through five emotions:

1. **Concern:** the plan can change and responsibility can be unclear.
2. **Orientation:** the whole fictional building context is visible.
3. **Agency:** a person and an agent inspect, change, draw, and record on one surface.
4. **Trust:** every tool call explains its purpose, page effect, and boundary.
5. **Accountability:** the agent stages evidence; a human decides whether to approve it.

### Template decision

| Candidate | Strength | Risk | Decision |
| --- | --- | --- | --- |
| `real-product-proof` | Gets to the actual app by 00:09 and lets causality carry the story. | Less spectacle than a cinematic incident opening. | **Selected.** Best fit for technical judges and literal proof. |
| `control-room-incident` | Strong dramatic stakes and clear operational language. | Can imply real emergency authority or turn into generic fire footage. | Keep only its disciplined sound and pacing. |
| `architecture-led-explainer` | Makes the manager, tools, state, and trace easy to understand. | Delays the human problem and can feel like a diagram deck. | Use only for the 01:26.5 architecture beat. |

The selected spine is: human problem → real interface → native tool discovery → changed condition → route and people decisions → trace → staged report → human approval → proof boundary.

## Pre-capture implementation gates

Do not record the final product takes until these items are complete. They are app/capture requirements; this treatment does not authorize changes to existing trailer code.

1. **Lock and verify the step-through rehearsal.** The 11-step guided panel must bind `guidedStepIndex`, `guidedStepTotal`, `guidedTitle`, `guidedDescription`, `guidedChange`, and `guidedNextButton` to a deterministic sequence in which one operator action advances one visible result. The tool-dialog launch may reset and enter that sequence, but it must not auto-complete the exercise. Browser verification must prove that each step waits.
2. **Lock and verify the fictional people surface.** The People view, plan markers, person cards, assistance pairing, and named action owners must all read from the same deterministic fictional fixture. Every record must remain visibly fictional, contain no real personal data, validate floor/room/task combinations, and fail closed on unknown IDs. The capture must have no missing module or resource request.
3. **Finish and verify persistent trace evidence.** Each Live trace row must retain and visibly render the tool name, compact input, compact returned result, reason, visible change, and boundary. A latest-result modal by itself is not enough because it loses call-by-call causality. Human approval must remain a visibly different `human` event rather than looking like a WebMCP tool.
4. **Pin the route-analysis receipt.** When a facilitator releases a drawn route, keep a readable receipt on the floor view with the returned measured length, nearest exit, endpoint reach, scripted availability, and qualified-human boundary. Use the actual returned value from that take; do not animate a preselected distance.
5. **Prove native WebMCP in the capture browser.** Record one continuous take in which the page changes from **Manual mode** to **WebMCP live**, the browser discovers all 19 contracts, and an actual native invocation updates the same open page. Source registration code, a manual replay, and a reconstructed call bubble are not substitutes. **Satisfied in the current checkout:** Chrome 152 discovered all 19 tools and executed `read_plan`; `docs/screenshots/muster-native-webmcp.png` records the changed visible trace.
6. **Extend the browser smoke gate around the finished flow.** Verify that every guided step waits, the people surface has no missing request, route drawing creates the persistent receipt, trace rows retain call-specific evidence, report approval is unavailable as a tool, approval is blocked with open gaps, and the final human click creates the distinct approval event.

At capture lock, the deterministic state and stress suite must freshly pass for 19 unique contracts, 500 shuffled workflows, invalid-transition handling, route boundaries, and the human approval gate. Any dedicated fictional-people tests must pass in the same frozen checkout. Those results support the proof scene but remain separate from the native-browser test and real-world evidence boundaries.

## Exact interstitial cards

Use exactly five interstitial cards, plus the separate end card. Each card is full-frame charcoal, set in the app's warm white and safety orange, with no logo animation or secondary copy.

1. **00:07–00:09:** `REHEARSE THE CHANGE.`
2. **00:34–00:35.5:** `ONE SHARED STATE.`
3. **00:58.5–01:00:** `DRAW. CHECK. DECIDE.`
4. **01:25–01:26.5:** `EVERY CALL LEAVES A TRACE.`
5. **01:50–01:51.5:** `THE AGENT PREPARES. THE HUMAN DECIDES.`

No card remains long enough to become a slide. Each inherits an audio tail from the preceding product action and exits into the next real interaction.

## Timecoded film blueprint

### 00:00–00:07 | Human hook

**Picture:** Medium shot of the presenter beside one monitor showing Muster's untouched 3D building state. Keep the screen legible enough to recognize the product, but let the speaker own the frame. No flames, smoke footage, responders, or generated incident imagery.

**Narration:** “A fire drill should work like a flight simulator for coordination: expose failure while every decision can still be examined.”

**Sound and transition:** One low pulse begins under the first word. The orange line on Floor 07 match-cuts to the first card.

### 00:07–00:09 | Interstitial 1

**Card:** `REHEARSE THE CHANGE.`

**Narration:** “Muster moves that discovery into a fictional rehearsal.”

### 00:09–00:21 | Enter the real plan

**Picture:** Full-screen clean capture of the actual initial app state at 100% browser zoom. Drag the 3D building once to orbit, click a non-loaded floor long enough to reveal **Floor file unavailable**, return to Floor 07, then click **Inspect Floor 07 →**. The floor plan replaces the building in the same surface.

**Visible proof:** 18 floors; Floor 07 selected; exercise register 84; 2 need assistance; revision 04; **Training only**.

**Narration:** “This is Floor Seven inside an eighteen-storey training fixture. Orbit the building, select the loaded floor, and open the plan everyone can see.”

**Transition:** Push into the top-right **19 tools** control as the floor settles.

### 00:21–00:34 | Native tools become visible

**Picture:** Click **19 tools** and hold the real tool list for two seconds. Close it. Show the compatible browser's actual agent surface beside the app and invoke:

```json
{"intent":"orient"}
```

through `run_drill_manager`. Hold on the real `WebMCP live` state and the resulting `read_plan` and `read_floor_register` entries in Live trace. Return the app to at least 70% of frame width after the invocation is established.

**Narration:** “In a compatible browser, nineteen page-tool contracts register in this tab. The Incident Commander routes one request to bounded plan, people, equipment, and review specialists.”

**Proof boundary:** The tool drawer proves visible contracts. The browser discovery surface plus `WebMCP live` receipt proves discovery in that recorded tab only.

### 00:34–00:35.5 | Interstitial 2

**Card:** `ONE SHARED STATE.`

**Narration:** “They all work against one visible exercise state.”

### 00:35.5–00:48.5 | Read, then begin

**Picture and interaction:** Return full-screen to the app. Select the `read_plan` trace row so its input, result, reason, visible change, and boundary are readable. The facilitator then clicks **2 · Start smoke scenario**. Hold the resulting orange signal beside room 7-E, the `start_drill` trace row, and the phase change to the running exercise.

**Narration:** “The agent reads eighty-four fictional occupants, two assistance needs, two exits, and the plan revision. The facilitator starts the scenario; a scripted signal appears beside room seven-E.”

**On-screen micro-label:** `FICTIONAL FIXTURE COUNTS`

### 00:48.5–00:58.5 | The plan changes

**Picture and interaction:** The facilitator clicks **Next · Stair B unavailable**. The actual route and Stair B change to their unavailable state. The browser agent invokes `inspect_zone` with `{"zone_id":"studio"}`, then `compare_routes` with the same zone. Click the Studio zone and hold the real callout.

**Narration:** “Then the condition changes. Stair B becomes unavailable. The Studio holds six fixture occupants, including two who need an assigned assistance owner.”

**Visible result:** Studio · 6 people · 2 assisted; Stair B 18 m and unavailable; Stair A 30.1 m and available. These are fictional plan fixtures, not measured real-building guidance.

### 00:58.5–01:00 | Interstitial 3

**Card:** `DRAW. CHECK. DECIDE.`

**Narration:** “Now the map has to support a decision.”

### 01:00–01:15 | Human route, tool analysis

**Picture and interaction:** Click **Draw a route**. With one unbroken pointer drag, draw from the Studio toward Stair A and release. Keep the cursor still while the real `analyze_route_sketch` receipt appears. Select that trace row and show its actual measured length, endpoint, scripted availability, and decision boundary. Do not replace the returned number in post.

**Narration:** “The facilitator draws a path toward Stair A. Muster measures the sketch, checks its endpoint against scripted availability, and returns the result without calling it a real evacuation route.”

**Transition:** The drawn line straightens into the divider of the People/roles view.

### 01:15–01:25 | A person owns the gap

**Picture and interaction:** Advance the scripted assistance-owner inject. Open **People** or the roles matrix. Show the unassigned assistance role and run `check_coverage`; hold on the unresolved gap. After the speaker states that the team has confirmed its response, the facilitator records the predefined actions and owners with real page clicks: floor accounting, reroute, and mobility assistance. Never make the clicks look automatic.

**Narration:** “A route is not enough. The people view exposes the missing owner. Only after the team confirms what happened does the facilitator record the action and responsibility.”

**On-screen micro-label:** `RECORDED BY FACILITATOR`

### 01:25–01:26.5 | Interstitial 4

**Card:** `EVERY CALL LEAVES A TRACE.`

**Narration:** “Every call leaves a trace.”

### 01:26.5–01:41 | Architecture becomes evidence

**Picture:** Keep the real app and selected trace row visible beneath a restrained five-node overlay. Build the diagram from left to right as the corresponding real events are selected:

```text
Human request
    → run_drill_manager
        → Plan / People / Equipment / Review specialist
            → named page tool
                → deterministic in-page drill state
                    → same visible UI + Live trace

Human-only branch: review evidence → Approve report page control
```

Highlight `read_plan`, `send_inject`, `compare_routes`, `record_action`, `check_coverage`, and `stage_report` in sequence. Under the tool node, show `document.modelContext.registerTool` once as the registration mechanism. Under the state node, show `ready → running → review → complete`. End by expanding one real trace event into **input**, **result**, **why**, **visible change**, and **boundary**.

**Narration:** “Here is the architecture: a human request enters the manager, named tools read or update deterministic drill state, the same screen changes, and the trace records why, what changed, and the guardrail.”

**Proof boundary:** The Incident Commander is a deterministic router over declared page tools. Do not depict it as an autonomous emergency commander, hidden reasoning engine, or building controller.

### 01:41–01:50 | Stage, do not approve

**Picture and interaction:** Invoke `check_coverage` again. Hold on **Every active inject has an owner** and zero open gaps. Through the browser agent, invoke `stage_report`. The real report appears with **Ready for human review**. Do not touch the approval control yet.

**Narration:** “Coverage checks preserve open gaps instead of hiding them. When every active problem has an owner, the agent stages an after-action draft.”

### 01:50–01:51.5 | Interstitial 5

**Card:** `THE AGENT PREPARES. THE HUMAN DECIDES.`

**Narration:** “The agent prepares. The human decides.”

### 01:51.5–02:04 | Human authority

**Picture and interaction:** Return to the staged report. Briefly reopen the tool list or the browser discovery list and search/scan for approval to establish that no approval tool exists. Cut back to the report. The facilitator reviews the three recorded actions and zero open gaps, then physically clicks **Approve report**. Hold on **Human approved**, the approval seal, and the distinct human event in Live trace.

**Narration:** “There is no approval tool. A Fire Safety Manager reviews the visible evidence, then clicks Approve report as a human page action. The trace records that boundary too.”

**Transition:** Match the circular report dial to a terminal test status dot.

### 02:04–02:08 | Internal verifier

**Picture:** Real terminal capture from this checkout running `npm test`. Crop to the passing lines for 19 unique contracts, 500 shuffled workflows, invalid transitions, route boundaries, no external effects, and the approval gate. Do not show a prerecorded terminal animation.

**Narration:** “Internally, five hundred shuffled workflows test state transitions, idempotency, and the approval gate.”

**Proof boundary:** This is deterministic source/test proof. It is not user adoption, regulatory review, a live-building trial, or native WebMCP proof by itself.

### 02:08–02:15 | End card

**Picture:** Quiet charcoal end frame. Muster mark at top, exact proof copy below, no launch superlatives, no partner logos, and no unverified deployment claim.

**Exact end-card copy:**

```text
MUSTER · TRAINING ONLY

SHOWN IN THIS FILM
One compatible-browser WebMCP run · fictional floor interactions
19 page-tool contracts · 500 shuffled state workflows · human-only approval

NOT SHOWN OR CLAIMED
Live occupancy or sensors · alarm, dispatch, or door control
Regulatory compliance · real-world readiness or adoption

NOT FOR LIVE EMERGENCIES
```

**Narration:** “Muster proves a fictional rehearsal workflow, not live readiness. No sensors, alarms, dispatch, door control, compliance, or emergency guidance is claimed.”

If native discovery is not successfully captured, the film must not use the primary end card. Replace its first proof line with: `Manual page workflow · source-defined WebMCP contracts · native discovery still pending`, remove the 00:21 browser-agent claim, and retain **Manual mode** on screen.

## Capture manifest and continuity

Record the app scenes as one stateful exercise whenever possible so the trace, route, actions, and report belong to the same run.

| Plate | State and action | Required readable proof |
| --- | --- | --- |
| `A01-speaker-hook` | Presenter with untouched building state | Real app in background; no incident B-roll |
| `A02-building-floor` | Reset → orbit → unavailable floor → Floor 07 → inspect | 18 floors, Floor 07, revision 04, training boundary |
| `A03-native-orient` | Native discovery → `run_drill_manager({"intent":"orient"})` | `WebMCP live`, 19 tools, `read_plan`, `read_floor_register` |
| `A04-smoke-start` | Human starts the scenario | Scripted 7-E signal and `start_drill` trace |
| `A05-route-change` | Human advances Stair B inject; agent inspects Studio and compares routes | Unavailable Stair B, Studio count, actual alternatives |
| `A06-route-sketch` | Human draws and releases one path | Persistent returned route receipt and trace boundary |
| `A07-people-gap` | Assistance inject → People view → coverage check → human records actions | Unassigned-to-assigned change and named owners |
| `A08-trace` | Select representative calls from the same run | Input, result, why, visible change, guardrail |
| `A09-review-approval` | Agent checks and stages; human reviews and approves | Zero open gaps, ready for human review, human approval event |
| `A10-tests` | Fresh `npm test` run | Current passing output, not a designed terminal mock |

Before each app take, clear only Muster's local exercise state, reload, confirm the correct branch and URL, close unrelated tabs, disable notifications, and verify browser zoom at 100%. Do not clear or change the browser profile if doing so would remove the compatible WebMCP capability. Capture the browser-agent panel and page in the same frame for native calls, then return the product to full-screen for visual decisions.

## Narration, captions, and mix

- Read at roughly 142–148 words per minute with natural sentence rhythm. Do not insert spoken production notes, countdowns, labels such as “pause,” or synthetic silence cues.
- Keep captions to two lines and no more than roughly eight words per line. Re-time line breaks to the speaker; do not cover the floor callout, route receipt, Live trace, or report controls.
- Use the app's warm white, orange, and mint for captions and diagrams. Avoid red emergency graphics beyond the app's own scripted unavailable-route state.
- Build sound from a restrained low pulse, soft interface clicks, one pencil-like route-draw texture, and a muted confirmation tone on the human approval. Do not use sirens, radio chatter, crowd noise, or alarm sounds.
- Keep voice centered and dry. Duck music under every factual figure and all proof-boundary sentences. The approval click gets one tactile sound; it must not sound triumphant or imply certification.

## Claim and figure ledger

Only the following figures may appear without a new verification pass immediately before edit lock:

| Figure | Meaning in the film | Internal basis | Required qualifier |
| --- | --- | --- | --- |
| 18 | Floors in the fictional building model | `index.html`, current UI, browser-smoke contract | Fictional training model |
| 07 | Loaded exercise floor | `index.html`, `drill-core.js`, current UI | Fictional exercise floor |
| 84 | Aggregate Floor 07 fixture register | `drill-core.js`, `read_plan`, `read_floor_register` | Not live occupancy |
| 2 | Fixture occupants marked for assistance | `drill-core.js`, current UI | No personal data; not live |
| 6 | Studio fixture occupants | `drill-core.js` and `inspect_zone` | Fictional zone count |
| 18 m / 30.1 m | Authored Studio-to-Stair B/A plan distances | `compare_routes` | Fictional plan distances; not evacuation guidance |
| 19 | One manager plus 18 bounded page-tool contracts | `app.js`, `tests.mjs`, passing `npm test` | Contract count, not external integrations |
| 500 | Shuffled deterministic stress workflows | `stress-tests.mjs`, passing `npm test` | Test iterations, not drills or users |

The drawn-route distance is take-specific and must be read from the actual `analyze_route_sketch` result. Do not pre-write it into narration or graphics.

No official external figure is required for this film. Any future SCDF statistic, legal requirement, response-time figure, compliance statement, or quotation must be marked **OFFICIAL SOURCE PENDING** in the edit until rechecked against the current primary source and reviewed by a qualified person. Product fixture counts must never be presented as SCDF figures.

## Final edit gates

- The first real product pixels appear by 00:09.
- Product UI owns at least 70% of the frame during every proof beat.
- All five interstitial cards are present; there are no additional slogan cards.
- Every cursor action has a visible response and a matching trace or report consequence.
- Native tool discovery is either genuinely captured or explicitly marked pending in both the 00:21 scene and end card.
- The route result shown is the result returned in that take.
- The approval action is visibly human and absent from the tool list.
- The terminal proof is freshly captured from the exact checkout.
- The film never implies live occupancy, sensors, emergency control, regulatory compliance, public adoption, or operational readiness.
- Final runtime is 02:15, including the full seven-second end card.
