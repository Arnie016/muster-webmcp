# Muster final upload package

## YouTube

**Title**

Muster: The Agentic Fire Drill | WebMCP Challenge Demo

**Description**

A blocked stair. Two people who need assistance. One missing owner.

Muster gives a Fire Safety Manager and an agent one shared command room to rehearse those decisions before conditions change. The facilitator selects a fictional floor, introduces a scripted complication, records what the team actually chose, and reviews a visible receipt for every tool call. The agent can prepare the after-action draft; only the human can approve it.

Try the live demo: https://muster-fire-drill.vercel.app/

Source and setup: https://github.com/Arnie016/muster-webmcp

Agent operator skill: https://muster-fire-drill.vercel.app/SKILL.md

Devpost: https://devpost.com/software/muster-the-agentic-fire-drill

Muster exposes one manager and 18 bounded page tools through WebMCP. In the tested Chrome 152 tab, `document.modelContext` discovered all 19 tools, executed `read_plan`, and updated the same visible trace. The product also works as a guided manual rehearsal when WebMCP is unavailable.

00:00 Why rehearsal matters
00:12 One shared command room
00:20 Live guided drill
00:47 Route evidence and ownership
01:10 Manager and specialists
01:24 Inspectable tool receipts
01:38 Human approval boundary
01:58 Native WebMCP proof
02:10 Final review

All people, plans, dimensions, incidents, equipment records, and counts shown are fictional training fixtures. Muster does not monitor a real building, certify routes or equipment, contact emergency services, or provide instructions for a live emergency.

Built for The WebMCP Challenge.

**Upload settings**

- Visibility: Public
- Audience: Not made for kids
- Category: Science & Technology
- Language: English
- AI use / altered or synthetic content: Yes. The opening planning-room visual is photorealistic and generated, and the narration is AI-generated. It does not imitate a named person.
- Thumbnail: `trailer/out/muster-youtube-thumbnail.jpg`
- Video: `trailer/out/muster-demo.mp4`

**Tags**

WebMCP, OpenAI, agentic AI, fire drill, emergency preparedness, human AI collaboration, incident command, safety training, explainable AI, tabletop exercise

**Verified master**

- Duration: 135.061 seconds
- Picture: H.264, 1920 by 1080, 30 fps
- Audio: AAC, 48 kHz stereo; measured integrated loudness -16.1 LUFS and true peak -4.5 dBTP
- SHA-256: `7567c47f5d157dafd23e8275378908b3df10f920273d0f2440bd2684d6d849c3`
- Local speech-to-text check begins with the emergency problem, contains the complete product story and safety boundary, and contains no generator preamble or sign-off.

## Devpost update

Use the complete humanized project narrative in `docs/DEVPOST_SUBMISSION.md`.

Before saving, replace the old YouTube URL with the new public video URL. Keep these links unchanged:

- Live demo: https://muster-fire-drill.vercel.app/
- Public repository: https://github.com/Arnie016/muster-webmcp
- MIT license: https://github.com/Arnie016/muster-webmcp/blob/main/LICENSE
- Native WebMCP evidence: https://github.com/Arnie016/muster-webmcp/blob/main/docs/screenshots/muster-native-webmcp.png

The strongest judge path is:

1. Click **Inspect Floor 07**.
2. Click **Run demo** in the Incident Commander dock.
3. Watch Stair B become unavailable, inspect the route receipt, and see the missing assistance owner become explicit.
4. Open one Live trace row to inspect the request, delegation, input, result, visible change, duration, and guardrail.
5. Review the staged after-action draft and the separate human approval control.

Do not claim real-building deployment, live occupancy, emergency-service integration, certification, or field adoption.
