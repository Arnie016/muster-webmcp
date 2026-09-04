# Muster replacement release

Verified 4 September 2026, 05:20 UTC / 13:20 Singapore time.

## Published result

- Replacement demo: https://youtu.be/BARCGYvzk78
- Existing Devpost entry: https://devpost.com/software/muster-the-agentic-fire-drill
- Live application: https://muster-fire-drill.vercel.app/
- Source: https://github.com/Arnie016/muster-webmcp

YouTube Studio confirmed **Video published** on AIGonezWild / @GamezGoneWild. The public watch page independently showed the new title, channel, 2:12 player duration, description, and AI-use disclosure. The local master is 132.544 seconds, 1920x1080 H.264/AAC, SHA-256 `6ef6dc30cd172983789f613b06d348fd538fcc5099d5c415b48ab4a2a1b924e7`.

The timed English (United Kingdom) caption track was uploaded, its text and timings checked, and **Publish** pressed in Studio. Studio completed the operation and closed the editor. Public-player CC availability had not propagated at the immediate follow-up check; it is not yet independently verified.

Devpost update and resubmission succeeded for project 1415442 / submission 1169160. A final official-connector readback verified `published`, the replacement video URL, and the WebMCP entry's non-null submitted timestamp. The original submitted timestamp is retained; no duplicate project was created. The writeup and testing instructions distinguish deterministic native tool execution from autonomous LLM planning.

## Application update

- A prominent **Start scenario / Resume scenario / Review scenario** action opens the loaded Floor 07 scenario. Start reads the plan first; returning to the scenario preserves progress and does not replay completed actions.
- Selecting Floor 08 or another model-only floor explains that no schematic exists there. It no longer leaves the visitor at a disabled dead-end or shows a stale floor plan.
- Only Floor 07 has the executable drill. Floors 03 and 12 are clearly labelled reference plans; other floors are 3D context, not invented schematics.
- The first view has a shorter command-room introduction, fewer idle controls, and a direct link to the new demo. The blueprint visual system is retained.

Product commit: `5463caaaa1732ab7dc1785035b5edabad7191f88`.

Vercel deployment: `dpl_9bVnjtqHFAYTyRHJP5Mb2f7TVKww`, READY, canonical alias verified. Source pushed to `main`.

## Verification

- `npm test`: passed deterministic-state checks, six people-data tests, and 500 shuffled core-state workflows.
- Local and production browser smoke: passed. Includes unsupported-floor recovery, Start/Resume without duplicated actions, floor selection, path measurement, person detail, trace, report approval, CSS fallback, and 390x844 mobile layout without overflow or console errors.
- Production native WebMCP smoke: passed in Chrome 152 with testing enabled. Discovered 19 tools, called `read_plan`, routed manager orientation, and ran the declared rehearsal to a staged report while leaving human approval untouched.
- Current production screenshots are saved in `docs/screenshots/`.

The launch-evidence skill kept activation and production checks ahead of the final release claim. A passing native fixture is not autonomous-agent planning, compatibility with every ChatGPT/browser surface, real occupancy sensing, certified evacuation routing, or field validation.

## Run accounting

- Requested timebox: about 50 minutes; release and final readback completed by 13:20 Singapore time, before the verified 16:00 deadline.
- Exact total elapsed time and per-pass model token cost are not surfaced across this resumed run; no invented estimate is reported as actual usage.
- External purchases or new paid credits in this release pass: $0. Existing provider/account costs are not independently surfaced.
- Impact: **IMPROVED**. Fresh public video and submitted link are verified; the unsupported-floor activation failure is repaired and tested.
- Remaining proof gate: public caption propagation and practitioner/user judgment of the training experience. Neither blocks the already-submitted entry.
- Next safe action: watch the new video and perform one Start/Resume walkthrough on the deployed app before making further changes.
