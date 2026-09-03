# Devpost draft — Muster: The Agentic Fire Drill

## Project name

Muster — The Agentic Fire Drill

## Tagline

A WebMCP command room where fire-safety teams and an agent rehearse building incidents on the same live blueprint.

## Short pitch

Fire drills usually scatter the building plan, floor register, equipment list, team roles, scenario script, and final review across separate files. Muster turns those materials into one guided command room. The Fire Safety Manager leads. A WebMCP agent reads the visible plan, advances controlled scenario events, checks whether every problem has a recorded owner, and prepares a review. The agent cannot approve the report, claim a floor is clear, or contact emergency services.

## Inspiration

The hardest part of a fire drill is not drawing another checklist. It is keeping a team oriented when the plan changes: one exit becomes unavailable, two people need assistance, and a responsibility has no owner. We wanted an agent to help with that coordination while remaining visibly subordinate to the human facilitator.

## What it does

Muster gives the team one five-step drill:

1. The agent reads the selected fictional floor plan and aggregate exercise register.
2. The facilitator starts a scripted smoke scenario beside room 7-E.
3. A new condition changes the plan, such as Stair B becoming unavailable.
4. The facilitator records the route, accounting action, and assistance owner that the team actually chose.
5. The agent checks responsibility coverage and stages an after-action report for human approval.

The page includes an orbitable 18-floor building, a pan-and-zoom Floor 07 blueprint, directly inspectable rooms, a route-drawing tool, Plan, People, Equipment, and Roles desks, a conversational Incident Commander, and an explainable WebMCP call trace. The displayed 84-person count is clearly labeled as fictional exercise data, not a live sensor feed.

## How WebMCP is used

Muster registers one manager tool and eighteen bounded page tools through `document.modelContext.registerTool`. An agent can inspect the same plan the person sees, focus rooms, measure a facilitator-drawn path, compare scripted route availability, read the exercise register, inspect planned equipment, record facilitator-confirmed actions, find missing owners, and prepare a review. Tool results update the live interface, so the human can see and correct the agent's work.

Human approval is deliberately not a tool. The agent cannot approve the report, infer a person's competence or intent, claim real building clearance, trigger alarms, call responders, control doors, or provide live emergency directions.

## How we built it

- A deterministic JavaScript state machine models the fictional drill, injects, actions, review, and approval boundary.
- Nineteen WebMCP tool contracts expose only bounded page actions.
- A CSS 3D building and interactive SVG blueprint visualize floors, rooms, dimensions, two exits, planned safety equipment, route changes, and facilitator-drawn paths.
- A command desk routes plain-language requests to Plan, People, Equipment, or Review specialists.
- Local storage preserves the current fictional exercise without sending personal data to a server.
- The interface is responsive and deployed on Vercel.
- Automated tests run 500 shuffled workflows to check idempotency, invalid transitions, approval gates, and the no-external-effects boundary.

## Challenges

The central design challenge was making the agent useful without making it look like an emergency authority. We separated authored scenario changes from real sensor evidence, aggregate exercise counts from live occupancy, equipment symbols from serviceability, and a staged report from human approval. We also replaced a raw agent dashboard with a guided five-step workflow so first-time users always know what happens next.

## Accomplishments

- The person and agent operate the same visual plan.
- Every agent call is visible and inspectable in the page, including why it ran, what changed, and what remains outside its authority.
- The workflow fails closed on invalid state changes.
- The final approval remains human-only.
- Desktop and 390×844 mobile walkthroughs complete without overflow or console errors.
- Five hundred shuffled drill workflows preserve the safety and approval boundaries.

## What we learned

WebMCP is strongest when it turns a website into a shared work surface, not when it merely exposes search. The useful unit is a reviewable decision: read current context, change one controlled variable, record what the team did, reveal a gap, and let the human decide.

## What's next

The next safe step is an approved importer for real building plans and role templates, followed by authenticated multi-user facilitation and carefully permissioned integrations. Any real occupancy or building-system adapter would remain separate from the training demo and would require professional review, owner permission, privacy controls, and explicit operational boundaries.

## Links and proof gates

- Live site: https://muster-fire-drill.vercel.app
- Source repository: https://github.com/Arnie016/muster-webmcp
- Demo video: pending public YouTube upload under three minutes
- Native WebMCP proof: pending one recorded run in a WebMCP-enabled browser
