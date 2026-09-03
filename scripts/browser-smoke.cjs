const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const shots = path.join(root, 'docs', 'screenshots');
const url = process.env.MUSTER_URL || 'http://127.0.0.1:4173';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  assert.equal(await page.locator('[data-building-floor]').count(), 18);
  assert.ok(await page.locator('#buildingView').isVisible());
  assert.ok(await page.locator('.site-plane').isVisible());
  assert.ok(await page.locator('.tower-podium').isVisible());
  assert.ok(await page.locator('.roof-plant').isVisible());
  assert.match(await page.locator('.site-plane').innerText(), /Assembly A/i);
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
  assert.ok(await page.locator('[data-sequence-stage="plan"].current').isVisible());

  await page.locator('#toolButton').click();
  await page.locator('[data-tool-card="inspect_zone"]').click();
  assert.match(await page.locator('#toolResult').innerText(), /example_input/);
  await page.screenshot({ path: path.join(shots, 'muster-tool-contracts.png'), fullPage: false });
  await page.locator('#rehearsalButton').click();
  assert.match(await page.locator('#guidedTitle').innerText(), /Read the visible plan/i);
  assert.ok(await page.locator('#reportPanel').isHidden());

  await page.locator('#guidedNextButton').click();
  await page.waitForFunction(() => /Start one authored signal/i.test(document.querySelector('#guidedTitle')?.textContent || ''));
  assert.ok(await page.locator('[data-sequence-stage="plan"].done').isVisible());
  assert.ok(await page.locator('[data-sequence-stage="signal"].current').isVisible());

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
  for (const expected of expectedSteps) {
    await page.locator('#guidedNextButton').click();
    await page.waitForFunction((pattern) => new RegExp(pattern, 'i').test(document.querySelector('#guidedTitle')?.textContent || ''), expected.source);
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

  assert.deepEqual(errors, []);
  assert.deepEqual(mobileErrors, []);
  await browser.close();
  console.log('PASS · 3D building exposes 18 selectable floors and supports orbit interaction');
  console.log('PASS · Floor 07 opens, route analysis renders, and report remains human-approved');
  console.log('PASS · 390x844 mobile has no horizontal overflow or console errors');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
