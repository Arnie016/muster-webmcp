# Muster editable demo package

This folder owns the 135-second judge-facing product film. It does not modify the app source.

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
