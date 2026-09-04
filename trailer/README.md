# Muster editable demo package

## Latest cut: 3D team handoff

The new `MusterTeamCut` composition is 125.1 seconds at 1920 × 1080 / 30 fps. It uses seven actual page recordings: room inspection, guided scenario, drawn route, human-confirmed assignment, typed question and tool receipt, review draft, and printable pack. The prior `MusterDemo` composition and hosted video remain unchanged as a fallback.

The new cut reuses the existing reviewed AI narration and illustration. It removes 115–122.4 seconds, which contained an obsolete tool count. No new paid voice or image generation was used. English captions are retimed to this cut in `captions/muster-team-demo.en.srt`; do not attach the older subtitle file to this version.

Using the already-installed dependencies:

```sh
MUSTER_URL=http://127.0.0.1:4180 NODE_PATH=/path/to/node_modules node scripts/capture-team-cut.cjs
npm run typecheck
npx --no-install remotion render src/index.tsx MusterTeamCut out/muster-team-demo.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p --concurrency=4
node scripts/package-team-cut.cjs
```

`CAPTURE_ONLY=team,trace` limits capture to the named clips. The recorder uses a clean local browser context, native WebMCP fixtures and real UI actions. It does not access authenticated user accounts. Keep exported media separate from claims about an autonomous model: this is a recorded product demonstration.

The packaged public player is `../demo.html`. It offers optional WebVTT captions, no autoplay, a download, and a direct return to the app. `../scripts/demo-video-smoke.cjs` verifies metadata, playback, seeking, captions and responsive layout.

## Earlier cut

The original composition below owns the 132.544-second film and its existing captions. Its nineteen-tool references describe an earlier build, not the current twenty-tool app.

## Refresh proof

The default command copies the current real captures from `../docs/screenshots/` into stable Remotion asset paths:

```bash
npm run proof:sync
```

To ingest refreshed stills without changing timeline code:

```bash
node scripts/sync-proof.mjs \
  --command-room /absolute/path/to/new-command-room.png \
  --route /absolute/path/to/new-floor-route.png \
  --person /absolute/path/to/new-person-profile.png \
  --contracts /absolute/path/to/new-tool-contracts.png \
  --report /absolute/path/to/new-after-action-report.png
```

Use captures at 1280×720 or larger. Keep the full command surface visible in `command-room`; keep the changed route, person boundary, tool contracts, and staged report legible in their named captures.

## Capture the real guided interaction

Start the app on `127.0.0.1:4173`, then record the deterministic guided flow:

```bash
MUSTER_PLAYWRIGHT_PATH=/absolute/path/to/playwright npm run capture:live
```

The recorder blocks external requests, refuses a non-local URL, exercises the real page controls, and writes `public/captures/guided-demo.webm`. It deliberately stops before the human-only approval button.

## Validate and render

```bash
npm install
npm run validate
npm run typecheck
npm run still
npm run render
```

Outputs:

- `out/muster-poster.png`
- `out/muster-demo.mp4`

## Narration

The narration is generated from `manifest.json` with GPT Realtime 2.1 and saved as `public/audio/narration.wav`. Only generate a new take when explicitly authorized:

```bash
OPENAI_API_KEY="$(apikey get OPENAI_API_KEY)" npm run voice
```

The video also works without narration because every claim and boundary is visible on screen.

The reviewed English subtitle track is `captions/muster-demo.en.srt`. Upload it as a separate caption file so subtitles can be toggled without covering the interface proof by default.

YouTube upload and Devpost publication remain separate, explicit release steps.

## Edit hierarchy

1. Edit claims, captions, narration, CTA, and asset roles in `manifest.json`.
2. Replace screenshots with `proof:sync`.
3. Change React components only when the layout or motion system itself must change.

The current cut opens with the operational reason for rehearsal, reaches real product proof at 11.5 seconds, and includes a 25-second browser-recorded interaction. The architecture and trace scenes explain the page contracts at a readable scale. A separate native Chrome capture shows `WebMCP live`, all 19 discovered tools, and `read_plan` executed against the same visible tab.
