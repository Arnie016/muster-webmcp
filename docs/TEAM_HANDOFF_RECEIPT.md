# Named team handoff release

Checkpoint: 4 September 2026, 15:34 Singapore time.

## What changed

- Four named responder figures share one assignment record across the 3D room view, 2D plan, profile, roster and WebMCP readback.
- A person or agent can preview a responder, destination and task. Only the separate human confirmation control records it. Cyan paths follow authored room connections; confirmation brings the model into view and animates the assignment. Reduced-motion mode changes the position instantly.
- `prepare_team_handoff` is the twentieth page tool. There is no agent confirmation tool. Named chat requests prepare a preview instead of silently moving someone.
- Assignment history survives reload. Changed exercise conditions invalidate an old preview. Reset clears assignments.
- A staged report now overrides an unfinished optional tutorial sequence, including the chat's next-step answer. Native agents do not strand people on an obsolete guide step.
- The A3 preview fits its dialog on desktop and phone. Print media retains its full-size page geometry.

## Verified

- `npm test`: 20 unit cases, two suites and 500 shuffled core-state workflows passed.
- `test:team`: 1600 px, 390 px and no-WebGL flows passed: preview, confirmation, shared 2D/3D positions, persistence, stale proposal, reset, no horizontal overflow and no page errors.
- `test:chat`: 1440 px and 390 px passed distinct answers, actual call receipts, full history, reload, non-destructive guidance, next actions and preserved human approval.
- `test:spatial`: 1600 px, 390 px and no-WebGL passed dimensions, equipment, checkpoints, blocked exit, print/SVG/PNG export and print-footer checks. The preview also fits inside the iframe width.
- Native Chrome discovered 20 tools, executed the declared rehearsal, prepared a handoff, left confirmation to a human, and read back the new assignment. A second route deliberately skipped optional guide inspections and still led to human review without approval.
- Public team and native tests passed against the deployed app before the final print-fit and review-guide patch. The final patch passed locally; its production deployment is being verified separately.

## Boundaries

This is a fictional tabletop. Assignment is not arrival, room clearance, completed assistance, a real dispatch or validated evacuation advice. No alarms or building systems are connected. The built-in conversation uses a deterministic router, not a hosted LLM. Tests establish software behavior, not emergency effectiveness or adoption.

## Media and next gate

A separate 125.1-second Remotion cut is rendering from seven real browser captures and the existing reviewed narration. It removes the obsolete tool-count paragraph. The previous published video remains intact until a replacement is verified and uploaded.

The Mac was locked when authenticated browser control was attempted. YouTube upload and Devpost link replacement require the user to unlock that session. No fresh upload or Devpost edit is claimed here.

## Run accounting

Scope: one substantial shared-state interaction, regression tests, deployment, and an updated demonstration. Approximately 70 minutes elapsed from the 14:24 Singapore implementation checkpoint to this receipt, including recording and visual review; media rendering is still in progress. Exact token consumption and model cost are not surfaced. No new paid provider generation, software purchase or paid asset was used. External service billing was not newly enabled.

One next safe action: verify the rendered MP4, then replace the hosted video only through the unlocked authenticated browser.

## Release checkpoint: 15:49 Singapore time

- Final app fixes passed the deployed native Chrome test, including optional-step skipping, human review and the twentieth tool.
- Production deployment `dpl_4MpibyVTKP22JL4kwWhA8MAU26nr` is aliased to the public Muster URL. It includes `/demo.html` and the finished MP4.
- Public video tests passed at 1440 px and 390 px: 1920 × 1080 media, 125.162667-second duration, no autoplay, playback, seeking to 118 seconds, 33 caption cues, no horizontal overflow and no page errors. The local Python server did not pass the seek check; the production host did.
- The MP4 fully decoded without errors. Audio analysis found only a 1.03-second final silence above the one-second threshold. No new provider generation credits were used.
- Devpost project 1415442 remained published and submitted. Its write-up was updated through the official connector, version 11, adding the latest hosted demonstration. The existing YouTube URL is preserved pending the new upload.
- Authenticated YouTube Studio became accessible. Upload is in progress after explicit action-time confirmation of YouTube terms; no new publication is claimed at this checkpoint.
- Approximately 85 minutes elapsed since the 14:24 implementation checkpoint, versus a bounded shared-state enhancement plus release pass. Media capture, rendering and browser recovery expanded the pass. Exact turn token cost is unavailable; external billing was not enabled.

Next safe action: verify the new public YouTube video, update Devpost's video URL, and read back the published entry.
