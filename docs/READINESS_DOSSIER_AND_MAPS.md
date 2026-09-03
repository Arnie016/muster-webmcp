# Readiness dossier and location adapter

## Product decision

Muster should understand a building as a changing operational system, not just a drawing. The dossier therefore has five views:

1. **Site** — setting, building form, assembly-area fixtures, access notes, adjacent uses, known facts, unknown causes, and live-data boundaries.
2. **Rooms** — room use, fixture occupants, assisted occupants, plan distance, after-hours pattern, unusual fuel or process context, and protection fixtures.
3. **Equipment** — stable asset ID, type, room, plan visibility, fixture inspection date, and professional-review status.
4. **Roles** — named exercise responsibility, coverage gaps, shift/deputy questions, and facilitator-observed signals.
5. **History** — dated drill or tabletop finding, source type, lesson, change, owner, and later verification.

## Human information boundary

The product can record an observable exercise event such as “East Fire Warden disagreed with the route assumption” or “Chief Security answered after a delay.” It must not infer personality, emotional state, intention, reliability, competence, health, disability, or blame.

For a real deployment, use role IDs and shift coverage by default. Personal names, accessibility needs, contact details, attendance and training records require a documented purpose, restricted access, retention rules, correction workflow and building-owner approval. Public demos must use fictional identities and aggregate counts.

## Cause and incident-history boundary

Keep separate fields for:

- `observed_fact`
- `reported_fact`
- `exercise_inject`
- `assumption`
- `unknown`
- `professional_finding`

Proximity to an electrical room, previous incident, human delay or equipment location is not proof of cause. Historical incidents need a dated authoritative source. The public demo uses fictional exercise history and says so in every tool result.

## Location adapter decision

The current product uses a static fictional site sketch because no map credential is configured and the MVP does not need live geography.

For a permissioned Singapore pilot, prefer an adapter around [OneMap](https://www.onemap.gov.sg/apidocs/) for authoritative basemap, address, reverse-geocode and route context. A Google Maps Places adapter could provide general nearby-place discovery, but neither provider should be presented as an emergency-service availability or dispatch feed.

Safe tool boundary:

```text
read_site_context
  -> approved site-plan reference
  -> assembly-area and access fixtures
  -> map provenance and retrieval time
  -> explicit unknowns

find_reference_facilities
  -> general map search result
  -> distance and source
  -> no availability, response-time or dispatch claim
```

Do not expose phone escalation, alarm activation, dispatch, live route direction, or emergency-service control as WebMCP tools.

## Motion language

Motion communicates operational state:

- route dashes move only when a route is active;
- the hazard ring pulses only after its scripted inject;
- the selected dossier view enters as a single layer rather than stacking cards;
- status color and text remain available when motion is reduced;
- no ambient particle field, fake radar, map scanning or decorative alarm animation.

This follows the local motion reference principle: establish readable key states, test them in the actual interface, then add secondary motion only when it clarifies timing, ownership or consequence.
