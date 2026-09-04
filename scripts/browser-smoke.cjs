const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const shots = path.join(root, 'docs', 'screenshots');
const url = process.env.MUSTER_URL || 'http://127.0.0.1:4179';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  assert.match(await page.locator('#phaseGuide').innerText(), /Mission stage 1 of 5/i);
  assert.match(await page.locator('#guidedBrief').innerText(), /Next page-tool action/i);
  assert.ok(await page.locator('#launchScenarioButton').isVisible());
  assert.ok(await page.locator('.scenario-rail').isHidden());
  assert.ok(await page.locator('#guidedDescription').isHidden());
  assert.match(await page.locator('#specialistRail').innerText(), /Agent route.*one specialist lights up per call/is);

  assert.equal(await page.locator('[data-building-floor]').count(), 18);
  assert.ok(await page.locator('#buildingView').isVisible());
  assert.ok(await page.locator('#buildingViewport.webgl-ready').isVisible());
  assert.ok(await page.locator('#buildingCanvas').isVisible());
  assert.equal(await page.locator('#buildingCanvas').getAttribute('data-selected-floor'), '7');
  assert.ok(await page.locator('.site-plane').isVisible());
  assert.ok(await page.locator('.tower-podium').isVisible());
  assert.ok(await page.locator('.roof-plant').isVisible());
  assert.match(await page.locator('.site-plane').innerText(), /Assembly A/i);
  await page.locator('.site-point-controls [data-site-point="assembly-a"]').click();
  assert.match(await page.locator('#buildingStatus').innerText(), /Assembly A · West court/i);
  assert.ok(await page.locator('.site-point-controls [data-site-point="assembly-a"]').evaluate((element) => element.classList.contains('selected')));
  await page.screenshot({ path: path.join(shots, 'muster-site-context.png'), fullPage: false });
  await page.locator('[data-plan-floor="7"]').click();
  const canvas = page.locator('#buildingCanvas');
  const canvasBox = await canvas.boundingBox();
  assert.ok(canvasBox);
  await canvas.click({ position: { x: canvasBox.width * .55, y: canvasBox.height * .25 } });
  assert.match(await canvas.getAttribute('data-last-hit'), /^floor-\d+$/);
  assert.notEqual(await canvas.getAttribute('data-selected-floor'), '7');
  await page.locator('[data-plan-floor="7"]').click();
  await page.screenshot({ path: path.join(shots, 'muster-spatial-command.png'), fullPage: false });

  const viewport = page.locator('#buildingViewport');
  const box = await viewport.boundingBox();
  assert.ok(box);
  await page.mouse.move(box.x + box.width * .45, box.y + box.height * .42);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .62, box.y + box.height * .34, { steps: 8 });
  await page.mouse.up();
  await page.locator('#enterFloorButton').click();
  await page.waitForFunction(() => document.querySelector('#floorView') && !document.querySelector('#floorView').classList.contains('view-hidden'));
  assert.match(await page.locator('#floorZoomLabel').innerText(), /100%/);
  assert.match(await page.locator('#scenarioSequence').innerText(), /Plan read/);
  await page.waitForFunction(() => document.querySelector('[data-sequence-stage="plan"]')?.classList.contains('done'));
  assert.ok(await page.locator('[data-sequence-stage="signal"].current').isVisible());
  assert.ok(await page.locator('.drawing-title-block').isVisible());
  assert.ok(await page.locator('.map-key').isVisible());

  await page.locator('#toolButton').click();
  await page.locator('[data-tool-card="inspect_zone"]').click();
  assert.match(await page.locator('#toolResult').innerText(), /example_input/);
  await page.screenshot({ path: path.join(shots, 'muster-tool-contracts.png'), fullPage: false });
  await page.locator('#closeTools').click();
  await page.locator('#resetButton').click();
  await page.locator('#toolButton').click();
  await page.locator('#rehearsalButton').click();
  assert.match(await page.locator('#guidedTitle').innerText(), /Read the visible plan/i);
  assert.ok(await page.locator('#reportPanel').isHidden());

  await page.locator('#guidedNextButton').click();
  await page.waitForFunction(() => /Start one authored signal/i.test(document.querySelector('#guidedTitle')?.textContent || ''));
  assert.equal(await page.locator('#guidedStepIndex').innerText(), '02');
  assert.match(await page.locator('#phaseGuide').innerText(), /Mission stage 2 of 5/i);
  assert.ok(await page.locator('[data-sequence-stage="plan"]').evaluate((element) => element.classList.contains('done')));
  assert.ok(await page.locator('[data-sequence-stage="signal"]').evaluate((element) => element.classList.contains('current')));

  const expectedSteps = [
    /Inspect the affected group/i,
    /Change one condition/i,
    /Compare both exits/i,
    /Record the team decision/i,
    /Reveal the people gap/i,
    /Assign assistance/i,
    /Reconcile the register/i,
    /Check every responsibility/i,
    /Prepare the review draft/i,
    /ready for a human/i,
  ];
  for (const [index, expected] of expectedSteps.entries()) {
    await page.locator('#guidedNextButton').click();
    await page.waitForFunction((pattern) => new RegExp(pattern, 'i').test(document.querySelector('#guidedTitle')?.textContent || ''), expected.source);
    if (index === 0) {
      assert.ok(await page.locator('#buildingView').isVisible());
      assert.equal(await page.locator('#buildingCanvas').getAttribute('data-signal'), 'active');
      assert.equal(await page.locator('#buildingCanvas').getAttribute('data-route-state'), 'candidate');
      assert.ok(await page.locator('#buildingSignalMarker').isVisible());
      assert.ok(await page.locator('#buildingRouteState').isVisible());
      assert.match(await page.locator('#buildingRouteState').innerText(), /Stair A available.*Stair B candidate/is);
      assert.match(await page.locator('#buildingSignalMarker').innerText(), /authored signal.*training only/is);
      await page.screenshot({ path: path.join(shots, 'muster-webgl-signal.png'), fullPage: false });
    }
    if (index === 3) {
      await page.locator('#backToBuilding').click();
      await page.waitForFunction(() => Number(document.querySelector('#buildingCanvas')?.dataset.renderWidth || 0) > 300);
      assert.equal(await page.locator('#buildingCanvas').getAttribute('data-route-state'), 'blocked');
      assert.match(await page.locator('#buildingRouteState').innerText(), /Stair A available.*Stair B unavailable/is);
      await page.screenshot({ path: path.join(shots, 'muster-webgl-route.png'), fullPage: false });
      await page.locator('#floorMode').click();
    }
    if (index === 4) {
      await page.locator('#backToBuilding').click();
      await page.waitForFunction(() => Number(document.querySelector('#buildingCanvas')?.dataset.renderWidth || 0) > 300);
      assert.equal(await page.locator('#buildingCanvas').getAttribute('data-route-state'), 'recorded');
      assert.match(await page.locator('#buildingRouteState').innerText(), /Stair A recorded.*Stair B unavailable/is);
      await page.screenshot({ path: path.join(shots, 'muster-webgl-route-recorded.png'), fullPage: false });
      await page.locator('#floorMode').click();
    }
    if (index === 1) assert.ok(await page.locator('#floorView').isVisible());
  }
  await page.waitForFunction(() => !document.querySelector('#reportPanel').hidden);

  await page.locator('#backToBuilding').click();
  await page.locator('[data-plan-floor="12"]').click();
  assert.match(await page.locator('#buildingStatus').innerText(), /Reference training plan/i);
  await page.locator('#enterFloorButton').click();
  assert.match(await page.locator('#floorPlanHeading').innerText(), /F12 · Care suite/);
  await page.locator('#backToBuilding').click();
  await page.locator('[data-plan-floor="7"]').click();
  await page.locator('#enterFloorButton').click();

  await page.locator('#drawRouteButton').click();
  const plan = page.locator('#floorPlan');
  const planBox = await plan.boundingBox();
  assert.ok(planBox);
  await page.mouse.move(planBox.x + planBox.width * .77, planBox.y + planBox.height * .65);
  await page.mouse.down();
  await page.mouse.move(planBox.x + planBox.width * .23, planBox.y + planBox.height * .79, { steps: 14 });
  await page.mouse.up();
  await page.waitForFunction(() => document.querySelector('#userRoute')?.classList.contains('active'));
  await page.waitForFunction(() => /reaches|stops before|unavailable/i.test(document.querySelector('#planGesture')?.textContent || ''));
  assert.ok(await page.locator('#userRoute.active').isVisible());
  assert.ok(await page.locator('#routeReceipt').isVisible());
  assert.match(await page.locator('#routeReceipt').innerText(), /Route analysis receipt/i);
  await page.locator('#toolButton').click();
  await page.locator('[data-tool-run="analyze_route_sketch"]').click();
  await page.waitForFunction(() => /30\.1 m/i.test(document.querySelector('#routeReceipt')?.textContent || ''));
  await page.locator('#closeTools').click();
  await page.evaluate(() => window.getSelection()?.removeAllRanges());
  assert.match(await page.locator('#routeReceipt').innerText(), /30\.1 m.*Stair A.*Reaches exit/is);
  assert.match(await page.locator('#traceInspector').innerText(), /why this call/i);
  assert.match(await page.locator('#traceInspector').innerText(), /Input/i);
  assert.match(await page.locator('#traceInspector').innerText(), /Output/i);
  assert.match(await page.locator('#traceInspector').innerText(), /Incident Commander/i);
  assert.match(await page.locator('#traceInspector').innerText(), /Visible page/i);
  await page.screenshot({ path: path.join(shots, 'muster-floor-route.png'), fullPage: false });
  await page.locator('.runtime-trace').screenshot({ path: path.join(shots, 'muster-live-trace.png') });

  await page.locator('#crewStrip [data-person-id="responder-s-tan"]').first().click();
  assert.match(await page.locator('#personDialog').innerText(), /Fictional exercise profile/i);
  await page.screenshot({ path: path.join(shots, 'muster-person-profile.png'), fullPage: false });
  await page.locator('#closePerson').click();
  await page.locator('#reportPanel').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(shots, 'muster-after-action-report.png'), fullPage: false });
  await page.locator('#approveButton').click();
  assert.match(await page.locator('#reportPanel').innerText(), /Human approved/);
  assert.match(await page.locator('#runtimeEvents').innerText(), /Human approval/i);
  assert.ok(await page.locator('[data-sequence-stage="review"].done').isVisible());

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const mobileErrors = [];
  mobile.on('console', (message) => { if (message.type() === 'error') mobileErrors.push(message.text()); });
  mobile.on('pageerror', (error) => mobileErrors.push(error.message));
  await mobile.goto(url, { waitUntil: 'networkidle' });
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, `mobile horizontal overflow: ${overflow}px`);
  assert.ok(await mobile.locator('#enterFloorButton').isVisible());
  await mobile.locator('#enterFloorButton').click();
  assert.ok(await mobile.locator('#floorView').isVisible());
  await mobile.screenshot({ path: path.join(shots, 'muster-mobile-spatial.png'), fullPage: false });

  const fallback = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await fallback.addInitScript(() => {
    Object.defineProperty(window, 'WebGLRenderingContext', { configurable: true, value: undefined });
  });
  await fallback.goto(url, { waitUntil: 'networkidle' });
  assert.equal(await fallback.locator('[data-building-floor]').count(), 18);
  assert.equal(await fallback.locator('#buildingViewport.webgl-ready').count(), 0);
  assert.ok(await fallback.locator('#buildingOrbit').isVisible());

  // A model-only floor must never strand the visitor or show a stale schematic.
  await fallback.locator('[data-building-floor="8"]').focus();
  await fallback.keyboard.press('Enter');
  assert.match(await fallback.locator('#buildingStatus').innerText(), /No schematic for this floor/i);
  assert.ok(await fallback.locator('#enterFloorButton').isHidden());
  assert.ok(await fallback.locator('#floorMode').isDisabled());
  assert.match(await fallback.locator('#resumeScenarioButton').innerText(), /Start scenario/);
  await fallback.locator('#launchScenarioButton').click();
  await fallback.waitForFunction(() => document.querySelector('#resumeScenarioButton')?.textContent.includes('Resume scenario'));
  assert.ok(await fallback.locator('#floorView').isVisible());
  assert.match(await fallback.locator('#floorPlanHeading').innerText(), /F07/);
  const savedBeforeResume = await fallback.evaluate(() => JSON.parse(localStorage.getItem('muster-demo-state-v2')));
  assert.equal(savedBeforeResume.status, 'running');
  assert.deepEqual(savedBeforeResume.injectIds, ['smoke']);
  await fallback.locator('#backToBuilding').click();
  await fallback.locator('[data-building-floor="8"]').focus();
  await fallback.keyboard.press('Enter');
  await fallback.locator('#resumeScenarioButton').click();
  const savedAfterResume = await fallback.evaluate(() => JSON.parse(localStorage.getItem('muster-demo-state-v2')));
  assert.deepEqual(savedAfterResume.injectIds, savedBeforeResume.injectIds);
  assert.deepEqual(savedAfterResume.decisions, savedBeforeResume.decisions);
  assert.equal(savedAfterResume.activity.length, savedBeforeResume.activity.length);
  assert.equal(savedAfterResume.ui.selectedFloor, 7);
  assert.ok(await fallback.locator('#floorView').isVisible());
  console.log('PASS · model-only Floor 08 recovers through Start/Resume without duplicate actions or lost progress');

  assert.deepEqual(errors, []);
  assert.deepEqual(mobileErrors, []);
  await browser.close();
  console.log('PASS · WebGL building exposes 18 selectable floors, raycast selection, orbit interaction, live route state, and a CSS fallback');
  console.log('PASS · Floor 07 opens, route analysis renders, and report remains human-approved');
  console.log('PASS · 390x844 mobile has no horizontal overflow or console errors');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
