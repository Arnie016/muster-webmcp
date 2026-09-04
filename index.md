# Muster: The Agentic Fire Drill

Muster is a WebMCP tabletop fire-drill command room where a Fire Safety Manager and an agent rehearse a changing fictional building incident on the same visible plan.

[Run the live drill](https://muster-fire-drill.vercel.app/) · [View the source](https://github.com/Arnie016/muster-webmcp) · [Read the agent operator skill](https://muster-fire-drill.vercel.app/SKILL.md)

## The problem

Tabletop drills often split the plan, occupant register, team roles, scenario notes, decisions, and review across separate files and conversations. When a condition changes, it becomes difficult to see what changed, who owns the response, and which evidence belongs in the review.

## The shared workflow

1. Read the fictional building file and Floor 07 plan.
2. Start the controlled tabletop scenario.
3. Introduce one authored change, such as an unavailable stair.
4. Inspect the affected group, compare the exercise's route options, and record facilitator-confirmed actions and owners.
5. Check ownership coverage and prepare an after-action draft for human approval.

The app combines an orbitable 18-floor WebGL twin, a pan-and-zoom response plan, fictional occupants and responders, animated scenario signals, route receipts, an Incident Commander desk, and a visible tool trace.

## Why WebMCP matters

Muster exposes one manager and 18 bounded page tools through WebMCP. The agent operates the same page the facilitator sees. Each call leaves a receipt containing its input, result, purpose, visible consequence, timing, and guardrail. The agent may stage a report, but only the human can approve it.

In the tested production Chrome tab, the native WebMCP API discovered all 19 tools and executed the declared fictional rehearsal on the same page. It routed manager and specialist calls, advanced mission progress, staged the report, and stopped before the separate human approval control. A normal browser can run the same controlled workflow manually.

## Evidence boundary

All people, plans, dimensions, distances, incidents, equipment records, and counts are fictional training fixtures. Muster is not connected to sensors, alarms, doors, dispatch, responders, or emergency services. It does not model physical fire spread, certify equipment or routes, infer floor clearance, or provide instructions during a live emergency.

For deeper machine-readable context, read [llms-full.txt](https://muster-fire-drill.vercel.app/llms-full.txt).
