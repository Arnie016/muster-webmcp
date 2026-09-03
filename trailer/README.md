# Muster editable demo package

This folder owns the 75-second judge-facing video. It does not modify the app source.

## Refresh proof

The default command copies the current real captures from `../docs/screenshots/` into stable Remotion asset paths:

```bash
npm run proof:sync
```

To ingest refreshed captures without changing timeline code:

```bash
node scripts/sync-proof.mjs \
  --command-room /absolute/path/to/new-command-room.png \
  --review /absolute/path/to/new-review.png
```

Use captures at 1280×720 or larger. Keep the full command surface visible in `command-room`; keep the changed route and staged review visible in `review`.

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

The approved narration was generated from `manifest.json` with GPT Realtime 2.1 and saved as `public/audio/narration.wav`. The original take included an unwanted spoken preamble. Rebuild the corrected, scene-aligned track from the retained raw take with:

```bash
npm run voice:repair
```

Only generate a completely new take when explicitly authorized:

```bash
OPENAI_API_KEY="$(apikey get OPENAI_API_KEY)" npm run voice
```

The video also works without narration because every claim and boundary is visible on screen.

YouTube upload and Devpost publication remain separate, explicit release steps.

## Edit hierarchy

1. Edit claims, captions, narration, CTA, and asset roles in `manifest.json`.
2. Replace screenshots with `proof:sync`.
3. Change React components only when the layout or motion system itself must change.

The current cut opens with two generated documentary-style context images, then moves to real app captures. Runtime and trace motion graphics reconstruct the actual source-defined tool calls at a readable scale; they are not a native-browser WebMCP capture. The architecture scene connects a human request to concrete tool results, one visible state, and the human approval boundary.
