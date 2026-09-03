# Architect handoff prompt

You can send the following to your architect. Do not send confidential plans until you have permission from the building owner and have agreed how they will be stored.

> I am prototyping a tabletop fire-safety training interface called Muster. It is not a live emergency system and will not claim regulatory approval. Could you create or review one fully fictional, non-identifying office-floor drawing suitable for a public software demo?
>
> Please supply a clean PDF and, if convenient, an SVG or flattened vector export. Use an invented building, address, room names, dimensions, and occupant figures. Do not reuse a client plan, title block, professional stamp, approval number, security-sensitive detail, or proprietary CAD standard.
>
> The drawing should feel professionally authored and include: floor outline and structural grid; room and compartment use; doors and door swings; corridors; two clearly separated exit stairs; fire and evacuation lift distinctions if applicable; PWD holding points; manual alarm call points; extinguishers; hose reels; rising mains; fire alarm panel; selected fire-resisting walls and doors; one unusual hazard room; alternative egress overlays; north arrow; key dimensions; scale; legend; drawing number; issue date; revision table; and a prominent “FICTIONAL TRAINING PLAN — NOT FOR CONSTRUCTION OR EMERGENCY USE” status.
>
> Please also annotate which information is architectural fact, which is a fictional exercise fixture, and which would require validation by a qualified fire-safety professional. If any requested symbol, dimension, or route would imply code compliance, replace it with a neutral placeholder and flag it for review.
>
> The software will use the plan only to demonstrate this workflow: read plan context → inject a scripted complication → highlight a zone → record participant decisions and owners → identify missing responsibility → prepare a human-reviewed after-action report. It must never tell people where to hide, predict a physical fire, call responders, or control building systems.

## Requested export package

- `fictional-level-07-plan.pdf`
- `fictional-level-07-plan.svg` or a high-resolution PNG
- `drawing-field-register.csv` listing zone IDs, room use, fixture occupant count, assistance fixture, exits, and plan distances
- `revision-notes.md` explaining assumptions and unresolved professional-review questions

## Redaction gate

Before importing anything, remove real addresses, tenant names, phone numbers, badge/access layouts, CCTV and security-system positions, professional seals, signatures, approval references, and metadata that identifies a client or site.
