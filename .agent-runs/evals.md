# Muster release evaluation

Timestamp: 2026-09-04T06:00:17Z

| Case | Expected result | Observed result |
| --- | --- | --- |
| Start/Resume from model-only Floor 08 | Recover F07, preserve progress, no duplicate actions | Public browser test passed |
| Typo: swaht is the floor | Correct floor-specific answer, not generic 84-person fallback | Desktop/mobile chat test passed |
| Where is the extinguisher? | EX-07-W1, exact fixture location and tool receipt | Desktop/mobile chat test passed |
| Unrelated question | Clarify; no tool called | Unit and chat tests passed |
| Full conversation and reload | Prior turns remain available; reader scroll is not forced | Desktop/mobile chat test passed |
| Guided scenario to review | Three recorded actions; approval remains false until human action | Chat and native tests passed; separate human approval browser control tested |
| Native room and equipment view | Studio geometry, call-point focus through actual registered calls | Public native WebMCP test passed |
| Blocked B walkthrough | Stop at checkpoint 3; no decision/evacuation record inferred | Spatial, unit and public native tests passed |
| No-WebGL fallback | Room context, checkpoint controls and print remain usable | Spatial fallback test passed |
| High-resolution export | Two A3 pages, SVG, 5500 × 4250 PNG; footer not clipped | Spatial tests and file inspection passed |

Regression found and fixed: an existing room-focused 142% zoom plus retained scroll put route-drawing endpoints off-screen. Draw a route now resets to 100%, clears gesture state and centers the canvas. The full 1920 × 1080 browser test includes actual pointer drawing and endpoint visibility assertions; public 390 × 844 layout also passes.

Tests establish the fictional page workflow, not fire physics, real evacuation safety, actual clearance, human competence, or field outcomes. Specialist labels are deterministic routing, not separate hosted models. View changes never raise alarms or dispatch anyone.

Public app-code checkpoint: dpl_D4QmN2HVERfhmVSRPn7ecUrDEffa. A documentation-only packaging follow-up exposes the operator guide; the social-preview image uses the verified public repository because the deploy excludes screenshot artifacts.
